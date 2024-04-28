import express from "express";
import {registerController, loginController, testController, forgotPasswordController, updateProfileController, getOrdersController, getAllOrdersController, orderStatusController} from "../controllers/authController.js" 
import { requireSignIn, isAdmin } from "../middlewares/authMiddleware.js";

//router object (when we do route in specific file than router object require)
const router = express.Router()

//routing
//REGISTER || METHOD POST
router.post('/register', registerController) // create in authController.js

//LOGIN || METHOD POST
router.post('/login', loginController)

//FORGOT PASSWORD || METHOD POST
router.post('/forgot-password', forgotPasswordController)

//test routes
router.get('/test', requireSignIn, isAdmin, testController) // here requiresSignIn, isAdmin is middleware

// procted user route auth 
router.get('/user-auth', requireSignIn, (req, res) =>{
    res.status(200).send({ok: true});
});

// procted admin route auth 
router.get('/admin-auth', requireSignIn, isAdmin ,(req, res) =>{
    res.status(200).send({ok: true});
});

// update profile
router.put('/profile', requireSignIn, updateProfileController)

// get orders route
router.get('/orders', requireSignIn, getOrdersController);

// get all orders route
router.get('/all-orders', requireSignIn, isAdmin, getAllOrdersController);

// order status update route
router.put('/order-status/:orderId', requireSignIn, isAdmin, orderStatusController);

export default router