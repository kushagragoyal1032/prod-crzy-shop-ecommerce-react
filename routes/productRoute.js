import express from 'express';
import { isAdmin, requireSignIn } from '../middlewares/authMiddleware.js';
import { createProductController, deleteProductController, getProductController, paymentController, paymentTokenController, productCategoryController, productCountController, productFilterController, productListController, productPhotoController, relatedProductController, searchProductController, singleProductController, updateProductController } from '../controllers/productController.js';
import formidable from 'express-formidable'

const router = express.Router();

//routes
//create product route
router.post('/create-product', requireSignIn, isAdmin, formidable(), createProductController);

// update product route
router.put('/update-product/:pid', requireSignIn, isAdmin, formidable(), updateProductController);

//fetch all product route
router.get('/get-product', getProductController); // here not us of middleware bcz we need to show product if user login or not 

//fetch single product route
router.get('/single-product/:slug', singleProductController);

// fetch product photo
router.get('/product-photo/:pid', productPhotoController);

//delete product route
router.delete('/delete-product/:pid', requireSignIn, isAdmin, deleteProductController);

//filter product route
router.post('/product-filters', productFilterController);

// filter count - for applying pagination to load limited prodcuts to home page
router.get('/product-count', productCountController);

// product per page 
router.get('/product-list/:page', productListController);

// search product route
router.get('/search/:keyword', searchProductController);

// similar product route
router.get('/related-product/:pid/:cid', relatedProductController);

// category wise product
router.get('/product-category/:slug', productCategoryController);

// payment token route
router.get('/braintree/token', paymentTokenController);

// payments route
router.post('/braintree/payment', requireSignIn, paymentController);

export default router