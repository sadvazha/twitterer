import { Logger } from './libs/service-toolkit'
import { Account, Analysis, Tweet } from './types'


export interface DatabaseConnector {
    insertTweets(accountId: string, tweets: Tweet[]): Promise<void>
    getTweets(accountId: string): Promise<Tweet[]>
    insertAccount(accountId: string, account: Account): Promise<void>
    getAccount(accountId: string): Promise<Account>
    insertAnalysis(accountId: string, accpuntInfo: Analysis): Promise<void>
    getAnalysis(accountId: string): Promise<Analysis>
}

class MockDatabaseConnector implements DatabaseConnector {
    storage = {
        tweets: {} as Record<string, Tweet[]>,
        accounts: {} as Record<string, Account>,
        accountInfo: {} as Record<string, Analysis>,
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

    async insertAccount(accountId: string, account: Account): Promise<void> {
        this.logger.info({ accountId, account }, 'Inserting account')
        this.storage.accounts[accountId] = account
    }

    async getAccount(accountId: string): Promise<Account> {
        this.logger.info({ accountId }, 'Fetching account')
        const account = this.storage.accounts[accountId]
        if (!account) {
            throw new Error('No account')
        }

        return account
    }

    async insertAnalysis(accountId: string, analysis: Analysis): Promise<void> {
        this.logger.info({ accountId, accountInfo: analysis }, 'Inserting accountInfo')
        this.storage.accountInfo[accountId] = analysis
    }

    async getAnalysis(accountId: string): Promise<Analysis> {
        const accountInfo = this.storage.accountInfo[accountId]
        if (!accountInfo) {
            throw new Error('No tweets')
        }

        return accountInfo
    }
}

export const newMockDatabaseConnector = (logger: Logger): DatabaseConnector => {
    return new MockDatabaseConnector(logger)
}
