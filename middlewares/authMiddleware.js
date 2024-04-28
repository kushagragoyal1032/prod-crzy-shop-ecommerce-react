import JWT from "jsonwebtoken";
import userModel from "../models/userModel.js";

//Proteced Routes token base
export const requireSignIn = async (req, res, next) => { // here next will execute then res will be sent
   try {
    const decode = JWT.verify(
        req.headers.authorization, 
        process.env.JWT_SECRET
    );
    req.user = decode;
    next(); // next means passing to other middleware
   } catch (error) {
    console.log(error);
    res.status(401).send({
        status: false,
        message: "Encountered error in Athorization middleware",
        error
    })
   }
};

//admin access (if user role is 1 means admin)
export const isAdmin = async (req, res, next) =>{
    try {
        const user = await userModel.findById(req.user._id)
        if(user.role !== 1){
            return res.send({
                status: false,
                message: "UnAuthorized Access"
            })
        }
        else{
            next(); 
        }
    } catch (error) {
        console.log(error);
        res.status(401).send({
            status: false,
            message: "error in admin middleware",
            error
        })
    }
}