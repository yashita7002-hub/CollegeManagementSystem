import {Router} from "express"
import {
    loginUser,
    logoutUser,
     refreshAccessToken,
     generateAccessAndRefreshTokens,
     registerUser,

} from "../controllers/user.controller.js"
import { verifyJWT } from "../middlewares/Auth.middleware.js"

const router = Router()


router.route("/login").post(loginUser)
router.route("/logout").post(verifyJWT, logoutUser)
 router.route("/refresh-token").post(refreshAccessToken)
 router.route("/register").post(registerUser)

 export default router