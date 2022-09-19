import express, { Express } from 'express'
import http from 'http'
import cors from 'cors'
import path from 'path'
import fs from 'fs'

const app: Express = express()

app.use(express.json())
app.set('json spaces', 2)

app.use(express.urlencoded({ extended: true }))
app.use(cors());

((path: fs.PathLike) => {
  fs.readdirSync(path).forEach(file => {
    if(!(fs.lstatSync(`${path}/${file}`).isDirectory()))
      app.use(require(`${path}/${file}`).default)
  })
})(path.join(__dirname, './routes'))

const server = http.createServer(app).listen(80);
server.addListener('listening', () => {
  console.log("Webserver is now listening for requests.")
})