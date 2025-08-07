import { NextFunction, Request, Response } from "express";
import { handleDuplicateError } from "../errorHelpers/duplicateError";
import { handleZodError } from "../errorHelpers/zodError";
import { handleCastError } from "../errorHelpers/handleCastError";
import AppError from "../errorHelpers/AppError";
import { handleValidationError } from "../errorHelpers/handleValidation";
import { envVariables } from "../config/env";

export const globalErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
    let statusCode = 500;
    let message = `Something went wrong`;
    let errorSource: any = []

    if (err.code === 11000) {
        const errorInfo = handleDuplicateError(err)
        statusCode = errorInfo.statusCode;
        message = errorInfo.message
    }
    else if (err.name === "ZodError") {
        const errorInfo = handleZodError(err)
        statusCode = errorInfo.statusCode;
        message = errorInfo.message;
        errorSource = errorInfo.errorSource;
    }
    else if (err.name === "CastError") {
        const errorInfo = handleCastError(err)
        statusCode = errorInfo.statusCode;
        message = errorInfo.message
    }
    else if (err.name === "ValidationError") {
        const errorInfo = handleValidationError(err)
        statusCode = errorInfo.statusCode;
        message = errorInfo.message;
        errorSource = errorInfo.errorSource;
    }
    else if (err instanceof AppError) {
        statusCode = err.statusCode,
            message = err.message
    }
    else if (err instanceof Error) {
        statusCode = 500,
            message = err.message
    }
    res.status(statusCode).json({
        status: false,
        message,
        errorSource,
        err: envVariables.NODE_ENV === "development" ? err.message : null,
        stack: envVariables.NODE_ENV === "development" ? err.stack : null
    })
}