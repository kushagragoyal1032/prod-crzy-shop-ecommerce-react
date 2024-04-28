import slugify from "slugify";
import productModel from "../models/productModel.js";
import categoryModel from "../models/categoryModel.js";
import orderModel from "../models/orderModel.js";
import fs from 'fs'; // it require by formidable
import braintree from 'braintree';
import { request } from "http";
import { response } from "express";
import dotenv from 'dotenv';

dotenv.config();

// payment gateway
var gateway = new braintree.BraintreeGateway({
    environment: braintree.Environment.Sandbox,
    merchantId: process.env.BRAINTREE_MERCHANT_ID,
    publicKey: process.env.BRAINTREE_PUBLIC_KEY,
    privateKey: process.env.BRAINTREE_PRIVATE_KEY,
});

// create product
export const createProductController = async (req, res) => {
    try {
        const { name, description, price, category, quantity, shipping } = req.fields;
        const { photo } = req.files;
        //validation
        switch (true) {
            case !name:
                return res.status(400).send({ error: 'Name is required !' });
            case !description:
                return res.status(400).send({ error: 'Description is required!' });
            case !price:
                return res.status(400).send({ error: 'Price is required!' });
            case !category:
                return res.status(400).send({ error: 'Category is required!' });
            case !quantity:
                return res.status(400).send({ error: 'Quantity is required!' });
            case !photo && photo.size < 1000000:
                return res.status(400).send({ error: 'Photo is required and should be less than 1MB!' });
        }

        //save
        const product = new productModel({ ...req.fields, slug: slugify(name) })
        if (photo) {
            product.photo.data = fs.readFileSync(photo.path)
            product.photo.contentType = photo.type
        }
        await product.save();
        res.status(201).send({
            success: true,
            message: "Product Added Successfully",
            product
        })

    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            error,
            message: "Error while creating product"
        })
    }
};

// update product
export const updateProductController = async (req, res) => {
    try {
        const { name, description, price, category, quantity } = req.fields;
        const { photo } = req.files;
        //validation
        switch (true) {
            case !name:
                return res.status(400).send({ error: 'Name is required!' });
            case !description:
                return res.status(400).send({ error: 'Description is required!' });
            case !price:
                return res.status(400).send({ error: 'Price is required!' });
            case !category:
                return res.status(400).send({ error: 'Category is required!' });
            case !quantity:
                return res.status(400).send({ error: 'Quantity is required!' });
            case photo && photo.size > 1000000:
                return res.status(400).send({ error: 'Photo is required and should be less than 1MB!' });
        }

        //update and save
        const { pid } = req.params;
        const product = await productModel.findByIdAndUpdate(pid, { ...req.fields, slug: slugify(name) },
            { new: true });
        if (photo) {
            product.photo.data = fs.readFileSync(photo.path)
            product.photo.contentType = photo.type
        }
        await product.save();
        res.status(201).send({
            success: true,
            message: "Product Updated Successfully",
            product
        })

    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            error,
            message: "Error while updating product"
        });
    }
};

// get all products
export const getProductController = async (req, res) => {
    try {
        const product = await productModel.find({}).populate('category').select("-photo").limit(12).sort({ createdAt: -1 }) // here select is filter we dont want to get photos for reduce load
        res.status(201).send({
            success: true,
            totalCount: product.length,
            message: "Product Fetched Successfully",
            product
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            error,
            message: "Error while fetching all products"
        });
    }
};

// get single product
export const singleProductController = async (req, res) => {
    try {
        const { slug } = req.params;
        const product = await productModel.findOne({ slug }).populate('category').select("-photo")
        res.status(201).send({
            success: true,
            message: "Single Product Fetched Successfully",
            product
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            error,
            message: "Error while fetching single product"
        });
    }
};

// get product photo
export const productPhotoController = async (req, res) => {
    try {
        const product = await productModel.findById(req.params.pid).select("photo")
        if (product.photo.data) {
            res.set('Content-Type', product.photo.contentType);
            return res.status(200).send(product.photo.data);
        }
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            error,
            message: "Error while fetching product photo"
        });
    }
}

// delete product

export const deleteProductController = async (req, res) => {
    try {
        const { pid } = req.params;
        const product = await productModel.findByIdAndDelete(pid).select("-photo")
        res.status(201).send({
            success: true,
            message: "Product Deleted Successfully",
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            error,
            message: "Error while deleting product"
        });
    }
};

// filter product

export const productFilterController = async (req, res) => {
    try {
        const { boxchecked, radio } = req.body;
        let args = {};
        if (boxchecked?.length > 0) args.category = boxchecked
        if (radio?.length) args.price = { $gte: radio[0], $lte: radio[1] }
        const filteredProducts = await productModel.find(args)
        res.status(201).send({
            success: true,
            filteredProducts,
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            error,
            message: "Error while filtering product"
        });
    }
};

// product count

export const productCountController = async (req, res) => {
    try {
        const total = await productModel.find({}).estimatedDocumentCount()
        res.status(200).send({
            success: true,
            total,
        })
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            error,
            message: "Error while counting products"
        });
    }
}

// product list based on page

export const productListController = async (req, res) => {
    try {
        const perPage = 6;
        const page = req.params.page ? req.params.page : 1;
        const products = await productModel
            .find({})
            .select("-photo")
            .skip((page - 1) * perPage)
            .limit(perPage)
            .sort({ createdAt: -1 });
        res.status(200).send({
            success: true,
            products,
        })
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            error,
            message: "Error in per page control"
        });
    }
}

// search products

export const searchProductController = async (req, res) => {
    try {
        const { keyword } = req.params;
        const results = await productModel.find({
            $or: [
                { name: { $regex: keyword, $options: 'i' } }, // i means case insensitive
                { description: { $regex: keyword, $options: 'i' } }
            ]
        }).select("-photo");
        res.json(results);
        // now create search.js in context folder in frontend
    } catch (error) {
        res.status(500).send({
            success: false,
            error,
            message: "Error in searching product"
        });
    }
}

// similar products

export const relatedProductController = async (req, res) => {
    try {
        const { pid, cid } = req.params;
        const products = await productModel
            .find({
                category: cid,
                _id: { $ne: pid }, // ne means not include current product
            })
            .select("-photo")
            .limit(3)
            .populate("category");
        res.status(200).send({
            success: true,
            products
        })
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            error,
            message: "Error while getting related product"
        });
    }
}

// get categories wise products

export const productCategoryController = async (req, res) => {
    try {
        const category = await categoryModel.findOne({ slug: req.params.slug })
        const products = await productModel.find({ category }).populate('category')
        res.status(200).send({
            success: true,
            category,
            products
        })
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            error,
            message: "Error while getting products"
        });
    }
}

// get payment gateway token 

export const paymentTokenController = async (req, res) => {
    try {
        gateway.clientToken.generate({}, function (err, token) {
            if (err) {
                res.status(500).send(err);
            }
            else {
                res.send(token);
            }
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            error,
            message: "Error while getting payment token"
        });
    }
}

// payment

export const paymentController = async (req, res) => {
    try {
        const { cart, nonce } = req.body;
        let total = 0;
        cart.map((product) => {
            total += product.price;
        })
        let newTransaction = gateway.transaction.sale({
            amount: total,
            paymentMethodNonce: nonce,
            options: {
                submitForSettlement: true,
            },
        },
            function (error, result) {
                if (result) {
                    const order = new orderModel({
                        products: cart,
                        payment: result,
                        buyer: req.user._id
                    }).save()
                    res.json({ ok: true })
                } else {
                    res.status(500).send(error)
                }
            }
        )
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            error,
            message: "Error while payment"
        });
    }
}