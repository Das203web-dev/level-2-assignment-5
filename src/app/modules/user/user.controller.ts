import { NextFunction, Request, Response } from "express";
import { catchAsyncFunction } from "../../utils/catchAsync";
import { userService } from "./user.service";
import httpStatus from "http-status-codes"
import { success } from "zod";
import { handleResponse } from "../../utils/handleResponse";
import { JwtHeader, JwtPayload } from "jsonwebtoken";
import { IUser, Role } from "./user.interface";
import AppError from "../../errorHelpers/AppError";

const handleCreateUser = catchAsyncFunction(async (req: Request, res: Response, next: NextFunction) => {
    const user = await userService.registerUser(req.body);
    console.log(user, "inside controller");
    handleResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: "User created successfully",
        data: user
    })
})
const handleGetAllUser = catchAsyncFunction(async (req: Request, res: Response, next: NextFunction) => {
    const token = req.user
    const allUser = await userService.getAllUser(token as JwtHeader);
    handleResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: "All user retrieved successfully",
        data: allUser
    })
})
const handleUserUpdate = catchAsyncFunction(async (req: Request, res: Response, next: NextFunction) => {
    const token = req.user;
    const payload = req.body;
    const updatedUserBody = await userService.updateUser(token as JwtPayload, payload as Partial<IUser>);
    if (!updatedUserBody) {
        throw new AppError(httpStatus.NOT_FOUND, "The user not found")
    }
    const updateUser = updatedUserBody?.toObject()
    const { password, _id, ...withoutPassword } = updateUser;

    handleResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "User updated successfully",
        data: withoutPassword
    })
})
const handleUserRoleUpdate = catchAsyncFunction(async (req: Request, res: Response, next: NextFunction) => {
    const payload = req.body;
    const token = req.user;
    const userId = req.params.id;
    console.log(userId);
    const user = await userService.updateUserRole(token as JwtPayload, userId as string, payload as Partial<IUser>)
    handleResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "User updated successfully",
        data: user
    })
})
const handleDeleteUser = catchAsyncFunction(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.params.id;
    const token = req.user
    await userService.deleteUser(token as JwtPayload, userId as string);
    handleResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "User deleted successfully",
        data: null
    })
})
const handleBlockUser = catchAsyncFunction(async (req: Request, res: Response, next: NextFunction) => {
    const token = req.user;
    const userID = req.params.userId;
    const blockUserInfo = await userService.blockUser(token as JwtPayload, userID as string)
    handleResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "User is blocked",
        data: blockUserInfo
    })
})
const handleUnblockUser = catchAsyncFunction(async (req: Request, res: Response, next: NextFunction) => {
    const token = req.user;
    const userID = req.params.userId;
    const user = await userService.unblockUser(token as JwtPayload, userID as string);
    const { password, _id, ...userWithoutPassword } = user.toObject()
    handleResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "User is unblocked",
        data: userWithoutPassword
    })
})

export const UserController = {
    handleCreateUser, handleGetAllUser, handleUserUpdate, handleUserRoleUpdate, handleDeleteUser, handleBlockUser, handleUnblockUser
}