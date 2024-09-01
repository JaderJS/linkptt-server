import { Server, Socket } from "socket.io"
import { Channels } from "./channels"
import { JwtPayload, verify } from "jsonwebtoken"
import { config } from "config"
import { prisma } from "@/prisma"
import debug from "debug"
import path from "node:path"
import { createWriteStream, WriteStream } from "node:fs"
import { LocationProps, StartProps, StopProps } from "./types"

const log = debug("@core")

type User = {
    cuid: string
    email: string
    name?: string
    channels?: {
        cuid: string
        name: string
    }[]
}

type CustomSocket = Socket & {
    user?: User
    stream?: WriteStream
}

type TransmissionProps = {
    from: string
}



export class Core {
    private io: Server
    public users: Map<string, User> = new Map()

    constructor(io: Server) {
        this.io = io
        this.setup()
    }

    private async setup() {
        this.io.use(this.authenticate.bind(this))

        this.io.on("connection", async (socket: CustomSocket) => {
            try {

                const user = await prisma.user.findFirstOrThrow({ where: { cuid: socket.user?.cuid }, include: { myChannels: {} } })
                const { myChannels: channels } = user

                socket.join(channels.map(channel => channel.cuid))

                socket.on("audio:chunk:wav", (chunk) => {
                    socket.broadcast.emit("audio:chunk", chunk)
                    if (!socket.stream) {
                        return
                    }
                    socket.stream.write(chunk)
                })

                socket.on("audio:start", ({ from, type }: StartProps) => {
                    console.log("[AUDIO] start... ", from)
                    const filePath = path.join(__dirname, '../../assets', `${socket.user?.cuid}-${new Date().toISOString()}.wav`)
                    socket.stream = createWriteStream(filePath)

                    if (type === "channel") {
                        prisma.message.create({
                            data: {
                                duration: socket.stream.writableLength,
                                pathUrl: filePath,
                                transcript: "",
                                from: {
                                    connect: { cuid: socket.user?.cuid }
                                },
                                toChannel: {
                                    connect: { cuid: from }
                                }
                            }
                        }).then((data) => console.log(data)).catch((error) => console.error(error))
                    }
                })

                socket.on("audio:stop", ({ from, type }: StopProps) => {
                    console.log("[AUDIO] stop!")
                    if (!socket.stream) {
                        return
                    }
                    socket.stream.end()
                })

                socket.on("msg:location", async ({ latitude, longitude, rssi }: LocationProps) => {
                    await prisma.location.create({
                        data: {
                            latitude,
                            longitude,
                            rssi,
                            user: {
                                connect: { cuid: socket.user?.cuid }
                            }
                        }
                    })
                })

                socket.on("msg", (data) => {
                    console.count(data)
                })

                socket.on("disconnect", () => {
                    if (socket.user) {
                        this.users.delete(socket.user.cuid)
                        log(`User disconnect: ${socket.user.cuid}`)
                    }
                })

            } catch (error) {
                log(error)
            }
        })

    }

    private authenticate(socket: CustomSocket, next: Function) {
        const token = socket.handshake.auth?.token
        if (!token) {
            return next(new Error(`Authenticated error`))
        }
        try {
            const { cuid, email, name } = verify(token, config.SECRET_KEY) as JwtPayload & User
            if (this.users.get(cuid)) {
                log(`Attempt connect with same credentials, disconnecting invader`)
                return next(new Error(`User has connect, disconnecting now!`))
            }
            socket.user = {
                cuid: cuid,
                email: email
            }
            this.users.set(socket.user.cuid, { cuid: cuid, email: email, name: name })
            log(`User connected ${name || ""} ${cuid} ${email}`)

            next()
        } catch (error) {
            next(new Error(`Authenticated error`))
        }
    }

}