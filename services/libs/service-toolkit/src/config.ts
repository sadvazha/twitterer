type ServerConfig = {
    port: number
}

export class Config {
    server: ServerConfig = { port: parseInt(process.env.PORT ?? '3000', 10) }

    getServerConfig(): ServerConfig {
        return this.server
    }
}