import { Chess } from "chess.js"
import { engine } from "./engine.js"
import { loadPopup } from "./popup.js"
import { colorLog } from "./util.js"
import { checkVersion } from "./version.js"

export const getMoveCount = () => document.querySelectorAll("div[data-ply]:not(.time-white):not(.time-black)").length

export const getFen = () => {
	const fen = []
	for (let y = 8; y > 0; y--) {
		let row = ""
		let empty = 0
		for (let x = 1; x <= 8; x++) {
			const elms = document.getElementsByClassName(`square-${x}${y}`)
			const classList = Array.from(elms).find((e) => !e.classList.contains("highlight"))?.classList
			const classes = classList ? Array.from(classList) : []

			let pieceStr = classes.find((c) => c.length === 2)

			if (!pieceStr) {
				empty += 1
				if (x === 8) row += empty
				continue
			}

			if (empty !== 0) {
				row += empty
				empty = 0
			}

			const [color, piece] = pieceStr
			if (color === "w") row += piece.toUpperCase()
			else row += piece.toLowerCase()
		}
		fen.push(row)
	}
	const turn = getMoveCount() % 2 === 0 ? "w" : "b"
	return `${fen.join("/")} ${turn} - - 0 1`
}

const getMoves = () => {
	const moves = []
	const moveDivs = document.querySelectorAll("div[data-ply]:not(.time-white):not(.time-black)")
	for (const moveDiv of Array.from(moveDivs)) {
		const piece = moveDiv.children[0]?.getAttribute("data-figurine") ?? ""
		const mv = moveDiv.textContent
		moves.push(mv.endsWith("=") ? mv + piece : piece + mv)
	}
	return moves.join(" ")
}

export const getChess = (forcedGamemode: string = null) => {
	const gamemode = (forcedGamemode ?? (document.getElementById("cc-current-gamemode") as HTMLSpanElement).innerText) === "Standard"

	const moves = gamemode ? getMoves() : getFen()
	if (moves.length === 0) throw new Error("No game found")

	const chess = new Chess()
	try {
		if (!gamemode) chess.load(moves)
		else chess.loadPgn(moves)
		return chess
	} catch {
		if (gamemode) {
			const chess2 = new Chess()
			try {
				chess2.load(getFen())
				return chess2
			} catch {
				throw new Error("No game found")
			}
		}
		throw new Error("No game found")
	}
}

colorLog("green", "Starting chess.com cheats...")
checkVersion()
engine

// Toastify css
const css = document.head.appendChild(document.createElement("link"))
css.rel = "stylesheet"
css.type = "text/css"
css.href = "https://cdn.jsdelivr.net/npm/toastify-js/src/toastify.min.css"

loadPopup()
