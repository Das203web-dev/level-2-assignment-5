import { Router } from "express";
import { UserController } from "./user.controller";
import { validationRequest } from "../../middlewares/validation";
import { userCreateSchema, userUpdateSchema } from "./user.validation";
import { checkUserRole } from "../../middlewares/checkUser";
import { Role } from "./user.interface";

const route = Router();
route.get("/all", checkUserRole(Role.ADMIN, Role.SUPER_ADMIN), UserController.handleGetAllUser)
route.post("/register", validationRequest(userCreateSchema), UserController.handleCreateUser)
route.patch("/update", validationRequest(userUpdateSchema), checkUserRole(Role.ADMIN, Role.DELIVERY_AGENT, Role.RECEIVER, Role.SENDER), UserController.handleUserUpdate)
route.patch("/update/role/:id", checkUserRole(Role.SUPER_ADMIN), UserController.handleUserRoleUpdate)
route.delete("/delete/:id", checkUserRole(Role.SUPER_ADMIN, Role.ADMIN), UserController.handleDeleteUser)
export const UserRoutes = route