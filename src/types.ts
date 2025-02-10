export type Tweet = {
    text: string;
    createdAt: string;
    engagement: {
        retweets: number;
        replies: number;
        likes: number;
        quotes: number;
        views: number;
        bookmarks: number;
    };
    type: "tweet" | "retweet" | "quote" | "reply";
    hashtags: string[];
    mentions: string[];
    media: boolean;
    contains_links: boolean;
    self_promotion: boolean;
    tweet_location: string | null;
}

export type Account = {
    username: string;
    name: string;
    bio: string;
    followers: number;
    following: number;
    location: string;
    account_created_at: string;
    tweets_analyzed: number;
}

export type Analysis = {
    content_saturation: {
        marketing_percentage_7d: number,
        marketing_percentage_30d: number,
        total_marketing_tweets: number,
    },
    classification: {
        likely_category: AccountRole, // Placeholder (needs NLP classification)
        confidence_score: number, // Placeholder (OpenAI can refine)
        secondary_categories: AccountRole[] // Placeholder
    },
    location_analysis: {
        estimated_country: string,
        confidence_score: number,
        tweeted_locations: string[]
    }
}


export enum AccountRole {
    FOUNDER = "FOUNDER",
    DEVELOPER = "DEVELOPER",
    TRADER = "TRADER",
    INVESTOR = "INVESTOR",
    INFLUENCER = "INFLUENCER",
    MEDIA_COMPANY = "MEDIA COMPANY",
    WEB3_STARTUP = "WEB3 STARTUP",
    COMMUNITY_MANAGER = "COMMUNITY MANAGER",
    AMBASSADOR = "AMBASSADOR",
    OTHER = "OTHER",
}
