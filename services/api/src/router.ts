import { Logger, RouteRegistrar } from '@twitterer/service-toolkit'
import express from 'express'

export const getRouteRegistrar = (logger: Logger): RouteRegistrar => {
    return (app: express.Express) => {
        app.use(express.json())

        app.post('/accounts', (req, res) => {
            const accounts = req.body.accounts
            logger.debug({ accounts }, 'received account request')

            res.status(201).end(JSON.stringify({
                accounts,
                'not-implemented': 'NOT IMPLEMENTED',
            }))
        })

        app.get('/accounts/:accountId', (req, res) => {
            const accountId = req.params.accountId
            logger.debug({ accountId }, 'received account request')
            const account = {
                accountId,
                'not-implemented': 'NOT IMPLEMENTED',
            }

            res.status(201).end(JSON.stringify({
                account,
            }))
        })
    }
}
