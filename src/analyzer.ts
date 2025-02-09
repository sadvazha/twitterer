import { DatabaseConnector } from './database_connector'
import { Logger } from './libs/service-toolkit'
import { AccountInfo, AccountRole } from './types'


export interface TweetAnalyzer {
    analyze(accountId: string): Promise<void>
}

class TweetAnalyzerOpenAI implements TweetAnalyzer {
    constructor(readonly logger: Logger, readonly apiToken: string, readonly db: DatabaseConnector) {}

    async analyze(accountId: string) {
        const tweets = await this.db.getTweets(accountId)

        this.logger.info({ tweetCount: tweets.length }, 'Analyzing tweets')

        // TODO: Implement gathering info from OpenAI
        const accountInfo: AccountInfo = { role: AccountRole.OTHER, marketingSaturation: 1, location: 'Imagination' }
        this.logger.info({ accountId, accountInfo }, 'Tweets analyzed')

        await this.db.insertAccountInfo(accountId, accountInfo)
    }
}

export const newTweetAnalyzerOpanAI = (logger: Logger, apiToken: string, db: DatabaseConnector): TweetAnalyzer => {
    return new TweetAnalyzerOpenAI(logger, apiToken, db)
}
