export type Tweet = {
    text: string,
    lang: string,
    createdAt: string
} & Record<string, any>

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

export type AccountInfo = {
    marketingSaturation: number
    role: AccountRole
    location: string
}
