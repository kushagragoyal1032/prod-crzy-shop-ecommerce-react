import mongoose from "mongoose";

const connectDB = async ()=>{
    try{
        const conn = await mongoose.connect(process.env.MONGO_URL)
        console.log(`Connected To Mongodb Database ${conn.connection.host}`.bgMagenta.white);
    } catch(e){
        console.log(`Error in mongodb ${e}`.bgRed.white);
    }
}

export default connectDB;