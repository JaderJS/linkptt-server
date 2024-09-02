import { Server, Socket } from "socket.io"
import { Channels } from "./channels"
import { JwtPayload, verify } from "jsonwebtoken"
import { config } from "config"
import { prisma } from "@/prisma"
import debug from "debug"
import path from "node:path"
import { createWriteStream, WriteStream } from "node:fs"
import { PassThrough } from "node:stream"
import { LocationProps, StartProps, StopProps } from "./types"
import { s3, S3 } from "./aws"
import { createId } from '@paralleldrive/cuid2'
import { OpusEncoder } from "@discordjs/opus"

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
    stream?: PassThrough
}

type TransmissionProps = {
    from: string
}

export class Core {
    private io: Server
    private s3: S3
    public users: Map<string, User> = new Map()
    private createdCuid: Function
    private opus: OpusEncoder

    constructor(io: Server) {
        this.io = io
        this.s3 = s3
        this.createdCuid = createId
        this.opus = new OpusEncoder(48000, 1)
        this.setup()
    }

    private async setup() {
        this.io.use(this.authenticate.bind(this))

        this.io.on("connection", async (socket: CustomSocket) => {
            try {

                const user = await prisma.user.findFirstOrThrow({ where: { cuid: socket.user?.cuid }, include: { myChannels: {} } })
                const { myChannels: channels } = user

                socket.join(channels.map(channel => channel.cuid))

                socket.on("audio:chunk", async (chunk) => {
                    // const encode = this.opus.encode(chunk)
                    socket.broadcast.emit("audio:chunk", chunk)
                    socket.stream?.write(chunk)
                })

                socket.on("audio:start", ({ from, type }: StartProps) => {
                    console.log("[AUDIO] start... ", from)
                    // const filePath = path.join(__dirname, '../../assets', `${socket.user?.cuid}-${new Date().toISOString()}.wav`)
                    // socket.stream = createWriteStream(filePath)

                    const fileName = `${from}/${this.createdCuid()}.ogg`
                    const passThrough = new PassThrough()
                    socket.stream = passThrough

                    const uploadParams = {
                        Bucket: "linkptt",
                        Key: fileName,
                        Body: passThrough,
                        ContentType: "audio/wav"
                    }
                    this.s3.upload(uploadParams).promise().then(async (data) => {
                        console.log(data)
                        if (type === "channel") {
                            await prisma.message.create({
                                data: {
                                    duration: 0,
                                    pathUrl: data.Location,
                                    path: fileName,
                                    transcript: "",
                                    from: {
                                        connect: { cuid: socket.user?.cuid }
                                    },
                                    toChannel: {
                                        connect: { cuid: from }
                                    }
                                }
                            })
                        }
                    }).catch((error) => {
                        console.error(error)
                    })

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