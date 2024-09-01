import express from 'express'
import { Request, Response } from 'express'
import { prisma } from "@/prisma"
import { z } from 'zod'
import { sign, verify } from 'jsonwebtoken'
import { config } from 'config'
import { comparePassword, hashPassword } from '@/credentials/authorized'
import { core } from "@/server"
import JSONbig from "json-bigint"

const router = express.Router()

router.get(`/channels`, async (req: Request, res: Response) => {
    try {
        const channels = await prisma.channel.findMany({ include: { usersToChannels: { include: { user: {} } }, owner: {} } })
        return res.json({ msg: "Ok", channels: channels })
    } catch (error: any) {
        return res.status(500).json({ msg: 'Error find channels', error: error.message })
    }
})

router.get(`/channel/:channelCuid`, async (req: Request, res: Response) => {

    try {
        const channelCuid = z.string().parse(req.params.channelCuid)
        const channel = await prisma.channel.findUniqueOrThrow({
            where: { cuid: channelCuid },
            include: {
                _count: { select: { messages: true, usersToChannels: true } },
                owner: {},
                messages: {
                    include: {
                        from: {
                            include: {}
                        },
                        toChannel: {
                            include: {}
                        },
                        toUser: {
                            include: {}
                        }
                    }
                },
                usersToChannels: { include: { user: {} } }
            }
        })
        const res_ = JSONbig.stringify(channel)
        return res.json({ msg: "Ok", channel: JSON.parse(res_) })
    } catch (error: any) {
        console.error(error)
        return res.status(500).json({ msg: 'Error find channels', error: error.message })
    }
})

router.post(`/channel`, async (req: Request, res: Response) => {

    const createChannelSchema = z.object({
        name: z.string().min(5),
        profileUrl: z.string(),
        ownerCuid: z.string().cuid()
    })

    try {
        const { name, profileUrl, ownerCuid } = createChannelSchema.parse(req.body)
        const channel = await prisma.channel.create({
            data: {
                name, profileUrl, owner: { connect: { cuid: ownerCuid } }
            }
        })
        return res.json({ msg: "Ok", channel })
    } catch (error: any) {
        console.log(error)
        return res.status(500).json({ msg: `Error find channels - ${error.message}`, error: error.message })
    }
})

router.post(`/channel/connect`, async (req: Request, res: Response) => {

    const allocatedUserToChannelSchema = z.object({
        channelCuid: z.string().cuid(),
        userCuid: z.string().cuid()
    })

    try {

        const { channelCuid, userCuid } = allocatedUserToChannelSchema.parse(req.body)
        const createOrConnect = await prisma.channel.update({
            where: { cuid: channelCuid }, data: {
                usersToChannels: {
                    connectOrCreate: {
                        create: { permission: "USER", user: { connect: { cuid: userCuid } } },
                        where: { userCuid_channelCuid: { channelCuid, userCuid } }
                    }
                }
            }
        })

        return res.json({ msg: "Ok", createOrConnect })

    } catch (error: any) {
        console.log(error.message)
        return res.status(500).json({ msg: 'Error allocated user in channel', error: error.message })
    }
})

export default router
