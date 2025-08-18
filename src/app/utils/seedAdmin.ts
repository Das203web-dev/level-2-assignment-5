import { envVariables } from "../config/env"
import AppError from "../errorHelpers/AppError";
import { IAuth, Role } from "../modules/user/user.interface";
import { User } from "../modules/user/user.model"
import bcrypt from "bcryptjs"

export const seedAdmin = async () => {
    try {
        const isSuperAdminExist = await User.findOne({ email: envVariables.SUPER_ADMIN_EMAIL });
        if (isSuperAdminExist) {
            return
        }
        const hashedPassword = await bcrypt.hash(envVariables.SUPER_ADMIN_PASSWORD, envVariables.SALT_ROUND)
        const auth: IAuth = {
            provider: "credentials",
            providerId: envVariables.SUPER_ADMIN_EMAIL
        }
        const superAdmin = {
            name: envVariables.SUPER_ADMIN_NAME,
            email: envVariables.SUPER_ADMIN_EMAIL,
            password: hashedPassword,
            auths: [auth],
            role: Role.SUPER_ADMIN,
            isVerified: true
        }
        await User.create(superAdmin)
        /* eslint-disable @typescript-eslint/no-unused-vars */
    } catch (error) {
        throw new AppError(500, "Supper admin creation problem");
    }
}