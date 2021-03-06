const path = require('path');
const express = require('express');

const adminController = require('../controllers/admin')

const router = express.Router();

router.get('/add-product', adminController.getAddProduct);

router.post('/add-product', adminController.postAddProduct);

router.get('/products', adminController.adminProducts);

router.get('/edit-products/:productId', adminController.getEditProduct);

router.post('/edit-products', adminController.postEditProduct);

router.post('/delete-product', adminController.postDeleteProduct);

router.get('/delete-product', adminController.getDeleteProduct);

module.exports = router;