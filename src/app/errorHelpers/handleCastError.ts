import mongoose from "mongoose";
import { IErrorTypes } from "../interfaces/error.types";

export const handleCastError = (err: mongoose.Error.CastError): IErrorTypes => {
    return {
        statusCode: 400,
        message: "Please provide a valid id"
    }
}