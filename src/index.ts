// src/index.ts
import { newTweetAnalyzerOpanAI } from './analyzer';
import { newMockDatabaseConnector } from './database_connector';
import { newTweetFetcherApify } from './fetcher';
import { Config, newPinoLogger, getServer, ProcessSignalManager, Signal } from './libs/service-toolkit'
import { getRouteRegistrar } from './router';


const logger = newPinoLogger().child('main')

const main = async () => {
    const config = new Config()
    config.validate()
    const signalManager = new ProcessSignalManager(logger.child('signal-manager'))
    const serverConfig = config.getServerConfig()
    const db = newMockDatabaseConnector(logger.child('mock-db'))
    const fetcher = newTweetFetcherApify(logger, config.getApifyConfig().apiToken, db)
    const analyzer = newTweetAnalyzerOpanAI(logger, config.getOpenAIConfig().apiToken, db)
    const routeRegistrar = getRouteRegistrar(
        logger.child('router'),
        db,
        fetcher,
        analyzer
    )
    const server = getServer(logger.child('server'), serverConfig.port, routeRegistrar)

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
    .catch((error: Error) => logger.error({ error: error.message }, 'Process thrown an error'))
