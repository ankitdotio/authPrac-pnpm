import { Router } from "express";
import { homePageFunction } from "../controllers/homePage.controller.js";

export const homePageRouter:Router = Router()


homePageRouter.get("/home",homePageFunction)