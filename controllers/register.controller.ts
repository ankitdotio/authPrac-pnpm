
import type { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";

import { and, eq } from "drizzle-orm";

import { db } from "../db/index..js";

import { userTable } from "../db/models/user.model.js";
import { sessionTable } from "../db/models/session.model.js";
import { otpTable } from "../db/models/otp.model.js";

import { registerSchema } from "../zod/registerSchema.js";

import { generateOtp, getOtpHtml } from "../utils/utils.js";

import { sendEmail } from "../services/email.services.js";

import { project } from "../config/config.js";





export const registerUser = async (
    req: Request,
    res: Response
) => {

    try {

        const validatedData = registerSchema.safeParse(req.body);

        if (!validatedData.success) {

            return res.status(400).json({
                message: "INVALID DATA",
                error: validatedData.error.flatten()
            });

        }

        const { email, name, password } = validatedData.data;

        // CHECK IF USER EXISTS

        const existingUser = await db
            .select()
            .from(userTable)
            .where(eq(userTable.email, email));

        if (existingUser.length > 0) {

            return res.status(409).json({
                message: "USER ALREADY EXISTS"
            });

        }

        // HASH PASSWORD

        const hashedPassword = await bcrypt.hash(password, 10);

        // CREATE USER

        const [user] = await db
            .insert(userTable)
            .values({
                email,
                name,
                password: hashedPassword
            })
            .returning();

        if (!user) {

            return res.status(400).json({
                message: "ERROR CREATING USER"
            });

        }

        // GENERATE OTP

        const otp = generateOtp();

        const html = getOtpHtml(otp);

        const otpHash = crypto
            .createHash("sha256")
            .update(otp)
            .digest("hex");

        // DELETE OLD OTPs

        await db
            .delete(otpTable)
            .where(eq(otpTable.email, email));

        // STORE OTP

        await db
            .insert(otpTable)
            .values({
                userId: user.id,
                email,
                otpHash,
                expiresAt: new Date(Date.now() + 5 * 60 * 1000)
            });

        // SEND EMAIL

        await sendEmail(
            email,
            "OTP VERIFICATION",
            `YOUR OTP CODE IS ${otp}`,
            html
        );

        return res.status(201).json({
            message: "USER CREATED SUCCESSFULLY",
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                verified: user.verified
            }
        });

    } catch (error) {

        return res.status(500).json({
            message: `ERROR CREATING USER : ${error}`
        });

    }

};



// ========================================
// VERIFY EMAIL
// ========================================

export const verifyEmail = async (
    req: Request,
    res: Response
) => {

    try {

        const { otp, email } = req.body;

        if (!otp || !email) {

            return res.status(400).json({
                message: "OTP AND EMAIL ARE REQUIRED"
            });

        }

        // HASH OTP

        const hashedOtp = crypto
            .createHash("sha256")
            .update(otp)
            .digest("hex");

        // FIND OTP

        const otpDoc = await db
            .select()
            .from(otpTable)
            .where(
                and(
                    eq(otpTable.email, email),
                    eq(otpTable.otpHash, hashedOtp)
                )
            );

        if (otpDoc.length === 0) {

            return res.status(400).json({
                message: "INVALID OTP"
            });

        }

        // CHECK EXPIRY

        if (otpDoc[0].expiresAt < new Date()) {

            return res.status(400).json({
                message: "OTP EXPIRED"
            });

        }

        // VERIFY USER

        const [user] = await db
            .update(userTable)
            .set({
                verified: true
            })
            .where(eq(userTable.email, email))
            .returning();

        // DELETE OTP

        await db
            .delete(otpTable)
            .where(eq(otpTable.email, email));

        // CREATE TOKENS

        const refreshToken = jwt.sign(
            {
                id: user.id
            },
            project.jwt_secret,
            {
                expiresIn: "7d"
            }
        );

        const accessToken = jwt.sign(
            {
                id: user.id
            },
            project.jwt_secret,
            {
                expiresIn: "15m"
            }
        );

        // HASH REFRESH TOKEN

        const refreshTokenHash = crypto
            .createHash("sha256")
            .update(refreshToken)
            .digest("hex");

        // CREATE SESSION

        await db
            .insert(sessionTable)
            .values({
                userId: user.id,
                userAgent: req.headers["user-agent"],
                ip: req.ip,
                refreshTokenHash,
                revoke: false
            });

        // SET COOKIE

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        return res.json({
            message: "EMAIL VERIFIED SUCCESSFULLY",
            accessToken
        });

    } catch (error) {

        return res.status(500).json({
            message: `ERROR VERIFYING EMAIL : ${error}`
        });

    }

};



// ========================================
// REFRESH TOKEN
// ========================================

export const refreshToken = async (
    req: Request,
    res: Response
) => {

    try {

        const oldRefreshToken = req.cookies.refreshToken;

        if (!oldRefreshToken) {

            return res.status(401).json({
                message: "REFRESH TOKEN MISSING"
            });

        }

        // VERIFY TOKEN

        const decoded = jwt.verify(
            oldRefreshToken,
            project.jwt_secret
        ) as { id: string };

        // HASH TOKEN

        const refreshTokenHash = crypto
            .createHash("sha256")
            .update(oldRefreshToken)
            .digest("hex");

        // FIND SESSION

        const session = await db
            .select()
            .from(sessionTable)
            .where(
                and(
                    eq(sessionTable.refreshTokenHash, refreshTokenHash),
                    eq(sessionTable.revoke, false)
                )
            );

        if (session.length === 0) {

            return res.status(401).json({
                message: "INVALID SESSION"
            });

        }

        // CREATE NEW TOKENS

        const newAccessToken = jwt.sign(
            {
                id: decoded.id
            },
            project.jwt_secret,
            {
                expiresIn: "15m"
            }
        );

        const newRefreshToken = jwt.sign(
            {
                id: decoded.id
            },
            project.jwt_secret,
            {
                expiresIn: "7d"
            }
        );

        const newRefreshTokenHash = crypto
            .createHash("sha256")
            .update(newRefreshToken)
            .digest("hex");

        // UPDATE SESSION

        await db
            .update(sessionTable)
            .set({
                refreshTokenHash: newRefreshTokenHash
            })
            .where(eq(sessionTable.id, session[0].id));

        // SET COOKIE

        res.cookie("refreshToken", newRefreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        return res.json({
            accessToken: newAccessToken
        });

    } catch (error) {

        return res.status(401).json({
            message: `ERROR REFRESHING TOKEN : ${error}`
        });

    }

};



// ========================================
// LOGOUT
// ========================================

export const logout = async (
    req: Request,
    res: Response
) => {

    try {

        const refreshToken = req.cookies.refreshToken;

        if (!refreshToken) {

            return res.status(400).json({
                message: "REFRESH TOKEN NOT FOUND"
            });

        }

        // HASH TOKEN

        const refreshTokenHash = crypto
            .createHash("sha256")
            .update(refreshToken)
            .digest("hex");

        // REVOKE SESSION

        await db
            .update(sessionTable)
            .set({
                revoke: true
            })
            .where(
                eq(
                    sessionTable.refreshTokenHash,
                    refreshTokenHash
                )
            );

        // CLEAR COOKIE

        res.clearCookie("refreshToken");

        return res.json({
            message: "LOGOUT SUCCESSFUL"
        });

    } catch (error) {

        return res.status(500).json({
            message: `ERROR LOGGING OUT : ${error}`
        });

    }

};
