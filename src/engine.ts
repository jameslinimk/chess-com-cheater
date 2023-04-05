import type { Chess } from "chess.js"
import { loadArrows } from "./arrows.js"
import { getChess, getMoves } from "./content.js"
import type { Config } from "./types.js"
import { colorLog, retrieveWindowVariable } from "./util.js"

const config: Config = retrieveWindowVariable("Config")
if (!config) colorLog("red", "Config not found, reverting to default engine worker path...")

const defaultEngine = "/bundles/app/js/vendor/jschessengine/stockfish.asm.1abfa10c.js"
export let engine = new Worker(config?.pathToNonWasmEngine ?? defaultEngine)

interface Line {
    moves: string[]
    evaluation: string
}

interface Info {
    game: Chess
    depth: number
    evaluation: string
    lines: [Line, Line, Line]
}

const defaultLines = '[{"moves":[],"evaluation":""},{"moves":[],"evaluation":""},{"moves":[],"evaluation":""}]'

export const info = {
    game: null,
    depth: 0,
    evaluation: "",
    lines: JSON.parse(defaultLines),
} as Info

let lastMoves = ""
let checker = null

export const startEval = async (chess: Chess, multilines = 1, callback: () => unknown) => {
    loadArrows()

    info.lines = JSON.parse(defaultLines)
    info.game = chess
    lastMoves = getMoves()
    const fen = chess.fen()

    checker = setInterval(() => {
        const curMoves = getMoves()
        if (curMoves !== lastMoves) {
            lastMoves = curMoves
            engine.terminate()
            engine = new Worker(config?.pathToNonWasmEngine ?? defaultEngine)
            startEval(getChess(), multilines, callback)
        }
    }, 100)

    engine.postMessage(`setoption name MultiPV value ${multilines}`)
    engine.postMessage(`position fen ${fen}`)
    engine.postMessage("go infinite")

    engine.onmessage = (msg) => {
        const data = parseUci(msg.data)
        if (data.command !== "info") return

        const ml = parseInt(data.args["multipv"])
        const depth = parseInt(data.args["depth"])
        const mvs = data.args["pv"]?.split(" ")
        const cp = parseInt(data.args["cp"]) / 100
        const mate = data.args["mate"]
        const evaluation = !mate ? `${cp}` : parseInt(mate) > 0 ? `#${mate}` : `-#${-mate}`
        if (!ml || !mvs) return

        info.depth = depth
        if (ml === 1) info.evaluation = evaluation
        if (ml <= 3) {
            info.lines[ml - 1].evaluation = evaluation
            info.lines[ml - 1].moves = mvs
        }
        callback()
    }
}

export const stopEval = (callback: () => unknown) => {
    clearInterval(checker)
    engine.terminate()
    engine = new Worker(config?.pathToNonWasmEngine ?? defaultEngine)
    callback()
}

type UciCommands =
    | "id"
    | "uciok"
    | "readyok"
    | "copyprotection"
    | "registration"
    | "option"
    | "info"
    | "bestmove"
    | "Stockfish.js"
const uciInfo: Record<UciCommands, string[]> = {
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
        "bmc",
    ],
    bestmove: ["main", "ponder"],
    "Stockfish.js": [],
}

const parseUci = (uci: string) => {
    const command = uci.split(" ")[0] as UciCommands
    const args = uci.split(" ").slice(1)

    const info = uciInfo[command]
    if (!info) throw new Error(`Unknown UCI command: ${uci}`)
    if (info.length === 0) return { command, args: {} }
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
