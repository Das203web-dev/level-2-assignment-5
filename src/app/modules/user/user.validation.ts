import z from "zod";
import { Role } from "./user.interface";


export const userCreateSchema = z.object({
    _id: z.string().optional(),
    name: z.string({ error: "Name is required" }).min(3, { error: "Name must be more then 3 characters" }).max(40, { error: "Name can't be more then 40 characters" }),
    email: z.email({ error: "Email is required" }),
    password: z.string().min(6, { error: "Password must be at least 6 characters" }).optional(),
    userStatus: z.string({ error: "Status will be string" }).optional(),
    address: z.string({ error: "Address will be string" }).optional(),
    role: z.string({
        error: "Role is required"
    }).refine(value => Object.values(Role).includes(value as Role), {
        message: "Invalid role provided"
    }),
    phone: z.string().optional(),
})
export const userUpdateSchema = z.object({
    name: z.string({ error: "Name is required" }).min(3, { error: "Name must be more then 3 characters" }).max(40, { error: "Name can't be more then 40 characters" }).optional(),
    address: z.string({ error: "Address will be string" }).optional(),
    phone: z.string().optional(),
})