import asyncHandler from "../utils/asyncHandler.js"
import ApiError from "../utils/ApiErrors.js";
import ApiResponse from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import uploadOnCloudinary from "../utils/cloudinary.js";
import jwt from "jsonwebtoken";

// method to generate access tokens and refresh tokens
const generateAccessAndRefreshTokens = async(userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({validateBeforeSave: false});

        return {accessToken, refreshToken};

    } catch (error) {
        throw new ApiError(500, error?.message||"Something went wrong while generating access and refresh tokens");
    }
} 

//  ...................  Register User  ....................

const registerUser = asyncHandler( async (req , res) => {
    // get user details from frontend
    // validation  - not empty
    // check if user already exist: username, email
    // check for images, check for avatar
    // upload them on cloudinary, avatar
    // create user object - create entry in db
    // remove password and refresh token fields from response
    // check for user creation
    // return res

    const{username, email, fullname, password} = req.body;
    
    if([fullname, email, username, password].some((field) => field?.trim() === "")){
        throw new ApiError(400, "All fileds are required");
    }

    const existedUser = await User.findOne({
        $or: [{ username }]
    })

    if(existedUser){
        throw new ApiError(409, "User with email and username already exist");
    }

    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImageLocalPath = req.files?.coverImage[0]?.path;

    if(!avatarLocalPath){
        throw new ApiError(400, " avatar file is required");
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);
    
    if(!avatar){
        throw new ApiError(400, "avatar file required");
    }

    const user = await User.create({
        fullname,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email, // same as writing email: email and same with fullname
        password,
        username: username.toLowerCase()
    })

    const createdUser = await User.findById(user._id).select("-password -refreshToken");

    if(!createdUser){
        throw new ApiError(500, "Something went wrong while registering the user");
    }

    return res.status(200).json( new ApiResponse(
        200, createdUser, "User registered successfully", 200
    ));

})


// ***********************   Login User   **********************

// get user details from req.body
// take out email or username
// check if user already has an account or not
// check password
// generate access and refresh tokens and send them to user
// send cookies

const loginUser = asyncHandler(async(req, res) => {
    console.log("this is req.body from login route: ", req.body);
    const { email, username, password } = req.body;

    if (!(username || email)) {
        throw new ApiError(400, "E-mail or username is required");
    }

    const user = await User.findOne({
        $or: [{ username }, { email }]
    });

    if (!user) {
        throw new ApiError(404, "User doesn't exist");
    }

    const validPassword = await user.isPasswordCorrect(password);

    if (!validPassword) {
        throw new ApiError(401, "Invalid user credentials");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);
    
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");
    console.log(loggedInUser);

    const options = {
        httpOnly: true,
        secure: true
    };

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    user: loggedInUser, accessToken, refreshToken
                },
                "User logged in successfully"
            )
        );
})

//*********************  LogOut  ***************************

    // clear cookies
    // clear saved refresh Token
const logOutUser = asyncHandler(async(req, res) => {
        await User.findByIdAndUpdate(
            req.user._id,
            {
                $set:{
                    refreshToken: undefined
                },
            },
            {
                new: true
            }
        )
        const options= {
            httpOnly: true,
            secure: true
        }

        return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "User loggedOut successfully"));
}) 

// end-point for refreshing access token through refresh token

const refreshAccessToken = asyncHandler( async(req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;
    if( !incomingRefreshToken ){
        throw new ApiError(401, " unauthorizded request");
    }
    const decodedToken = jwt.verify(
        incomingRefreshToken,
        process.env.REFRESH_TOKEN_SECRET
    )
    const user = await User.findById(decodedToken?._id);
    if(!user){
        throw new ApiError(401, "Invalid RefreshToken");
    }
    console.log(decodedToken);
    console.log(user.refreshToken);
    if(decodedToken !== user.refreshToken){
        throw new ApiError(401, " Resfresh Token expired or used")
    }

    const {accessToken, refreshToken} = generateAccessAndRefreshTokens(user._id);

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(
            200,
            {accessToken, refreshToken},
            ""
        )
    )

     
})

export { registerUser, loginUser, logOutUser};