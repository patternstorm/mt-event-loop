import {isPresent} from "ts-is-present";

declare global {
    interface Function {
        body(): string
        params(): string
    }
}

Function.prototype.params = function(this: Function): string {
    const funcDef: string = this.toString()
    return funcDef.substring(funcDef.indexOf("(") + 1, funcDef.indexOf(")"))
}

Function.prototype.body = function(this: Function): string {
    const funcDef: string = this.toString()
    return funcDef.substring(funcDef.indexOf("{") + 1, funcDef.lastIndexOf("}"))
}

export type Func = (...args: Func.Args) => Promise<any>

export namespace Func {
    export type Args = any[]

    export class Call {
        args: any[]
        funcName: string
        module: string

        constructor(module: string, funcName: string, args: any[]) {
            this.funcName = funcName
            this.args = args
            this.module = module
        }
    }

    export namespace Call {

        export class Method extends Call {
            className: string

            constructor(module: string, className: string, methodName: string, args: any[]) {
                super(module, methodName, args)
                this.className = className
            }
        }
    }
}

export async function execute(call: Func.Call): Promise<any> {
    if (isPresent(call["className"])) {
        const module = await import(call.module)
        const className: string = call["className"]
        const object = new module[className]
        const func: Function = object[call.funcName]
        return func.apply(object, call.args)
    } else {
        const module = await import(call.module)
        const func: Function = module[call.funcName]
        return func.apply(null, call.args)
    }
}