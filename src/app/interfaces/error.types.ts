export interface IErrorSourceType {
    path: string,
    message: string
}
export interface IErrorTypes {
    statusCode: number,
    message: string,
    errorSource?: IErrorSourceType[]
}