import express from "express"
import { Router, Request, Response } from "express"
import { createServer } from "node:http"
import { config } from "../config"
import debug from 'debug'
import { Server } from "socket.io"
import { Core } from "@/core/core"
import cors from "cors"

//+++ROUTES+++
import users from "@/routes/user"
import channels from "@/routes/channels"
import messages from "@/routes/message"
import global from "@/routes/global"

import { error } from "./middleware/handler-errors"
import path from "node:path"

const log = debug(`api:main`)

const app = express()

const http = createServer(app)
const router = Router()
const io = new Server(http, {
    // transports: ["websocket"]
})

app.use(express.json())
app.use(cors())
app.use('/api', users)
app.use('/api', channels)
app.use('/api', messages)

export const core = new Core(io)

app.use(router)
app.use(global)
app.use(error)

http.listen(config.PORT, () => {
    console.log(`Server is running in http://localhost:${config.PORT}`)
})