import { Response } from "express";
import { success } from "zod";

interface IResponse<T> {
    statusCode: number,
    success: boolean,
    data: T,
    message: string
}

export const handleResponse = <T>(res: Response, data: IResponse<T>) => {
    res.status(data.statusCode).json({
        success: data.success,
        data: data.data,
        message: data.message
    })
}