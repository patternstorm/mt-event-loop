import {MessagePort, parentPort} from "worker_threads"
import {v4 as uuidv4} from 'uuid'
import { Func } from "./Proxy"
import { isPresent } from "ts-is-present"

async function load(call: Func.Call): Promise<Function> {
    if (isPresent(call["className"])) {
        const module = await import(call.module)
        console.log(`module keys=${JSON.stringify(Object.keys(module))} values=${JSON.stringify(Object.values(module))}`)
        const className: string = call["className"]
        console.log(`Instantiating ${className} ${JSON.stringify(module[className])}...`)
        const object = new module[className]()
        console.log(`Object ${JSON.stringify(Object.keys(object))} successfully instantiated`)
        const func: Function = object[call.funcName]
        return func
    } else {
        const module = await import(call.module)
        const func: Function = module[call.funcName]
        return func
    }
}
class Thread {
    id: string
    queue: Array<Func.Call>
    stop: boolean

    constructor() {
        this.id = uuidv4()
        this.stop = false
        this.queue = []
    }

    private delay(ms: number): Promise<unknown> {
        return new Promise(resolve => setTimeout(resolve, ms))
    }

    async tick(): Promise<void> {
        if (this.queue.length > 0) {
            const call: Func.Call = this.queue[0]
            const func: Function = await load(call)
            console.log(`Executing function ${call.funcName} with args=${JSON.stringify(call.args)} in thread ${this.id}`)
            const output: any = func.apply(null, call.args)
            console.log(`function ${call.funcName} with args=${JSON.stringify(call.args)} returned ${JSON.stringify(output)} in thread ${this.id}`)
            this.queue = this.queue.slice(1)
        } else {
            console.log(`Nothing to do in thread ${thread.id}`)
            await this.delay(1000)
        }
    }

    async run(): Promise<void> {
        console.log(`Thread ${this.id} running...`)
        while (!this.stop) {
            await this.tick()
        }
    }

    onMessage(msg: any): void {
        console.log(`Processing msg=${JSON.stringify(msg)} in thread ${this.id}`)
        const call: Func.Call = msg
        this.queue.push(msg)
    }
}

const thread: Thread = new Thread(); //Semi-colon required

(parentPort as MessagePort).on("message", (msg: any) => {
    console.log(`Received msg=${JSON.stringify(msg)}`)
    thread.onMessage(msg)
})

async function main(): Promise<Thread> {
    await thread.run()
    return thread
}

main().then((thread) => {

}).catch(e => {
    const err: Error = e as Error
    console.log(`ERROR: ${err.message}`)
})