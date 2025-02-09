import { TweetAnalyzer } from './analyzer'
import { DatabaseConnector } from './database_connector'
import { TweetFetcher } from './fetcher'
import { Logger, RouteRegistrar } from './libs/service-toolkit'
import express from 'express'

export const getRouteRegistrar = (
    logger: Logger,
    db: DatabaseConnector,
    fetcher: TweetFetcher,
    analyzer: TweetAnalyzer
): RouteRegistrar => {
    return (app: express.Express) => {
        app.use(express.json())

        app.post('/accounts', async (req, res) => {
            logger.debug({ body: req.body }, 'received account request')
            const accountId = req.body.accountId

            await fetcher.fetch(accountId)
            await analyzer.analyze(accountId)

            res.status(201).end(JSON.stringify(await db.getAccountInfo(accountId)))
        })
    }
}
