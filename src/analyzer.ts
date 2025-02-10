import { DatabaseConnector } from './database_connector'
import { Logger } from './libs/service-toolkit'
import { Analysis, Account, Tweet, AccountRole } from './types'
import axios, { isAxiosError } from 'axios'

export interface TweetAnalyzer {
    analyze(accountId: string): Promise<void>
}

class TweetAnalyzerOpenAI implements TweetAnalyzer {
    constructor(readonly logger: Logger, readonly apiToken: string, readonly db: DatabaseConnector) {}

    async analyze(accountId: string) {
        const [account, tweets] = await Promise.all([
            this.db.getAccount(accountId),
            this.db.getTweets(accountId),
        ])
        this.logger.info({ tweetCount: tweets.length }, 'Analyzing tweets')

        // TODO: Implement gathering info from OpenAI
        const [content_saturation, classification, location_analysis] = await Promise.all([
            this.analyseContentSaturation(account, tweets),
            this.analyseClassification(account, tweets),
            this.analyseLocation(account, tweets),
        ])

        const accountInfo = {
            content_saturation,
            classification,
            location_analysis,
        } as Analysis

        this.logger.info({ accountId, accountInfo }, 'Tweets analyzed')

        await this.db.insertAnalysis(accountId, accountInfo)
    }


    async analyseContentSaturation(account: Account, tweets: Tweet[]): Promise<Analysis['content_saturation']|null> {
        try {
            const response = await axios.post(
                'https://api.openai.com/v1/chat/completions',
                {
                    model: 'gpt-4o-mini',
                    response_format: {
                        type: 'json_schema',
                        json_schema: {
                            name: 'content_saturation',
                            strict: true,
                            schema: {
                                type: 'object',
                                properties: {
                                    marketing_percentage_7d: { type: 'number', description: 'percentage of marketing tweets per 7 days' },
                                    marketing_percentage_30d: { type: 'number', description: 'percentage of marketing tweets per 30 days' },
                                    total_marketing_tweets: { type: 'number', description: 'total number of marketing tweets' },
                                },
                                required: [
                                    'marketing_percentage_7d',
                                    'marketing_percentage_30d',
                                    'total_marketing_tweets',
                                ],
                                additionalProperties: false,
                            }
                        },
                    },
                    messages: [
                        { role: 'system', content: "You are an AI that determines if tweets contain marketing content. Analyze each tweet" },
                        { role: 'user', content: `Analyze these tweets for marketing content: ${JSON.stringify({ account, tweets })}` },
                    ],
                },
                {
                    headers: {
                        'Authorization': `Bearer ${this.apiToken}`,
                        'Content-Type': 'application/json',
                    },
                }
            )

            return response.data.choices[0].message.content as Analysis['content_saturation']
        }  catch (error) {
            if (isAxiosError(error)) {
                this.logger.error({ status: error.status, response: error.response?.data }, 'Failed to get response from OpenAI')
            }
            throw error
        }
    }

    async analyseClassification(account: Account, tweets: Tweet[]): Promise<Analysis['classification']|null> {
        try {
            const response = await axios.post(
                'https://api.openai.com/v1/chat/completions',
                {
                    model: 'gpt-4o-mini',
                    response_format: {
                        type: 'json_schema',
                        json_schema: {
                            name: 'classification',
                            strict: true,
                            schema: {
                                type: 'object',
                                properties: {
                                    likely_category: { type: 'string', enum: Object.values(AccountRole), description: 'the most likely category' },
                                    confidence_score: { type: 'string', description: 'how confident we are that the likely category is correct' },
                                    secondary_categories: { type: 'array', items: { type: 'string', enum: Object.values(AccountRole), description: 'possible category, different from the most likely'} },
                                },
                                required: [
                                    'likely_category',
                                    'confidence_score',
                                    'secondary_categories',
                                ],
                                additionalProperties: false,
                            },
                        },
                    },
                    messages: [
                        { role: 'system', content: "You are an AI that classifies Twitter users into predefined roles" },
                        { role: 'user', content: `Classify this user based on their tweets: ${JSON.stringify({ account, tweets })}` },
                    ],
                },
                {
                    headers: {
                        'Authorization': `Bearer ${this.apiToken}`,
                        'Content-Type': 'application/json',
                    },
                }
            )

            return response.data.choices[0].message.content as Analysis['classification']
        } catch (error) {
            if (isAxiosError(error)) {
                this.logger.error({ status: error.status, response: error.response?.data }, 'Failed to get response from OpenAI')
            }
            throw error
        }
    }

    async analyseLocation(account: Account, tweets: Tweet[]): Promise<Analysis['location_analysis']|null> {
        try {
            const response = await axios.post(
                'https://api.openai.com/v1/chat/completions',
                {
                    model: 'gpt-4o-mini',
                    response_format: {
                        type: 'json_schema',
                        json_schema: {
                            name: 'location_analysis',
                            strict: true,
                            schema: {
                                type: 'object',
                                properties: {
                                    estimated_country: { type: 'string', description: 'estimated country of the account' },
                                    confidence_score: { type: 'string', description: 'confidence score of estimated country' },
                                    tweeted_locations: { type: 'string', description: 'locations from which tweets were coming' },
                                },
                                required: [
                                    'estimated_country',
                                    'confidence_score',
                                    'tweeted_locations',
                                ],
                                additionalProperties: false,
                            },
                        },
                    },
                    messages: [
                        { role: 'system', content: "You are an AI that estimates a user's location based on their profile and tweets" },
                        { role: 'user', content: `Estimate the location of this user: ${JSON.stringify({ account, tweets })}` },
                    ],
                },
                {
                    headers: {
                        'Authorization': `Bearer ${this.apiToken}`,
                        'Content-Type': 'application/json',
                    },
                }
            )

            return response.data.choices[0].message.content as Analysis['location_analysis']
        } catch (error) {
            if (isAxiosError(error)) {
                this.logger.error({ status: error.status, response: error.response?.data }, 'Failed to get response from OpenAI')
            }
            throw error
        }
    }
}

export const newTweetAnalyzerOpanAI = (logger: Logger, apiToken: string, db: DatabaseConnector): TweetAnalyzer => {
    return new TweetAnalyzerOpenAI(logger, apiToken, db)
}
