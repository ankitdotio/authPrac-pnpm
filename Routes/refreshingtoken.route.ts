import { Router } from "express";
import { refreshToken } from "../controllers/register.controller.js";


export const refreshRouter: Router =  Router()

refreshRouter.post("/refreshingToken",refreshToken)