import type { Chess } from "chess.js"
import { loadArrows } from "./arrows.js"
import { getChess, getMoveCount } from "./content.js"
import { cloudEval } from "./lichess.js"
import type { Config } from "./types.js"
import { colorLog } from "./util.js"
import { retrieveWindowVariable } from "./util_firefox.js"

const config: Config = retrieveWindowVariable("Config")
if (!config) colorLog("red", "Config not found, reverting to default engine worker path...")

const singleEngine = config.threadedEnginePaths.stockfish.singleThreaded.loader + "#" + config.threadedEnginePaths.stockfish.singleThreaded.engine
const asmEngine = config.threadedEnginePaths.stockfish.asm

const path = () => {
	const selected = document.getElementById("cc-current-engine") as HTMLSpanElement
	if (selected?.textContent === "ASM") return asmEngine
	return singleEngine
}

export let engine: Worker = null
let maxDepth: number = null
export const setMaxDepth = (depth: number) => (maxDepth = depth)
let multilines: number = null
export const setMultilines = (lines: number) => {
	multilines = lines
	engine?.postMessage(`setoption name MultiPV value ${multilines}`)
}

export const updateEngine = () => {
	engine?.terminate()
	engine = new Worker(path())
}

export interface Line {
	moves: string[]
	evaluation: string
}

interface Info {
	game: Chess
	depth: number
	evaluation: string
	lines: [Line, Line, Line, Line, Line]
	cloud: boolean
}

const defaultLines = '[{"moves":[],"evaluation":""},{"moves":[],"evaluation":""},{"moves":[],"evaluation":""},{"moves":[],"evaluation":""},{"moves":[],"evaluation":""}]'

export const info = {
	game: null,
	depth: 0,
	evaluation: "",
	lines: JSON.parse(defaultLines),
	cloud: false,
} as Info

let lastMoves = -1
let checker = null

const calcEval = (obj: { cp?: number; mate?: number }) => (!obj.mate ? `${obj.cp / 100}` : `M${obj.mate}`)

export const startEval = async (chess: Chess, callback: () => unknown) => {
	updateEngine()
	loadArrows()

	info.lines = JSON.parse(defaultLines)
	info.game = chess
	info.cloud = false

	lastMoves = getMoveCount()
	const fen = chess.fen()

	checker = setInterval(() => {
		const curMoves = getMoveCount()
		if (curMoves !== lastMoves) {
			lastMoves = curMoves
			startEval(getChess(), callback)
		}
	})

	engine.postMessage(`setoption name MultiPV value ${multilines}`)
	engine.postMessage(`position fen ${fen}`)
	engine.postMessage("go infinite")

	const cloud = await cloudEval(fen, multilines)
	if (cloud && cloud.depth <= (maxDepth === -1 ? 100 : maxDepth)) {
		info.cloud = true
		info.depth = cloud.depth
		info.evaluation = calcEval(cloud.pvs[0])
		info.lines = cloud.pvs.map((pv) => ({
			moves: pv.moves.split(" "),
			evaluation: calcEval(pv),
		})) as [Line, Line, Line, Line, Line]

		callback()
		return
	}

	engine.onmessage = (msg) => {
		const data = parseUci(msg.data)
		if (data.command !== "info") return

		const ml = parseInt(data.args["multipv"])
		const depth = parseInt(data.args["depth"])
		const mvs = data.args["pv"]?.split(" ")
		const cp = parseInt(data.args["cp"]) / 100
		const mate = data.args["mate"]
		const evaluation = !mate ? (chess.turn() === "w" ? `${cp}` : `${-cp}`) : chess.turn() === "w" ? `M${mate}` : `M${-mate}`
		if (!ml || !mvs) return

		info.depth = depth
		if (ml === 1) info.evaluation = evaluation
		if (ml <= multilines) {
			info.lines[ml - 1].evaluation = evaluation
			info.lines[ml - 1].moves = mvs
		}

		if (maxDepth !== -1 && depth >= maxDepth) {
			engine.postMessage("stop")
			callback()
		}

		callback()
	}
}

export const stopEval = (callback: () => unknown) => {
	clearInterval(checker)
	updateEngine()
	callback()
}

type UciCommands = "id" | "uciok" | "readyok" | "copyprotection" | "registration" | "option" | "info" | "bestmove" | "Stockfish.js" | "Stockfish"
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
	Stockfish: [],
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
