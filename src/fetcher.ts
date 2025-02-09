import { Logger } from './libs/service-toolkit'
import { spawn } from 'child_process'
import { DatabaseConnector } from './database_connector'


export interface TweetFetcher {
    fetch(accountId: string): Promise<void>
}

export class TweetFetcherApify implements TweetFetcher {
    private readonly actorId  = 'apidojo~tweet-scraper'

    constructor(readonly logger: Logger, readonly apiToken: string, readonly db: DatabaseConnector) {
        this.apiToken = apiToken
    }

    /**
     *
     * @returns stdout as string
     */
    callProcess(logger: Logger, command: string, args: string[]): Promise<string> {
        let response = ''
        return new Promise((resolve, reject) => {
            const process = spawn(command, args)
            process.stdout.on('data', (data) => {
                logger.info({ stdout: data.toString() }, "stdout stream")
                response += data.toString()
            })

            process.stderr.on('data', (data) => {
                logger.info({ stderr: data.toString() }, "stderr stream")
            })

            process.on('error', (error) => {
                reject(error)
            })

            process.on('exit', (code) => {
                logger.info({ code, command, args }, 'Process finished')
                if (code !== 0) {
                    reject(new Error(`Failed process execution with code: ${code}`))
                    return
                }
                resolve(response)
            })
        })
    }

    async fetch(accountId: string): Promise<void> {
        try {
            this.logger.info({ accountId }, 'Fetching tweets for account')
            const input = {
                author: accountId,
                maxItems: 5,
                sort: 'Latest',
                twitterHandles: [accountId],
            }

            // Since API is not available in a free tier i am using CLI to fetch tweets
            await this.callProcess(this.logger, 'apify', ['login', '-t', this.apiToken])
            const fullResponse = await this.callProcess(this.logger, 'apify', ['call', this.actorId, '-i', JSON.stringify(input), '-o'])
            // This is hacky, but we broke :c
            const startOfJSON = fullResponse.indexOf('[{')
            const tweets = JSON.parse(fullResponse.substring(startOfJSON))
            if (!Array.isArray(tweets)) {
                throw new Error(`Failed to correctly parse tweets, ${tweets}`)
            }

            this.logger.info({ accountId, tweetCount: tweets.length }, 'Successfully fetched tweets')

            await this.db.insertTweets(accountId, tweets)
        } catch (error) {
            console.error('Error fetching tweets from Apify:', error)
            throw error
        }
    }
}

export const newTweetFetcherApify = (logger: Logger, apiToken: string, db: DatabaseConnector) => {
    return new TweetFetcherApify(logger, apiToken, db)
}
