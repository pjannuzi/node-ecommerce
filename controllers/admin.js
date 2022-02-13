const Product = require('../models/product');
const fileHelper = require('../util/file');
const { validationResult } = require('express-validator');

exports.getAddProduct = (req, res, next) => {
    res.render('admin/edit-products', {
        pageTitle: 'Adicionar Produto',
        path: '/admin/edit-products',
        editing: false,
        hasError: false,
        errorMessage: null,
        validationErros: []
    });
};

exports.postAddProduct = (req, res, next) => {
    const title = req.body.title;
    const image = req.file;
    const price = req.body.price;
    const description = req.body.description;
    const errors = validationResult(req);
    if (!image) {
        return res.status(422).render('admin/edit-products', {
            pageTitle: 'Adicionar Produto',
            path: '/admin/add-products',
            editing: false,
            hasError: true,
            product: {
                title: title,
                price: price,
                description: description
            },
            errorMessage: 'O arquivo não é uma imagem.',
            validationErros: []
        });
    }

    const imageUrl = image.path; 

    if(!errors.isEmpty()){
        return res.status(422).render('admin/edit-products', {
            pageTitle: 'Adicionar Produto',
            path: '/admin/add-products',
            editing: false,
            hasError: true,
            product: {
                title: title,
                price: price,
                description: description
            },
            errorMessage: errors.array()[0].msg,
            validationErros: errors.array()
        });
    }

    const product = new Product({ title: title, imageUrl: imageUrl, price: price, description: description, userId: req.user});
    product
        .save()
        .then(result => {
            res.redirect('/admin/products');
        })
        .catch(err => {
            res.redirect('/500');
        });
};

exports.getEditProduct = (req, res, next) => {
    const editMode = req.query.edit;
    if (!editMode) {
        return res.redirect('/');
    }
    
    const prodId = req.params.productId;
    Product.findById(prodId)
        .then(product => {
            if (!product) {
                return res.redirect('/');
            }
            res.render('admin/edit-products', {
                pageTitle: 'Editar Produto',
                path: '/admin/edit-products',
                editing: editMode,
                product: product,
                hasError: false,
                errorMessage: null,
                validationErros: []
            });
        })
        .catch(err => console.log('Erro:', err));
};

exports.postEditProduct = (req, res, next) => {
    const prodId = req.body.productId;
    const updatedTitle = req.body.title;
    const image = req.file;
    const updatedPrice = req.body.price;
    const updatedDescription = req.body.description;
    const errors = validationResult(req);

    if(!errors.isEmpty()){
        return res.render('admin/edit-products', {
            pageTitle: 'Editar Produto',
            path: '/admin/edit-products',
            editing: true,
            hasError: true,
            product: {
                title: updatedTitle,
                price: updatedPrice,
                description: updatedDescription,
                _id: prodId
            },
            errorMessage: errors.array()[0].msg,
            validationErros: errors.array()
        });
    }

    Product.findById(prodId)
    .then(product => {
        if (product.userId.toString() !== req.user._id.toString()) {
            return res.redirect('/');
        }
        product.title = updatedTitle;
        product.price = updatedPrice;
        product.description = updatedDescription;
        if (image) {
            fileHelper.deleteFile(product.imageUrl);
            product.imageUrl = image.path;
        }
        return product.save().then(result => {
            res.redirect('/admin/products');
        })
    })
    .catch(err => console.log(err));
}

exports.postDeleteProduct = (req, res, next) => {
    const prodId = req.body.productId;
    Product.findById(prodId)
    .then(product => {
        if (!product){
            return next(new Error('Produto não encontrado'));
        }
        fileHelper.deleteFile(product.imageUrl);
        return  Product.deleteOne({ _id: prodId, userId: req.user._id })
    }).then(() => {
        res.redirect('/admin/products');
    })
    .catch(err => console.log(err));
}

exports.adminProducts = (req, res, next) => {
    Product.find({userId: req.user._id})
        .then(products => {
            res.render('admin/products', {
                prods: products,
                pageTitle: 'Admin',
                path: '/admin/products',
            });
        })
        .catch(err => console.log(err));
};