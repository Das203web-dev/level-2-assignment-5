import httpStatus from "http-status-codes"
import { getNewTokenUsingRefreshToken } from "../../utils/getJwtToken";
import { JwtPayload } from "jsonwebtoken";
import { User } from "../user/user.model";
import AppError from "../../errorHelpers/AppError";
import bcrypt from "bcryptjs"
import { envVariables } from "../../config/env";

const createNewTokenUsingRefreshToken = async (refreshToken: string) => {
    console.log(refreshToken);
    const accessToken = await getNewTokenUsingRefreshToken(refreshToken);
    return {
        accessToken: accessToken
    }
}
const resetPassword = async (oldPassword: string, newPassword: string, token: JwtPayload) => {
    if (!token && !oldPassword && !newPassword) {
        throw new AppError(httpStatus.BAD_REQUEST, `Sorry something went wrong`)
    }
    const findUser = await User.findOne({ userId: token.userId });
    const matchPassword = await bcrypt.compare(oldPassword, findUser!.password as string)
    if (!matchPassword) {
        throw new AppError(httpStatus.BAD_REQUEST, "Sorry password does not match")
    }
    const createNewPassword = await bcrypt.hash(newPassword, envVariables.SALT_ROUND);
    findUser!.password = createNewPassword;
    await findUser?.save()
    return true
}
export const AuthService = {
    createNewTokenUsingRefreshToken, resetPassword
}