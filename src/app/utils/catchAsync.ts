import { NextFunction, Request, Response } from "express";
import { Types } from "mongoose";

type CatchAsyncType = (req: Request, res: Response, next: NextFunction) => Promise<void>
export const catchAsyncFunction = (fn: CatchAsyncType) => (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch((error: any) => {
        next(error)
    })
}