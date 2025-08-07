import { NextFunction, Request, Response } from "express";
import { catchAsyncFunction } from "../../utils/catchAsync";
import { ParcelServices } from "./parcel.service";
import { handleResponse } from "../../utils/handleResponse";
import httpStatus from "http-status-codes"
import { JwtPayload } from "jsonwebtoken";
import { Role } from "../user/user.interface";

const handleCreateParcel = catchAsyncFunction(async (req: Request, res: Response, next: NextFunction) => {
    const parcelBody = req.body;
    const token = req.user;
    const parcelCreation = await ParcelServices.createParcel(parcelBody, token as JwtPayload);
    // console.log(parcelCreation, "from create parcel");
    handleResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        data: parcelCreation,
        message: "Parcel created successfully"
    })
})
const handleParcelCancel = catchAsyncFunction(async (req: Request, res: Response, next: NextFunction) => {
    const parcelId = req.params.id;
    const getUserToken = req.user
    const findParcel = await ParcelServices.cancelParcel(parcelId, getUserToken as JwtPayload);
    // console.log(findParcel);
    handleResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        data: findParcel,
        message: "Parcel Cancelled successfully"
    })
})
const handleGetAllPArcels = catchAsyncFunction(async (req: Request, res: Response, next: NextFunction) => {
    const token = req.user as JwtPayload;
    const getParcels = await ParcelServices.allParcels(token);
    // console.log(getUserRole);
    handleResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        data: getParcels,
        message: "Parcel retrieved successfully"
    })
})
const handleApprovedParcel = catchAsyncFunction(async (req: Request, res: Response, next: NextFunction) => {
    const getTrackingId = req.params.trackingID;
    const { deliveryManId } = req.body
    // console.log(deliveryManId, "delivery iud from controller");
    const token = req.user
    const trackingID = await ParcelServices.approvedParcel(getTrackingId as string, token as JwtPayload, deliveryManId as string);
    handleResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        data: trackingID,
        message: "Parcel approved"
    })
    // console.log(deliveryManID, "inside parcel controller");
})
const handleDispatchParcel = catchAsyncFunction(async (req: Request, res: Response, next: NextFunction) => {
    const getToken = req.user;
    const getDispatchInfo = await ParcelServices.dispatchParcel(getToken as JwtPayload)
    console.log(getDispatchInfo, "from parcel controller dispatch");
})
export const ParcelController = {
    handleCreateParcel, handleParcelCancel, handleGetAllPArcels, handleApprovedParcel, handleDispatchParcel
}