import { Server, Socket } from "socket.io"
import { Channels } from "./channels"
import { JwtPayload, verify } from "jsonwebtoken"
import { config } from "config"
import { prisma } from "@/prisma"
import debug from "debug"

const log = debug("@core")

type User = {
    cuid: string
    email: string
    name?: string
}

type CustomSocket = Socket & {
    user?: User
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

                // socket.join(user.myChannels.map(channel => channel.cuid))

                socket.on("audio:chunk", (chunk) => {
                    socket.broadcast.emit("audio:chunk", chunk)
                })

                socket.on("audio:start", (data) => {
                    console.log("[AUDIO] start... ", data)
                })

                socket.on("audio:stop", () => {
                    console.log("[AUDIO] stop!")
                })

                socket.on("msg:location", (data) => {
                    console.log(data)
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
            socket.user = {
                cuid: cuid,
                email: email
            }
            if (this.users.get(cuid)) {
                log(`Attempt connect with same credentials, disconnecting invader`)
                return next(new Error(`User has connect, disconnecting now!`))
            }
            this.users.set(socket.user.cuid, { cuid: cuid, email: email, name: name })
            log(`User connected ${name || ""} ${cuid} ${email}`)

            next()
        } catch (error) {
            next(new Error(`Authenticated error`))
        }
    }

}