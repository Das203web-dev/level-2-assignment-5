import { NextFunction, Request, Response } from "express";
import { catchAsyncFunction } from "../../utils/catchAsync";
import { handleResponse } from "../../utils/handleResponse";
import passport from "passport";
import { getJwtToken } from "../../utils/getJwtToken";
import httpStatus from "http-status-codes";
import { setTokenIntoCookies } from "../../utils/setToken";
import { AuthService } from "./auth.service";
import AppError from "../../errorHelpers/AppError";
import { JwtPayload } from "jsonwebtoken";

const handleUserLogin = catchAsyncFunction(async (req: Request, res: Response, next: NextFunction) => {
    passport.authenticate("local", (err: any, user: any, info: any) => {
        if (err) {
            return next(err)
        }
        if (!user) {
            throw new AppError(httpStatus.NOT_FOUND, info.message)
        }
        delete user.toObject().password;
        const { password, ...userWithoutPassword } = user.toObject()
        const userToken = getJwtToken(userWithoutPassword);
        setTokenIntoCookies(res, userToken)
        handleResponse(res, {
            statusCode: httpStatus.CREATED,
            success: true,
            message: "User login successful",
            data: {
                accessToken: userToken.accessToken,
                refreshToken: userToken.refreshToken,
                user: userWithoutPassword
            }
        })
    })(req, res, next)
})
const handleUserLogout = catchAsyncFunction(async (req: Request, res: Response, next: NextFunction) => {
    res.clearCookie("accessToken", {
        httpOnly: true,
        secure: false,
        sameSite: "lax"
    })
    res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: false,
        sameSite: "lax"
    })
    handleResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "User logout successfully",
        data: null
    })
})
const handleGetNewTokenUsingRefreshToken = catchAsyncFunction(async (req: Request, res: Response, next: NextFunction) => {
    const refreshToken = req.cookies.refreshToken;
    const setNewToken = await AuthService.createNewTokenUsingRefreshToken(refreshToken as string);
    setTokenIntoCookies(res, setNewToken)
    handleResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: "Access token updated",
        data: setNewToken
    })
})
const handleResetPassword = catchAsyncFunction(async (req: Request, res: Response, next: NextFunction) => {
    const oldPassword = req.body.oldPassword;
    const newPassword = req.body.newPassword;
    const token = req.user;
    await AuthService.resetPassword(oldPassword, newPassword, token as JwtPayload);
    handleResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Password reset successfully",
        data: true
    })
})
// const handleGoogleLogin = catchAsyncFunction(async (req: Request, res: Response, next: NextFunction) => {
//     const redirectTo = req.query.redirect ? req.query.redirect : "";
//     console.log(redirectTo);
//     // if(redirectTo.startsWith("/")){

//     // }

// })
export const AuthController = {
    handleUserLogin, handleGetNewTokenUsingRefreshToken, handleResetPassword, handleUserLogout
}