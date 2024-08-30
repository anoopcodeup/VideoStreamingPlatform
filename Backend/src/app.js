import cookieParser from 'cookie-parser';
import express from 'express';
import cors from "cors";  

const app = express();
//using middlewares
// for accessing CORS
app.use(cors());
//to accept JSON values
app.use(express.json({limit: "16kb"}));
// to take values from URL
app.use(express.urlencoded({extended: true, limit: "16kb"}));
// to use static files from public
app.use(express.static("public"));
// to access and change client's cookies
app.use(cookieParser());


// Routes import
import userRouter from './routes/user.routes.js';

//routes declaration
app.use("/api/v1/users", userRouter);


export default app; 