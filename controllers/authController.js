import { response } from "express";
import { comparePassword, hashPassword } from "../helpers/authHelper.js";
import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js"
import JWT from "jsonwebtoken";

// POST register
export const registerController = async (req, res) => {
    try {
        const { name, email, password, phone, address, answer } = req.body
        //validation
        if (!name) {
            return res.send({ message: 'Name is Required!' })
        }
        if (!email) {
            return res.send({ message: 'Email is Required!' })
        }
        if (!password) {
            return res.send({ message: 'Password is Required!' })
        }
        if (!phone) {
            return res.send({ message: 'Phone is Required!' })
        }
        if (!address) {
            return res.send({ message: 'Address is Required!' })
        }
        if (!answer) {
            return res.send({ message: 'Answer is Required!' })
        }
        //check user
        const existingUser = await userModel.findOne({ email })
        //existing user
        if (existingUser) {
            return res.status(200).send({
                success: false,
                message: "Already Register! Please login.."
            })
        }
        //register user
        const hashpassword = await hashPassword(password)
        //save
        const user = await new userModel({ name, email, password: hashpassword, phone, address, answer }).save()
        res.status(201).send({
            success: true,
            message: "Register Successfully",
            user
        })
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: "Error in Resgistration",
            error
        })
    }
}

// POST login
export const loginController = async (req, res) => {
    try {
        const { email, password } = req.body;
        //validation
        if (!email || !password) {
            return res.status(404).send({
                success: false,
                message: "Email and Password is Required!"
            });
        }
        //check user
        const user = await userModel.findOne({ email })
        if (!user) {
            return res.status(404).send({
                success: false,
                message: "Email is not registered!"
            });
        }
        const match = await comparePassword(password, user.password)
        if (!match) {
            return res.status(300).send({
                success: false,
                message: "Password is incorrect!"
            });
        }
        //create token
        const token = JWT.sign({ _id: user._id }, process.env.JWT_SECRET, {
            expiresIn: '7d',
        }); // this is synchronous so no need of await
        res.status(200).send({
            success: true,
            message: "Login Successfully",
            user: {
                name: user.name,
                email: user.email,
                phone: user.phone,
                address: user.address,
                role: user.role
            },
            token,

        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: "Error in Login",
            error
        });
    }
};

// POST /forgot-password
export const forgotPasswordController = async (req, res) => {
    try {
        const { email, answer, newpassword } = req.body;
        if (!email) {
            res.status(400).send({
                message: "Email is required !"
            })
        }
        if (!answer) {
            res.status(400).send({
                message: "answer is required!"
            })
        }
        if (!newpassword) {
            res.status(400).send({
                message: "New Password is required!"
            })
        }
        //check email and password
        const user = await userModel.findOne({ email, answer })
        if (!user) {
            return res.status(404).send({
                success: false,
                message: "Wrong Email or Answer !"
            });
        }
        const hashpassword = await hashPassword(newpassword);
        await userModel.findByIdAndUpdate(user._id, { password: hashpassword });
        res.status(200).send({
            success: true,
            message: "Password reset successfully"
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: "Something went wrong",
            error
        });
    }
}

//test controller
export const testController = (req, res) => {
    res.send("protected route (admin user)");
};

// profile update controller
export const updateProfileController = async (req, res) => {
    try {
        const { name, email, password, address, phone } = req.body;
        const user = await userModel.findOne({ email });
        if (password && password.length < 6) {
            return res.json({ message: "Password must be at least 6 characters" });
        }
        let hashedPassword = password ? await hashPassword(password) : undefined;
        const updateduser = await userModel.findByIdAndUpdate(
            user._id,
            {
                name: name || user.name,
                email: email || user.email,
                password: hashedPassword || user.password,
                address: address || user.address,
                phone: phone || user.phone
            },
            { new: true }
        );
        res.status(200).send({
            success: true,
            message: "Profile Updated Successfully",
            updateduser,
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: "Something went wrong while updating profile",
            error
        });
    }
}

// order route
export const getOrdersController = async (req, res) => {
    try {
        const orders = await orderModel.find({ buyer: req.user._id }).populate("products", "-photo").populate("buyer", "name");
        res.json(orders);
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: "Something while getting orders",
            error
        });
    }
}

// all orders route
export const getAllOrdersController = async (req, res) => {
    try {
        const orders = await orderModel.find({}).populate("products", "-photo").populate("buyer", "name").sort({ createAt: "-1" });
        res.json(orders);
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: "Something while getting all orders",
            error
        });
    }
}

// update order status
export const orderStatusController = async (req, res) => {
    try {
        const { orderId } = req.params
        const { status } = req.body
        const orders = await orderModel.findByIdAndUpdate(orderId, { status }, { new: true });
        res.json(orders);
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: "Something while updating order status",
            error
        });
    }
}