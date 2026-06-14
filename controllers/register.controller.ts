import type { Request, Response } from "express";
import { db } from "../db/index..js";
import { eq } from "drizzle-orm";
import { userTable, type selectUser } from "../db/models/user.model.js";
import { registerSchema } from "../zod/registerSchema.js";
import bcrypt from "bcrypt"
import  jwt  from "jsonwebtoken";
import { project } from "../config/config.js";
export const registerUser = async (req:Request,res:Response)=>{

    const validatedData = registerSchema.safeParse(req.body)

    if(!validatedData.success){
       return res.status(400).json({

            message:`DATA INVALIDATED `,
            error : validatedData.error.flatten()


        })
    }

       const {email,name,password} = validatedData.data
    const existingUser = await db.select().from(userTable).where(
    
        eq(userTable.email,email)

    )

    if(existingUser.length>0){
        return res.status(400).json({
            message:"THE USER ALREADY EXISTS WITH THE SAME EMAIL"
        })
    }


 
    const hashedPassword = await bcrypt.hash(password,10)

    const [user] = await db.insert(userTable).values({
        email,
        name,
        password: hashedPassword
    }).returning()

    if(!user){
        return res.status(400).json({
            message : "ERROR WHILE CREATING THE USER"
        })
    }
    
    const token = jwt.sign({
        id: user.id},
        project.jwt_secret,{

            expiresIn: "1d"

        }
    )

    return res.status(201).setHeader("Authorization",`Bearer ${token}`).json({
        message : "USER CREATED SUCCESSFULLY....."
    })

}