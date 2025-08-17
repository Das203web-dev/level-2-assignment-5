export enum Role {
    SUPER_ADMIN = "SUPER_ADMIN",
    ADMIN = "ADMIN",
    SENDER = "SENDER",
    RECEIVER = "RECEIVER",
    DELIVERY_AGENT = "DELIVERY_AGENT"
}
export interface IAuth {
    provider: "google" | "credentials",
    providerId: string
}
export enum UserStatus {
    ACTIVE = "ACTIVE",
    BLOCKED = "BLOCKED",
    IN_ACTIVE = "IN_ACTIVE",
}
export interface IUser {
    _id?: string;
    name: string;
    email: string;
    password?: string;
    userStatus?: UserStatus;
    address?: string;
    isVerified?: boolean;
    role: Role;
    phone?: string;
    auths: IAuth[];
    userId: string
}