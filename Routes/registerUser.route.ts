import { Router } from "express";
import { registerUser } from "../controllers/register.controller.js";

export const registerRouter: Router = Router()

registerRouter.post("/signup",registerUser)