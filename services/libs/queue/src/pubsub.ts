import { Queue } from './queue'
import { PubSub, Topic } from '@google-cloud/pubsub'

import type { Logger } from '@twitterer/service-toolkit'

class PubsubQueue implements Queue {
    pubsub: PubSub
    topic: Topic

    constructor(readonly logger: Logger, readonly projectId: string, readonly topicNameOrId: string) {
        this.pubsub = new PubSub({ projectId })
        this.topic = this.pubsub.topic(topicNameOrId)
    }

    async push(message: string): Promise<void> {
        await this.topic.publishMessage({ data: message })
    }
}

export const NewPubsubQueue = (logger: Logger, projectId: string, topicNameOrId: string): Queue  => {
    return new PubsubQueue(logger, projectId, topicNameOrId)
}
