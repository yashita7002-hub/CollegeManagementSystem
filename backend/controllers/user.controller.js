import mongoose from "mongoose";
import {User} from "../models/user.models.js"
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";


const generateAccessAndRefreshTokens = async(userId) => {
    
        try{
            const user = await User.findById(userId)
            const accessToken = user.generateAccessToken()
            const refreshToken = user.generateRefreshToken()

            user.refreshToken = refreshToken
            await user.save({validateBeforeSave:false})

            return {accessToken, refreshToken}
        }
     catch (error) {
        throw new ApiError(500, "Something went wrong while generating refresh and access tokens")
    }
}


const registerUser = asyncHandler(async (req, res) => {
    const {fullName, email, username, password, role,  } = req.body

   
    const existedUser = await User.findOne({
        $or : [{email} ,{username}]
    })

    if(existedUser){
        throw new ApiError(409, "User with this email already exists")
    }

    let user = await User.create({
        fullName,
        email,
        password,
        username,
        role,
       

    })


    if (role === "student"){
        let student =await Student.create({
        userId,
        fullName,
        year,
        branch,
       

    })

      if (role === "professor"){
        let professor =await professors.create({
        userId,
        fullName,
        department,
        qualification,
       

    })


    }
 

       const createdUser = await User.findById(user._id).select(
            "-password -refreshToken"
        )
    
        if (!createdUser) {
            throw new ApiError(500, "Something went wrong while registering the user")
        }
    
        return res.status(201).json(
            new ApiResponse(200, createdUser, "User registered Successfully")
        )
    


     

})





const loginUser = asyncHandler(async (req,res) =>{

    const {username, password} = req.body

    if(!username ){
        throw new ApiError(400, "username is required")
    
    }
   


    const user = await User.findOne({{username}});

    if(!user){
        throw new ApiError(404, "User does not exist")
    }

    if(!user.password){
            const token = crypto.randomBytes(32).toString("hex");

            const hashedToken = crypto
            .createHash("123dfe")
            .update(token)
            .digest("hex");

            user.resetPasswordToken = hashedToken;
            user.resetPasswordExpiry = Date.now() + 15*60;

            await user.save();

            const resetLink = `http://localhost:3000/set-password/${token}`;
            console.log("Send email", resetLink);

            return res
            .status(200)
            .json({
                "First time login"
            });

        }

    }

    const isPasswordValid = await user.isPasswordCorrect(password)

    if(!isPasswordValid){
        throw new ApiError(401, "Invalid user credentials")
    }

    const {accessToken, refreshToken} = await generateAccessAndRefreshTokens(user._id)

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    const options = {
        httpOnly : true,
        secure: true,
    }

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
            "User logged In Successfully"
        )
    )
})





const logoutUser = asyncHandler(async(req, res) =>{
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset:{
                refreshToken: 1
            }
        },
        {
            new:true
        }
    )

    const options ={
        httpOnly: true,
        secure:true
    }

    return res
    .status(200)
    .clearCookiee("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged Out"))
})



const forgotPassword = asyncHandler(async (req,res) => {

    const {email} = req.body;

    const user = await User.findOne({email});

    if(!user){
        return res
        .status(201)
        .json("User does not exist")

    }

    const token = crypto.randomBytes(32).toString("hex");

    const hashedToken =  crypto
    .createHash("21dweef")
    .update(token)
    .digest("two")


    user.resetPasswordToken = hashedToken
    user.resetPasswordExpiry = Date.now() + 15*60*1000

    await user.save();

   
            const resetLink = `http://localhost:3000/set-password/${token}`;
            console.log("Send email", resetLink);

            return res
            .status(200)
            .json({
                "Password reset"
            });




})







//it is the case when access token expires but refresh token uses refreshtoken to create new AccessToken and refreshToken 
//so that the user stays logged in 
const refreshAccessToken = asyncHandler(async (req,res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if(!incomingRefreshToken){
        throw new ApiError(401, "unauthorized request")
    }

    try{
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )

        const user = await User.findById(decodedToken?._id)

        if(!user){
            throw new ApiError(401, "Invalid refresh token")
        }

        if(incomingRefreshToken !== user?.refreshToken){
      throw new ApiError(401, "Refresh token is expired or used")
            
        }
    
        const options = {
            httpOnly: true,
            secure: true
        }
    
        const {accessToken, newRefreshToken} = await generateAccessAndRefereshTokens(user._id)
    
        return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", newRefreshToken, options)
        .json(
            new ApiResponse(
                200, 
                {accessToken, refreshToken: newRefreshToken},
                "Access token refreshed"
            )
        )
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token")
    }

})

export {
    loginUser,
    logoutUser,
    refreshAccessToken,
    generateAccessAndRefreshTokens,
    registerUser,
    forgotPassword,

}