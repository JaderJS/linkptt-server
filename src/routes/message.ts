import express from 'express'
import { Request, Response } from 'express'
import { prisma } from "@/prisma"
import { z } from 'zod'
import { sign, verify } from 'jsonwebtoken'
import { config } from 'config'
import { comparePassword, hashPassword } from '@/credentials/authorized'
import { core } from "@/server"

const router = express.Router()

router.delete(`/message/:id`, async (req: Request, res: Response) => {
    try {
        console.log(req.params)
        const id = z.coerce.number().parse(req.params.id)
        await prisma.message.delete({ where: { id } })
    } catch (error: any) {
        console.error(error)
        return res.status(500).json({ msg: "Error delete message", error: error.message })
    }
})


export default router
