import { Chess } from "chess.js"
import { engine } from "./engine.js"
import { loadPopup } from "./popup.js"
import { colorLog } from "./util.js"
import { checkVersion } from "./version.js"

export const getMoveCount = () => document.querySelectorAll("div[data-ply]:not(.time-white):not(.time-black)").length

export const getFen = () => {
	let fen_string = ""
	for (var y = 8; y >= 1; y--) {
		for (var x = 1; x <= 8; x++) {
			if (x == 1 && y != 8) fen_string += "/"

			let piece: string = null
			const position = `${x}${y}`

			const classes = document.querySelectorAll(`.piece.square-${position}`)[0]?.classList ?? null
			if (classes !== null) {
				for (var item of (classes as any).values() as string[]) {
					if (item.length == 2) {
						piece = item
					}
				}
			}

			if (piece === null) {
				let previous_char = fen_string.split("").pop()
				if (!isNaN(Number(previous_char))) {
					fen_string = fen_string.substring(0, fen_string.length - 1)
					fen_string += Number(previous_char) + 1
				} else {
					fen_string += "1"
				}
			} else if (piece.split("")[0] === "b") {
				fen_string += piece.split("")[1]
			} else if (piece.split("")[0] === "w") {
				fen_string += piece.split("")[1].toUpperCase()
			}
		}
	}

	const turn = getMoveCount() % 2 === 0 ? "w" : "b"
	return `${fen_string} ${turn}`
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
