import mongoose from "mongoose";
import { IErrorSourceType } from "../interfaces/error.types";

export const handleValidationError = (err: mongoose.Error.ValidationError) => {
    const errorSource: IErrorSourceType[] = []
    const errors = Object.values(err.errors);
    errors.forEach((errorObject: any) => errorSource.push({
        path: errorObject.path,
        message: errorObject.message
    }))
    return {
        statusCode: 400,
        message: "Validation error",
        errorSource
    }
}