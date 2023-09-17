import dayjs from 'dayjs'
import EventEmitter from 'eventemitter3'
import { SetRequired } from 'type-fest'

export interface Config {
    bufferLength?: number
    retryInterval?: number
}

export class StreamReader<T> {
    protected EE = new EventEmitter()

    protected config: SetRequired<Config, 'bufferLength' | 'retryInterval'>

    protected url = ''

    protected connection: WebSocket | null = null

    constructor (config: Config) {
        this.config = Object.assign(
            {
                bufferLength: 0,
                retryInterval: 5000,
            },
            config,
        )
    }

    protected connectWebsocket () {
        const url = new URL(this.url)

        this.connection = new WebSocket(url.toString())
        this.connection.addEventListener('message', msg => {
            const data = { ...JSON.parse(msg.data), time: dayjs(new Date()).format('HH:mm:ss') }
            this.EE.emit('data', [data])
        })

        this.connection.addEventListener('error', err => {
            this.EE.emit('error', err)
            this.connection?.close()
            setTimeout(this.connectWebsocket, this.config.retryInterval)
        })
    }

    connect (url: string) {
        if (this.url === url && this.connection) {
            return
        }
        this.url = url
        this.connection?.close()
        this.connectWebsocket()
    }

    subscribe (event: string, callback: (data: T[]) => void) {
        this.EE.addListener(event, callback)
    }

    unsubscribe (event: string, callback: (data: T[]) => void) {
        this.EE.removeListener(event, callback)
    }

    destory () {
        this.EE.removeAllListeners()
        this.connection?.close()
        this.connection = null
    }
}
