import { Logger } from './logger'

export enum Signal {
    SIGHUP = 'SIGHUP',
    SIGINT = 'SIGINT',
    SIGTERM = 'SIGTERM',
}

export class ProcessSignalManager {
    constructor(readonly logger: Logger) {}

    waitForSignal(signal: Signal): Promise<void> {
        return new Promise<void>((resolve) => {
            process.once(signal, () => {
                this.logger.info({ signal }, 'Process received a signal')
                resolve()
            })
        })
    }
}