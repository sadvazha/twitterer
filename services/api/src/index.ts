// src/index.ts
import { Config, newPinoLogger, getServer, ProcessSignalManager, Signal } from '@twitterer/service-toolkit'
import { getRouteRegistrar } from './router';


const logger = newPinoLogger().child('main')

const main = async () => {
    const config = new Config()
    const signalManager = new ProcessSignalManager(logger.child('signal-manager'))
    const serverConfig = config.getServerConfig()
    const server = getServer(logger.child('server'), serverConfig.port, getRouteRegistrar(logger.child('router')))

    await server.start()

    await Promise.race([
        signalManager.waitForSignal(Signal.SIGHUP),
        signalManager.waitForSignal(Signal.SIGINT),
        signalManager.waitForSignal(Signal.SIGTERM),
    ])

    await server.stop()
}

main()
    .then(() => logger.info({}, 'Process successfully finished'))
    .catch((error) => logger.error({ error }, 'Process thrown an error'))
