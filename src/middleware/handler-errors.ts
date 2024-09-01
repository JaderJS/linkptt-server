import { ApiError } from "@/routes/global"
import { Request, Response, NextFunction } from "express"

export function error(error: ApiError, req: Request, res: Response, next: NextFunction) {
    error.code = error.code || 500
    res.status(error.code).json({
        status: error.status,
        code: error.status,
        msg: error.message || "Internal server error"
    })
}