import { Logger } from '@twitterer/service-toolkit'


type Tweet = {
    text: string,
    lang: string,
    createdAt: string
} & Record<string, any>

export interface AnalyzeTweets {
    analyze(accountId: string): Promise<void>
}

class AnalyzeTweetsOpenAI implements AnalyzeTweets {
    constructor(readonly logger: Logger, readonly apiToken: string) {}

    async analyze() {
        throw new Error('Not implemented')
    }
}

export const newAnalyzeTweetsOpanAI = (logger: Logger, apiToken: string): AnalyzeTweets => {
    return new AnalyzeTweetsOpenAI(logger, apiToken)
}
