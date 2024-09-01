import express from 'express'
import { Request, Response } from 'express'
import { prisma } from "@/prisma"
import { z } from 'zod'
import { sign, verify } from 'jsonwebtoken'
import { config } from 'config'
import { comparePassword, hashPassword } from '@/credentials/authorized'
import { core } from "@/server"

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

router.post(`/user/register`, async (req: Request, res: Response) => {
    try {
        const registerSchema = z.object({
            email: z.string().email(),
            nickname: z.string().min(3),
            password: z.string().min(3)
        })

        const { email, nickname, password } = registerSchema.parse(req.body)
        prisma.user.create({
            data: {
                email,
                password: await hashPassword(password),
                name: nickname
            }
        }).then((user) => {
            return res.json({ msg: "User created with success", user })
        }).catch((error) => {
            return res.json({ msg: 'Error the created user', slug: error.message })
        })
    } catch (error: any) {
        res.status(500).json({ msg: "Error the created user", slug: error.message })
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

router.get(`/users`, async (req: Request, res: Response) => {
    try {
        const numberOfUsers = await prisma.user.count()
        const users_ = await prisma.user.findMany({ select: { cuid: true, name: true, email: true } })
        const users = users_.map(({ cuid, email, name }) => {
            return { cuid, name, email, isActive: !!core.users.get(cuid) }
        })
        return res.json({ msg: "Ok", users })
    } catch (error: any) {
        return res.status(500).json({ msg: "Error in request users actives", error: error.message })
    }
})

export default router
