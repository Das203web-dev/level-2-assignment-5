import { NextFunction, Request, Response } from "express"
import { jwtVerify } from "../utils/authUtils";
import { envVariables } from "../config/env";
import { JwtPayload } from "jsonwebtoken";
import { User } from "../modules/user/user.model";
import { Role, UserStatus } from "../modules/user/user.interface";

export const checkUserRole = (...allowedRoles: string[]) => async (req: Request, res: Response, next: NextFunction) => {
    try {
        const accessToken = req.cookies.accessToken;
        if (!accessToken) {
            throw new Error("No token found")
        }
        const verifyToken = jwtVerify(accessToken, envVariables.JWT_SECRET) as JwtPayload
        const findUser = await User.findOne({ email: verifyToken.email })
        if (!findUser) {
            throw new Error("User is not found")
        }
        if (findUser?.userStatus === UserStatus.BLOCKED || findUser?.userStatus === UserStatus.IN_ACTIVE) {
            throw new Error("Permission not granted")
        }
        if (!allowedRoles.includes(verifyToken.role)) {
            throw new Error("Permission not granted")
        }
        req.user = verifyToken
        next()
    } catch (error) {
        next(error)
    }
}