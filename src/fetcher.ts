import { Logger } from './libs/service-toolkit'
import { spawn } from 'child_process'
import { DatabaseConnector } from './database_connector'
import { Account, Tweet } from './types'


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
                maxItems: 10, // Limited by API (free tier)
                sort: 'Latest',
                twitterHandles: [accountId],
            }

            // Since API is not available in a free tier i am using CLI to fetch tweets
            await this.callProcess(this.logger, 'apify', ['login', '-t', this.apiToken])
            const fullResponse = await this.callProcess(this.logger, 'apify', ['call', this.actorId, '-i', JSON.stringify(input), '-o'])
            // This is hacky, but we broke :c
            const startOfJSON = fullResponse.indexOf('[{')
            const tweetsRawString = fullResponse.substring(startOfJSON)
            const tweetsRaw = JSON.parse(tweetsRawString)
            if (!Array.isArray(tweetsRaw)) {
                throw new Error(`Failed to correctly parse tweets, ${tweetsRaw}`)
            }
            const account = this.transformAccountData(tweetsRaw[0], tweetsRaw.length)
            const tweets = this.transformTweetData(account, tweetsRaw)

            this.logger.info({ accountId, tweetCount: tweetsRaw.length }, 'Successfully fetched tweets')

            await Promise.all([
                this.db.insertAccount(accountId, account),
                this.db.insertTweets(accountId, tweets)
            ])
        } catch (error) {
            console.error('Error fetching tweets from Apify:', error)
            throw error
        }
    }

    formatDate(dateStr: string) { return new Date(dateStr).toISOString() }

    transformTweetData(author: Account, rawTweets: any[]): Tweet[] {
        return rawTweets.map(tweet => ({
            text: tweet.fullText,
            createdAt: this.formatDate(tweet.createdAt),
            engagement: {
                retweets: tweet.retweetCount,
                replies: tweet.replyCount,
                likes: tweet.likeCount,
                quotes: tweet.quoteCount,
                views: tweet.viewCount,
                bookmarks: tweet.bookmarkCount
            },
            type: tweet.isRetweet ? "retweet" : tweet.isQuote ? "quote" : tweet.isReply ? "reply" : "tweet",
            hashtags: tweet.entities.hashtags.map((h: any) => h.text) || [],
            mentions: tweet.entities.user_mentions.map((m: any) => m.screen_name) || [],
            media: !!tweet.extendedEntities?.media,
            contains_links: tweet.entities.urls.length > 0,
            self_promotion: tweet.entities.user_mentions.some((m: any) => m.screen_name === author.username),
            tweet_location: tweet.place?.name || null
        }))
    }

    transformAccountData(rawTweet: Record<string, any>, tweetCount: number): Account {
        const author = rawTweet?.author || {};
        return {
            username: author.userName || "",
            name: author.name || "",
            bio: author.description || "",
            followers: author.followers || 0,
            following: author.following || 0,
            location: author.location || "",
            account_created_at: this.formatDate(author.createdAt || ""),
            tweets_analyzed: tweetCount
        }
    }
}

export const newTweetFetcherApify = (logger: Logger, apiToken: string, db: DatabaseConnector) => {
    return new TweetFetcherApify(logger, apiToken, db)
}
