import type { Request, Response } from "express"


export const homePageFunction = (req:Request,res:Response)=>{
    res.send("HELLO THIS IS THE HOME PAGE");
}