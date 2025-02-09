import { Logger } from '@twitterer/service-toolkit'
import { spawn } from 'child_process'


type Tweet = {
    text: string,
    lang: string,
    createdAt: string
} & Record<string, any>

export interface TweetFetcher {
    getTweetStream(accountId: string): Promise<Tweet>
}

export class TweetFetcherApify implements TweetFetcher {
    private readonly apiToken: string
    private readonly actorId  = 'apidojo~tweet-scraper'

    constructor(readonly logger: Logger, apiToken: string) {
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

    async getTweetStream(accountId: string): Promise<Tweet> {
        try {
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
            const jsonResponse = fullResponse.substring(startOfJSON)

            return JSON.parse(jsonResponse)
        } catch (error) {
            console.error('Error fetching tweets from Apify:', error)
            throw error
        }
    }
}
