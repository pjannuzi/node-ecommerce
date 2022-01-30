const Product = require('../models/product');

exports.getAddProduct = (req, res, next) => {
    res.render('admin/edit-products', {
        pageTitle:'Adicionar Produto',
        path: '/admin/edit-products',
        editing: false
    });
};

exports.postAddProduct = (req, res, next) => {
    const title = req.body.title;
    const imageUrl = req.body.imageUrl;
    const price = req.body.price;
    const description = req.body.description;
    req.user.createProduct({
        title: title,
        price: price,
        imageUrl: imageUrl,
        description: description
    })
    .then(result => {
        console.log('Product Added');
        res.redirect('/admin/products');
    })
    .catch(err => {
        console.log(err);
    });
};

exports.getEditProduct = (req, res, next) => {
    const editMode = req.query.edit;
    if(!editMode){
       return res.redirect('/');
    }
    const prodId = req.params.productId;
    req.user.getProducts({where: { id: prodId}})
      .then(products => {
        const product = products[0];
        if (!product) {            
            return res.redirect('/');
        }
        res.render('admin/edit-products', {
            pageTitle:'Editar Produto',
            path: '/admin/edit-products',
            editing: editMode,
            product: product
        });
      })
      .catch(err => console.log('Erro:', err));
};
 
exports.postEditProduct = (req, res, next) => {
    const prodId = req.body.productId;
    const updatedTitle = req.body.title;
    const updatedImageUrl = req.body.imageUrl;
    const updatedPrice = req.body.price;
    const updatedDescription = req.body.description;
    Product.findByPk(prodId)
    .then(product => {
        product.title = updatedTitle;
        product.price = updatedPrice;
        product.imageUrl = updatedImageUrl;
        product.description = updatedDescription;
        return product.save();
    })
    .then(result =>{
        console.log('Updated Product');
        res.redirect('/admin/products');
    })
    .catch(err => console.log(err));
    
}

exports.getDeleteProduct = (req, res, next) => {
    res.redirect('/admin/products');
}

exports.postDeleteProduct = (req, res, next) => {
    
    const prodId = req.body.productId;
    Product.findByPk(prodId)
    .then(product => {
        return product.destroy();
    })
    .then(result => {
        console.log('Destroyed Product');
        res.redirect('/admin/products');
    })
    .catch(err => console.log(err));
    
}

exports.adminProducts = (req, res, next) => {
    req.user
    .getProducts()
    .then(products =>{
        res.render('admin/products', {
            prods: products,
            pageTitle: 'Admin',
            path: '/admin/products',
        });
    })
    .catch(err => console.log(err)); 
};