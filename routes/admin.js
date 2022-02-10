const express = require('express');
const { check, body } = require('express-validator');

const adminController = require('../controllers/admin')
const isAuth = require('../middleware/is-auth');

const router = express.Router();

router.get('/add-product', isAuth, adminController.getAddProduct);

router.post('/add-product', [
    body('title').isString().isLength({min: 3}).trim().withMessage('Titulo fora do formato correto!'),
    body('imageUrl').isURL().withMessage('A imagem precisa ser uma URL'),
    body('price').isFloat().withMessage('O preço precisa ser um número, você pode separar as dezenas com um "."!'),
    body('description').isLength({min: 8, max: 400}).trim().withMessage('Descrição fora do formato correto!')
], isAuth, adminController.postAddProduct);

router.get('/products', isAuth, adminController.adminProducts);

router.get('/edit-products/:productId', isAuth, adminController.getEditProduct);

router.post('/edit-products', [
    body('title').isString().isLength({min: 3}).trim().withMessage('Titulo fora do formato correto!'),
    body('imageUrl').isURL(),
    body('price').isFloat(),
    body('description').isLength({min: 8, max: 400}).trim()
], isAuth, adminController.postEditProduct);

router.post('/delete-product', isAuth, adminController.postDeleteProduct);

module.exports = router;