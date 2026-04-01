import express from "express"
import cookieParser from "cookie-parser"
import cors from "cors"
import userRouter from "./routes/user.routes.js"
import courseRouter from "./routes/course.routes.js"
import academicRouter from "./routes/uploadAcademic.routes.js"
import attendanceRouter from "./routes/attendance.routes.js"
import assignmentRouter from "./routes/assignment.routes.js"
import submissionRouter from "./routes/submission.routes.js"
import gradeRouter from "./routes/grade.routes.js"

const app = express()

app.get("/", (req, res) => {
    res.send("Server working")
})

app.use(
    cors({
        origin: [process.env.CORS_ORIGIN, "http://localhost:5174", "http://localhost:5173"],
        credentials: true
    })
)

app.use(express.json({limit: "16kb"}))
app.use(express.urlencoded({extended: true, limit: "16kb"} ))
app.use(express.static("public"))
app.use(cookieParser())

//routes declaration
app.use("/api/v1/users", userRouter)
app.use("/api/v1/courses", courseRouter)
app.use("/api/v1/calendar", academicRouter)
app.use("/api/v1/attendance", attendanceRouter)
app.use("/api/v1/assignments", assignmentRouter)
app.use("/api/v1/submissions", submissionRouter)
app.use("/api/v1/grades", gradeRouter)

app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
        success: false,
        message: err.message || "Internal Server Error",
        errors: err.errors || []
    });
});

export {app}
