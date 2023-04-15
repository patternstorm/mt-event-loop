import {Worker} from "worker_threads"
import { MonoidNumber } from "mt-event-loop-functions"
import {Func, execute} from "./Proxy"

async function add(x: number, y: number): Promise<number> {
    return x + y
}

async function delay(ms: number): Promise<unknown> {
    return new Promise(resolve => setTimeout(resolve, ms))
}

async function main(): Promise<Worker[]> {
    const worker: Worker = new Worker("./dist/main/src/Thread.js")
    // let call: Func.Call = new Func.Call(add,[2,3])
    // await delay(2000)
    // console.log(`Sending ${JSON.stringify(call)} to worker thread...`)
    // worker.postMessage(call)
    // await delay(2000)
    //const monoidNumber: MonoidNumber = new MonoidNumber()
    const call: Func.Call.Method = new Func.Call.Method("mt-event-loop-functions", "MonoidNumber", "op", [2,3])
    const output: any = await execute(call)
    console.log(`Execute(${JSON.stringify(call)})=${output}`)
    await delay(2000)
    console.log(`Sending ${JSON.stringify(call)} to worker thread...`)
    worker.postMessage(call)
    await delay(2000)
    return [worker]
}

main().then((workers) => {
    console.log("main finished...Terminating workers")
    workers.map(worker => worker.terminate())
}).catch(e => {
    const err: Error = e as Error
    console.log(`main Error: ${err.message}`)
})