import { Logger, RouteRegistrar } from '@twitterer/service-toolkit'
import express from 'express'

export const getRouteRegistrar = (logger: Logger): RouteRegistrar => {
    return (app: express.Express) => {
        app.use(express.json())

        app.post('/accounts', (req, res) => {
            const accounts = req.body.account
            logger.debug({ accounts }, 'received account request')

            res.status(201).end(JSON.stringify({
                accounts,
                'not-implemented': 'NOT IMPLEMENTED',
            }))
        })
    }
}
