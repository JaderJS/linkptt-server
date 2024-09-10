import express, { NextFunction } from 'express'
import { Request, Response } from 'express'

const router = express.Router()

export class ApiError extends Error {
    public status: string
    public code: number

    constructor(message: string, status?: string, code?: number) {
        super(message)
        this.status = status || "fail"
        this.code = code || 500
    }
}

router.get(`/api`, (req: Request, res: Response) => {
    res.json({ msg: "Hello! Welcome to linkptt services" })
})

router.all(`*`, (req: Request, res: Response, next: NextFunction) => {
    const error = new ApiError(`Can't find ${req.originalUrl} on the server! `)
    next(error)
})

export default router
