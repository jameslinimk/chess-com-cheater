import { Config } from "./types.js"
import { colorLog, retrieveWindowVariables } from "./util.js"

const config: Config = retrieveWindowVariables(["Config"])["Config"]
if (!config) colorLog("red", "Config not found, reverting to default engine worker path...")

const defaultEngine = "/bundles/app/js/vendor/jschessengine/stockfish.asm.1abfa10c.js"
export const engine = new Worker(config?.pathToNonWasmEngine ?? defaultEngine)

const uciInfo: Record<string, string[]> = {
    id: ["name", "author"],
    uciok: [],
    readyok: [],
    copyprotection: ["main"],
    registration: ["main"],
    option: ["name", "type", "default", "min", "max", "var"],
    info: [
        "depth",
        "seldepth",
        "time",
        "nodes",
        "pv",
        "multipv",
        "score",
        "cp",
        "mate",
        "lowerbound",
        "upperbound",
        "currmove",
        "currmovenumber",
        "hashfull",
        "nps",
        "tbhits",
        "sbhits",
        "cpuload",
        "string",
        "refutation",
        "currline",
    ],
    bestmove: ["main", "ponder"],
}

export const parseUci = (uci: string) => {
    const command = uci.split(" ")[0]
    const args = uci.split(" ").slice(1)

    const info = uciInfo[command]
    if (!info) throw new Error(`Unknown UCI command: ${command}`)
    if (info.length === 0) return { command, args: [] }
    const formattedArgs: Record<string, string> = {}

    if (info.includes("main")) {
        formattedArgs["main"] = args[0]
        args.shift()
    }

    let data = ""
    let lastArg = ""
    for (const arg of args) {
        if (arg !== "main" && info.includes(arg)) {
            if (lastArg) formattedArgs[lastArg] = data.trimEnd()
            lastArg = arg
            data = ""
            continue
        }

        data += arg + " "
    }

    if (lastArg) formattedArgs[lastArg] = data.trimEnd()

    return { command, args: formattedArgs }
}
