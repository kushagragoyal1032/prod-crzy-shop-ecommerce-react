import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
    },
    slug:{ // this for seo enhancement ex - /category data -> /category-data -> 
        type: String,
        lowercase: true,
    }
});

export default mongoose.model("Category", categorySchema);