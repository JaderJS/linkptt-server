import express from 'express'
import { Request, Response } from 'express'
import { prisma } from "@/prisma"
import { z } from 'zod'
import { sign, verify } from 'jsonwebtoken'
import { config } from 'config'
import { comparePassword } from '@/credentials/authorized'

const router = express.Router()

router.get('/user', async (req: Request, res: Response) => {
    try {
        console.log(req.query)
        const userSchema = z.object({
            email: z.string()
        })
        const params = userSchema.parse(req.query)
        prisma.user.findUniqueOrThrow({ where: { email: params.email } }).then((user) => {
            return res.json({ user })
        }).catch((error) => {
            return res.status(404).json({ "msg": "User not founded", error: JSON.stringify(error) })
        })
    } catch (error) {
        return res.status(500).send({ msg: "Internal server error", error: JSON.stringify(error) })
    }

})

router.post(`/user/login`, async (req: Request, res: Response) => {
    try {
        const loginSchema = z.object({
            email: z.string().email(),
            password: z.string().min(0)
        })

        const params = loginSchema.parse(req.body)
        const user = await prisma.user.findUniqueOrThrow({ where: { email: params.email } })
        const match = comparePassword(params.password, user.password)
        if (!match) {
            return res.status(403).send({ msg: "Unauthorize" })
        }
        const token = sign(user, config.SECRET_KEY, { expiresIn: '30d' })
        return res.send({ msg: "Access authorized", data: { user, token } })
    } catch (error: any) {
        return res.status(500).send({ msg: "Internal server error", error: error.message })

    }
})

export default router
