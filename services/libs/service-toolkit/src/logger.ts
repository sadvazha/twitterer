import pino from 'pino'

export interface Logger {
    debug(object: Record<string, any>, message: string): void
    info(object: Record<string, any>, message: string): void
    warn(object: Record<string, any>, message: string): void
    error(object: Record<string, any>, message: string): void

    child(name: string): Logger
}

class PinoLogger implements Logger {
    constructor(readonly pino: pino.Logger) {}

    debug(object: Record<string, any>, message: string): void { this.pino.debug(object, message) }
    info(object: Record<string, any>, message: string): void  { this.pino.info(object, message) }
    warn(object: Record<string, any>, message: string): void  { this.pino.warn(object, message) }
    error(object: Record<string, any>, message: string): void  { this.pino.error(object, message) }

    child(name: string): Logger {
        return new PinoLogger(this.pino.child({ name }))
    }
}

export const newPinoLogger = (): Logger => {
    return new PinoLogger(pino({ level: 'debug' }))
}
