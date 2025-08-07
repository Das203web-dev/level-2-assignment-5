import mongoose from "mongoose";
import { IErrorTypes } from "../interfaces/error.types";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const handleCastError = (err: mongoose.Error.CastError): IErrorTypes => {
    return {
        statusCode: 400,
        message: "Please provide a valid id"
    }
}