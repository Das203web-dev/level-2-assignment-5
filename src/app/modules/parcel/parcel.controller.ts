import { NextFunction, Request, Response } from "express";
import { catchAsyncFunction } from "../../utils/catchAsync";
import { ParcelServices } from "./parcel.service";
import { handleResponse } from "../../utils/handleResponse";
import httpStatus from "http-status-codes"
import { JwtPayload } from "jsonwebtoken";
import { Role } from "../user/user.interface";
import { IParcel, ParcelStatus } from "./parcel.interface";
import AppError from "../../errorHelpers/AppError";

const handleCreateParcel = catchAsyncFunction(async (req: Request, res: Response, next: NextFunction) => {
    const parcelBody = req.body;
    const token = req.user;
    const parcelCreation = await ParcelServices.createParcel(parcelBody as Partial<IParcel>, token as JwtPayload);
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
    handleResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        data: findParcel,
        message: "Parcel Cancelled successfully"
    })
})
const handleGetAllPArcels = catchAsyncFunction(async (req: Request, res: Response, next: NextFunction) => {
    const filter = req.query.filter as string | undefined;
    const token = req.user as JwtPayload;
    const getParcels = await ParcelServices.allParcels(token as JwtPayload, filter);
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
    const deliveryManId = req.body?.deliveryManId;
    // if (!deliveryManId) {
    //     throw new AppError(httpStatus.BAD_REQUEST, "You must have to provide delivery man")
    // }
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
    const dispatchCommand = req.params.parcelId;
    const getDispatchInfo = await ParcelServices.dispatchParcel(getToken as JwtPayload, dispatchCommand)
    // console.log(getDispatchInfo, "from parcel controller dispatch");
    handleResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        data: getDispatchInfo,
        message: "Parcel dispatched"
    })
})
const handelInTransit = catchAsyncFunction(async (req: Request, res: Response, next: NextFunction) => {
    const token = req.user;
    const parcelId = req.params.id;
    const parcelStatus = await ParcelServices.inTransit(token as JwtPayload, parcelId as string);
    handleResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        data: parcelStatus,
        message: "Parcel in IN_TRANSIT"
    })
})
const handleSendOTP = catchAsyncFunction(async (req: Request, res: Response, next: NextFunction) => {
    const token = req.user
    const parcelId = req.params.id;
    const deliveredParcel = await ParcelServices.sendOTP(token as JwtPayload, parcelId as string)
    handleResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        data: deliveredParcel,
        message: "OTP is send"
    })
})
const handleVerifyOTP = catchAsyncFunction(async (req: Request, res: Response, next: NextFunction) => {
    const token = req.user;
    const parcel = req.params.id;
    // console.log(parcel, "from control");
    const otp = req.body;
    // console.log(token, parcel, otp);
    const verifyOTP = await ParcelServices.confirmParcel(token as JwtPayload, parcel as string, otp.otp as number)
    // console.log(verifyOTP, "inside verify controller");
    handleResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        data: verifyOTP,
        message: "OTP is verified"
    })
})
const handleIncomingParcelsForReceiver = catchAsyncFunction(async (req: Request, res: Response, next: NextFunction) => {
    const token = req.user;
    const incomingParcels = await ParcelServices.incomingParcels(token as JwtPayload)
    handleResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        data: incomingParcels,
        message: "All incoming parcels are here"
    })
})
const handleParcelHistory = catchAsyncFunction(async (req: Request, res: Response, next: NextFunction) => {
    const token = req.user;
    const parcelHistory = await ParcelServices.parcelHistory(token as JwtPayload);
    handleResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        data: parcelHistory,
        message: "All delivered parcels are here"
    })
})
const handleFlagParcel = catchAsyncFunction(async (req: Request, res: Response, next: NextFunction) => {
    const token = req.user;
    const parcelId = req.params.id;
    const flaggedParcel = await ParcelServices.flagParcel(token as JwtPayload, parcelId as string);
    // console.log(token, parcelId, flaggedParcel);
    handleResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        data: flaggedParcel,
        message: "This parcel is flagged"
    })
})
const handleParcelBlock = catchAsyncFunction(async (req: Request, res: Response, next: NextFunction) => {
    const token = req.user;
    const parcelId = req.params.id;
    const parcel = await ParcelServices.blockParcel(token as JwtPayload, parcelId as string);
    handleResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        data: parcel,
        message: "This parcel is blocked"
    })
})
const handlePublicTracking = catchAsyncFunction(async (req: Request, res: Response, next: NextFunction) => {
    const parcelId = req.params.id;
    const parcel = await ParcelServices.publicTracking(parcelId)
    handleResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        data: parcel,
        message: "Parcel details"
    })
})
const handleParcelDelete = catchAsyncFunction(async (req: Request, res: Response, next: NextFunction) => {
    const token = req.user;
    const parcelId = req.params.id;
    await ParcelServices.deleteParcel(parcelId as string);
    handleResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        data: null,
        message: "Parcel deleted"
    })
})
export const ParcelController = {
    handleCreateParcel, handleParcelCancel, handleGetAllPArcels, handleApprovedParcel, handleDispatchParcel, handelInTransit, handleSendOTP, handleVerifyOTP, handleIncomingParcelsForReceiver, handleParcelHistory, handleFlagParcel, handleParcelBlock, handlePublicTracking, handleParcelDelete
}