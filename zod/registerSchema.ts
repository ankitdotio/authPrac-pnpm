import z, { email } from "zod";

export const registerSchema= z.object({
    email : z.string().min(3),
    name : z.string().min(3),
    password : z.string().min(6)
})