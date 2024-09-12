import { sign, decode, verify, JwtPayload } from "jsonwebtoken"
import { Request, Response, NextFunction } from "express"
import { Permission } from "@prisma/client"
import { config } from "config"
import { prisma } from "@/prisma"

export type AuthenticatedRequest = Request & {
    user?: {
        cuid: string,
        email: string,
        role: Permission
    }
}

export const authenticated = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization

    if (!authHeader) {
        return res.status(401).json({ msg: "Falling token" })
    }

    const token = authHeader.split(" ")[1]
    try {
        const decoded = verify(token, config.SECRET_KEY) as JwtPayload
        const user = await prisma.user.findUniqueOrThrow({
            where: { cuid: decoded.cuid },
            select: { cuid: true, email: true }
        })

        if (!user) {
            return res.status(404).json({ msg: "User not found" })
        }

        req.user = { ...user, role: "ADMIN" }
        next()
    } catch (error) {
        console.error(error)
        return res.status(403).json({ msg: "Invalid token or expired" })
    }
}