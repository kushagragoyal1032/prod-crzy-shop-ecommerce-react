import express from 'express';
import { isAdmin, requireSignIn } from '../middlewares/authMiddleware.js';
import { categoryController, createCategoryController, deleteCategoryController, singleCategoryController, updateCategoryController } from '../controllers/categoryController.js';

const router = express.Router();

//routes
//create category route
router.post('/create-category', requireSignIn, isAdmin, createCategoryController);

//update category route
router.put('/update-category/:id', requireSignIn, isAdmin, updateCategoryController);


//fetch all categories route
router.get('/get-category', categoryController); // here not us of middleware bcz we need to show category if user login or not 

//fetch single category route
router.get('/single-category/:slug', singleCategoryController);

//delete category route
router.delete('/delete-category/:id', requireSignIn, isAdmin, deleteCategoryController);

export default router