import "dotenv/config";
import mongoose from "mongoose";
import connectDB from "./db/index.js";
import app from "./app.js";


const PORT = process.env.PORT;
connectDB()
.then(() => {
    app.listen(PORT, () => {
        console.log(`app is listening on ${PORT}`);
    })
})
.catch((error) => {
    console.log("The app failed to connect with MongoDB!!! ", error);
})









/*
import express from "express";
const app = express();

;(async () =>  {
    try{
        await mongoose.connect(`${process.env.DB_URI}/${DB_NAME}`);
        //to show error: DB connected but not able to talk to app
        app.on("error", (error)=>{
            console.log("ERR : ", error);
            throw error;
        })

         app.listen(process.env.PORT, () => {
            console.log(`App is istening on port ${process.env.PORT}`);
         })
    }
    catch(error) {
        console.log("ERROR :", error);
    }
})()
*/