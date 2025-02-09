import { Logger } from './libs/service-toolkit'
import { AccountInfo, Tweet } from './types'


export interface DatabaseConnector {
    insertTweets(accountId: string, tweets: Tweet[]): Promise<void>
    getTweets(accountId: string): Promise<Tweet[]>
    insertAccountInfo(accountId: string, accpuntInfo: AccountInfo): Promise<void>
    getAccountInfo(accountId: string): Promise<AccountInfo>
}

class MockDatabaseConnector {
    storage = {
        tweets: {} as Record<string, Tweet[]>,
        accountInfo: {} as Record<string, AccountInfo>,
    }

    constructor(readonly logger: Logger) {}

    async insertTweets(accountId: string, tweets: Tweet[]): Promise<void> {
        this.logger.info({ accountId, tweetCount: tweets.length }, 'Inserting tweets')
        this.storage.tweets[accountId] = tweets
    }

    async getTweets(accountId: string): Promise<Tweet[]> {
        this.logger.info({ accountId }, 'Fetching tweets')
        const tweets = this.storage.tweets[accountId]
        if (!tweets) {
            throw new Error('No tweets')
        }

        return tweets
    }

    async insertAccountInfo(accountId: string, accountInfo: AccountInfo): Promise<void> {
        this.logger.info({ accountId, accountInfo }, 'Inserting accountInfo')
        this.storage.accountInfo[accountId] = accountInfo
    }

    async getAccountInfo(accountId: string): Promise<AccountInfo> {
        const accountInfo = this.storage.accountInfo[accountId]
        if (!accountInfo) {
            throw new Error('No tweets')
        }

        return accountInfo
    }
}

export const newMockDatabaseConnector = (logger: Logger) => {
    return new MockDatabaseConnector(logger)
}
