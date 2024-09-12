import { s3_, S3Client } from '@/core/aws'
import { PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3'
import { config } from 'config'
import express, { NextFunction } from 'express'
import { Request, Response } from 'express'
import multer from "multer"

const router = express.Router()
const upload = multer({ storage: multer.memoryStorage() })

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

router.post(`/api/upload/image`, upload.single("image"), async (req: Request, res: Response) => {
    try {
        const file = req.file
        if (!file) {
            return res.status(400).json({ msg: "Do not image send" })
        }

        const fileKey = `profiles/${crypto.randomUUID()}`
        await s3_.send(new PutObjectCommand(
            { Bucket: 'linkptt', Key: `${fileKey}`, Body: file.buffer, ContentType: file.mimetype, ACL: "public-read" }
        ))

        const pathUrl = `${config.URL_MINIO}/${fileKey}`

        return res.json({ msg: "Upload Ok", image: { pathUrl, path: `linkptt/${fileKey}` } })
    } catch (error) {
        console.error(error)
        res.status(500).json({ msg: "Erro upload you image" })
    }
})

router.all(`*`, (req: Request, res: Response, next: NextFunction) => {
    const error = new ApiError(`Can't find ${req.originalUrl} on the server! `)
    next(error)
})

export default router
