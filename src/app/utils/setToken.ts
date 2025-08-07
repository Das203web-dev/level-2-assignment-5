import { Response } from "express";

interface ITokenInfo {
    accessToken?: string;
    refreshToken?: string
}
export const setTokenIntoCookies = (res: Response, token: ITokenInfo) => {
    if (token.accessToken) {
        res.cookie("accessToken", token.accessToken, {
            httpOnly: true,
            secure: false
        })
    }
    if (token.refreshToken) {
        res.cookie("refreshToken", token.refreshToken, {
            httpOnly: true,
            secure: false
        })
    }
}