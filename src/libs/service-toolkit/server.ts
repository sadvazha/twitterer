import express from 'express'
import { Logger } from './logger'
import * as http from 'http'


export interface IServer {
    start(): Promise<void>
    stop(): Promise<void>
}

export type RouteRegistrar = (app: express.Express) => void

class Server implements IServer {
  private server?: http.Server
  private app = express()

  constructor(
    private readonly logger: Logger,
    private readonly port: number,
    private readonly registerRoutes: RouteRegistrar
  ) {}

  async start(): Promise<void> {
    this.registerRoutes(this.app)
    this.server = this.app.listen(this.port, () => {
      this.logger.info({ port: this.port }, 'Server is running')
    })
  }

  async stop(): Promise<void> {
    if (!this.server) {
      this.logger.warn({}, 'Attempt to stop server that is not running!')
      return
    }

    await new Promise<void>((resolve, reject) => {
      this.server!.close((err) => {
        if (err) {
          this.logger.error({ err }, 'Error stopping server')
          reject(err)
          return
        }

        this.logger.info({}, 'Server stopped')
        resolve()
      })
    })
  }
}

export const getServer = (logger: Logger, port: number, rr: RouteRegistrar): IServer => {
    return new Server(logger, port, rr)
}
