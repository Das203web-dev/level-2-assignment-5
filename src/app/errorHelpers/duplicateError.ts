import { IErrorTypes } from "../interfaces/error.types";

export const handleDuplicateError = (err: any): IErrorTypes => {
    const matchError = err.message.match(/"([^"]*)"/);
    const error = matchError ? matchError[1] : matchError
    return {
        statusCode: 400,
        message: `${error} is already exist`
    }
}