import dotenv from "dotenv"
dotenv.config()

interface IEnvVariablesTypes {
    PORT: string;
    DB_URL: string;
    NODE_ENV: "development" | "production",
    GOOGLE_CLIENT_ID: string,
    GOOGLE_CLIENT_SECRET: string,
    GOOGLE_CALLBACK: string,
    SALT_ROUND: number,
    JWT_SECRET: string,
    JWT_EXPIRES_IN: string,
    JWT_REFRESH_SECRET: string,
    JWT_REFRESH_TOKEN_EXPIRES_IN: string,
    SUPER_ADMIN_EMAIL: string,
    SUPER_ADMIN_PASSWORD: string,
    SUPER_ADMIN_NAME: string
}
const loadEnvVariables = (): IEnvVariablesTypes => {
    const envVariables: string[] = ["PORT", "DB_URL", "NODE_ENV", "GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET", "GOOGLE_CALLBACK", "SALT_ROUND", "JWT_SECRET", "JWT_EXPIRES_IN",
        "JWT_REFRESH_SECRET", "JWT_REFRESH_TOKEN_EXPIRES_IN", "SUPER_ADMIN_EMAIL",
        "SUPER_ADMIN_PASSWORD", "SUPER_ADMIN_NAME"];
    envVariables.forEach(variable => {
        if (!process.env[variable]) {
            throw new Error(`Missing required env variable ${variable}`)
        }
    })
    return {
        PORT: process.env.PORT as string,
        DB_URL: process.env.DB_URL as string,
        NODE_ENV: process.env.NODE_ENV as "development" | "production",
        GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID as string,
        GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET as string,
        GOOGLE_CALLBACK: process.env.GOOGLE_CALLBACK as string,
        SALT_ROUND: Number(process.env.SALT_ROUND) as number,
        JWT_SECRET: process.env.JWT_SECRET as string,
        JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN as string,
        JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET as string,
        JWT_REFRESH_TOKEN_EXPIRES_IN: process.env.JWT_REFRESH_TOKEN_EXPIRES_IN as string,
        SUPER_ADMIN_EMAIL: process.env.SUPER_ADMIN_EMAIL as string,
        SUPER_ADMIN_PASSWORD: process.env.SUPER_ADMIN_PASSWORD as string,
        SUPER_ADMIN_NAME: process.env.SUPER_ADMIN_NAME as string
    }
}
export const envVariables: IEnvVariablesTypes = loadEnvVariables()