import { newTweetAnalyzerOpanAI } from './analyzer'
import { newMockDatabaseConnector } from './database_connector'
import { newPinoLogger } from './libs/service-toolkit'


const test = async () => {
    const logger = newPinoLogger()
    const db = newMockDatabaseConnector(logger)
    const token = process.env.OPENAI_TOKEN
    const accountId = 'elonMusk'
    const {account, tweets} = require('./dump_processed.json')
    await Promise.all([
        db.insertAccount(accountId, account),
        db.insertTweets(accountId, tweets),
    ])
    logger.info({account, tweets}, 'Processing following info')
    if (!token) { throw new Error('No open AI token') }
    const a = newTweetAnalyzerOpanAI(logger, token, db)
    await a.analyze(accountId)

    logger.info(await db.getAnalysis(accountId), 'Result')
}

test()