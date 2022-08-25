import express from 'express'
import * as chalkThemes from './shared/chalkThemes.js'
import { log } from './shared/logger.js'

export const server = express()

server.all("/", (req, res) => {
  res.send("Bot is running!")
})

export function keepAlive() {
  server.listen(3000, () => {
    log(chalkThemes.setup("Web Server is ready."))
  })
}
