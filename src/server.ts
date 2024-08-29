import express from "express"
import { Router, Request, Response } from "express"
import { createServer } from "node:http"
import { config } from "../config"
import debug from 'debug'
import { Server } from "socket.io"
import { Core } from "@/core/core"


import users from "@/routes/user"

const log = debug(`api:main`)

const app = express()

const http = createServer(app)
const router = Router()
const io = new Server(http, {
    // transports: ["websocket"]
})

app.use(express.json())
app.use('/api', users)

app.use((req: Request, res: Response, next) => {
    log(req.query, `request at: ${new Date().toISOString()}`)
    return next()
})

router.get('/', (req: Request, res: Response) => {
    res.json({ "msg": "Hello world!" })
})

new Core(io)

app.use(router)
http.listen(config.PORT, () => {
    log(`Server is running in ${config.PORT}`)
})