export interface Queue {
    push(message: string): Promise<void>
}