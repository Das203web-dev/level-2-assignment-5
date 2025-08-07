import { JwtPayload } from "jsonwebtoken";
import { envVariables } from "../../config/env";
import AppError from "../../errorHelpers/AppError";
import { IAuth, IUser, Role } from "./user.interface";
import { User } from "./user.model";
import bcrypt from "bcryptjs";
import httpStatus from "http-status-codes"

const registerUser = async (payload: Partial<IUser>) => {
    const { name, email, password, ...rest } = payload;
    if (!name || !email || !password) {
        throw new AppError(httpStatus.BAD_REQUEST, `"Name, email, and password are required"`)
    }
    if (payload.role === Role.ADMIN || payload.role === Role.SUPER_ADMIN) {
        throw new AppError(httpStatus.BAD_REQUEST, `Sorry you are not permitted to assign this role ${payload.role}`)
    }
    const isUserExist = await User.findOne({ email })
    if (isUserExist) {
        throw new AppError(httpStatus.CONFLICT, "Email is already exist")
    }
    const passwordHashing = await bcrypt.hash(password as string, envVariables.SALT_ROUND)
    const authProvider: IAuth = { provider: "credentials", providerId: email as string }
    const user = await User.create({
        name,
        email,
        password: passwordHashing,
        auths: [authProvider],
        ...rest
    })
    const userObject = user.toObject()
    const { password: userPassword, ...withoutPassword } = userObject;
    // await user.save()
    return withoutPassword
}
const getAllUser = async (token: JwtPayload) => {
    if (token.role !== Role.ADMIN && token.role !== Role.SUPER_ADMIN) {
        throw new AppError(httpStatus.FORBIDDEN, "Permission denied")
    }
    const allUSer = await User.find({}).select("-password")
    return allUSer
}
const updateUser = async (token: JwtPayload, payload: Partial<IUser>) => {
    console.log(token, payload);
    const notAllowedFields = ["email", "userStatus", "role", "userId"];
    for (let key of notAllowedFields) {
        if (Object.keys(payload).includes(key)) {
            throw new AppError(httpStatus.BAD_REQUEST, "Permission denied")
        }
    }
    if (!token && !payload) {
        throw new AppError(httpStatus.FORBIDDEN, "Permission denied")
    }
    const findUser = await User.findOneAndUpdate({ userId: token.userId }, payload, { new: true, runValidators: true })
    return findUser
}
const updateUserRole = async (token: JwtPayload, userId: string, payload: Partial<IUser>) => {
    const notAllowedFields = ['name', 'email', 'password', "userId", "auths"];
    for (let key of notAllowedFields) {
        if (Object.keys(payload).includes(key)) {
            throw new AppError(httpStatus.BAD_REQUEST, `Sorry you can not changed those fields of user ${Object.keys(payload)}`)
        }
    }
    if (token.role !== Role.SUPER_ADMIN) {
        throw new AppError(httpStatus.BAD_REQUEST, "Permission denied")
    }
    const updateUser = await User.findOneAndUpdate({ userId }, payload, { new: true });
    if (!updateUser) {
        throw new AppError(httpStatus.BAD_REQUEST, "User not found")
    }
    return updateUser
}
const deleteUser = async (token: JwtPayload, userId: string) => {
    const findUser = await User.findOne({ userId });
    if (!findUser) {
        throw new AppError(httpStatus.NOT_FOUND, "User not found")
    }
    if (token && token.role === Role.SUPER_ADMIN && findUser.role !== Role.SUPER_ADMIN) {
        const deleteUser = await User.deleteOne({ userId: findUser.userId })
        return deleteUser
    }
    if (token && token.role === Role.ADMIN) {
        if (findUser.role === Role.ADMIN || findUser.role === Role.SUPER_ADMIN) {
            throw new AppError(httpStatus.BAD_REQUEST, `You are not permitted to delete a ${findUser.role}`)
        }
        const deleteUser = await User.deleteOne({ userId: findUser.userId });
        return deleteUser
    }
}
export const userService = { registerUser, getAllUser, updateUser, updateUserRole, deleteUser }