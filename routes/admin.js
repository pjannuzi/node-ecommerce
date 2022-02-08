const path = require('path');
const express = require('express');

const adminController = require('../controllers/admin')
const isAuth = require('../middleware/is-auth');

const router = express.Router();

router.get('/add-product', isAuth, adminController.getAddProduct);

router.post('/add-product', isAuth, adminController.postAddProduct);

router.get('/products', isAuth, adminController.adminProducts);

router.get('/edit-products/:productId', isAuth, adminController.getEditProduct);

router.post('/edit-products', isAuth, adminController.postEditProduct);

router.post('/delete-product', isAuth, adminController.postDeleteProduct);

module.exports = router;