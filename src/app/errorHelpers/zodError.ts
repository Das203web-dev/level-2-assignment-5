import { IErrorSourceType, IErrorTypes } from "../interfaces/error.types"

export const handleZodError = (err: any): IErrorTypes => {
    const errorSource: IErrorSourceType[] = []
    err.issues.forEach((issue: any) => errorSource.push({
        path: issue.path[issue.path.length - 1],
        message: issue.message
    }))

    return {
        statusCode: 400,
        message: "Zod error",
        errorSource
    }
}