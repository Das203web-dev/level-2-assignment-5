import { JwtPayload } from "jsonwebtoken";
import { envVariables } from "../config/env";
import { IUser, UserStatus } from "../modules/user/user.interface";
import { handleJwtSign, jwtVerify } from "./authUtils";
import { User } from "../modules/user/user.model";

export const getJwtToken = (user: Partial<IUser>) => {
    const jwtPayload = {
        userId: user.userId,
        email: user.email,
        role: user.role
    }
    const accessToken = handleJwtSign(jwtPayload, envVariables.JWT_SECRET, envVariables.JWT_EXPIRES_IN);
    const refreshToken = handleJwtSign(jwtPayload, envVariables.JWT_REFRESH_SECRET, envVariables.JWT_REFRESH_TOKEN_EXPIRES_IN)
    return {
        accessToken, refreshToken
    }
}
export const getNewTokenUsingRefreshToken = async (refreshToken: string) => {
    const verifyRefreshToken = jwtVerify(refreshToken, envVariables.JWT_REFRESH_SECRET) as JwtPayload
    if (!verifyRefreshToken) {
        throw new Error("Refresh token verification failed")
    }
    const checkUserExist = await User.findOne({ email: verifyRefreshToken.email });
    if (!checkUserExist) {
        throw new Error("User does not exist")
    }
    if (checkUserExist.userStatus === UserStatus.BLOCKED || checkUserExist.userStatus === UserStatus.IN_ACTIVE) {
        throw new Error(`User is ${checkUserExist.userStatus}`)
    }
    const jwtPayload = {
        userId: checkUserExist.userId,
        email: checkUserExist.email,
        role: checkUserExist.role
    }
    const accessToken = handleJwtSign(jwtPayload, envVariables.JWT_SECRET, envVariables.JWT_EXPIRES_IN)
    return accessToken
}