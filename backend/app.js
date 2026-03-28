import express from "express"
import userRouter from "./routes/user.routes.js"
import courseRouter from "./routes/course.routes.js"
import cookieParser from "cookie-parser"
import cors from "cors"

const app = express()


app.get("/", (req, res) => {

    res.send("Server working")
})
app.use(
    cors(
        {
            origin: [process.env.CORS_ORIGIN, "http://localhost:5174", "http://localhost:5173"],
            credentials: true
        }
    )
)//remember proxy?



app.use(express.json({limit: "16kb"}))//converts json into js
app.use(express.urlencoded({extended: true, limit: "16kb"} ))//converts url data
app.use(express.static("public"))//serves file that dont change on server that are images,etc


import academicRouter from "./routes/uploadAcademic.routes.js"

//routes declaration
app.use(cookieParser())
app.use("/api/v1/users", userRouter)
app.use("/api/v1/courses", courseRouter)
app.use("/api/v1/calendar", academicRouter)


export {app}