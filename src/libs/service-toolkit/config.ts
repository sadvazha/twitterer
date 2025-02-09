type ServerConfig = {
    port: number
}

type ApifyConfig = {
    apiToken: string
}

type OpenAIConfig = {
    apiToken: string
}

export class Config {
    server: ServerConfig = { port: parseInt(process.env.PORT ?? '3000', 10) }
    apify: ApifyConfig = { apiToken: process.env.APIFY_TOKEN ?? ''  }
    openAI: OpenAIConfig = { apiToken: process.env.OPENAI_TOKEN ?? ''  }

    validate() {
        if (!this.apify.apiToken) { throw new Error('Missing Apify API token') }
        if (!this.openAI.apiToken) { throw new Error('Missing OpenAI API token') }
    }

    getServerConfig(): ServerConfig {
        return this.server
    }

    getApifyConfig(): ApifyConfig {
        return this.apify
    }

    getOpenAIConfig(): OpenAIConfig {
        return this.openAI
    }
}