import jwt, { JwtPayload, SignOptions } from "jsonwebtoken";
// import jwt from "jsonwebtoken"

export const handleJwtSign = (payload: JwtPayload, secret: string, expiresIn: string) => {
    const jwtSign = jwt.sign(payload, secret, {
        expiresIn
    } as SignOptions)
    return jwtSign
}
export const jwtVerify = (token: string, secret: string) => {
    const verifyToken = jwt.verify(token, secret);
    return verifyToken
}