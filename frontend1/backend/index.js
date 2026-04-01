/*The below code also works fine but it reduces the consistency of the code so following 
this code format Modify the dev in package.json
require ('dotenv').config({path: './env'})*/


import dotenv from "dotenv"
import connectDB from"./db/index.js"
import {app} from "./app.js"

dotenv.config({
    path:'./.env'
})



connectDB()
.then(()=>{
    app.listen(process.env.PORT || 2000, ()=>{
        console.log(`Server is running at port : ${process.env.PORT}`);
    })
})
.catch((err) =>{
    console.log("MONGO DB connection failed !!! ", err)
})
  

