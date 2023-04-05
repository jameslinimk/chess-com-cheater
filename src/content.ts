import { Chess } from "chess.js"
import { engine } from "./engine.js"
import { loadPopup } from "./popup.js"
import { colorLog } from "./util.js"
import { checkVersion } from "./version.js"

export const getMoveCount = () => document.querySelectorAll("div[data-ply]:not(.time-white):not(.time-black)").length

export const getMoves = () => {
    const moves = []
    const moveDivs = document.querySelectorAll("div[data-ply]:not(.time-white):not(.time-black)")
    for (const moveDiv of Array.from(moveDivs)) {
        const piece = moveDiv.children[0]?.getAttribute("data-figurine") ?? ""
        const mv = moveDiv.textContent
        moves.push(mv.endsWith("=") ? mv + piece : piece + mv)
    }
    return moves.join(" ")
}

export const getChess = () => {
    const moves = getMoves()
    if (moves.length === 0) throw new Error("No game found")

    const chess = new Chess()
    try {
        chess.loadPgn(moves)
    } catch {
        throw new Error("No game found")
    }
    return chess
}

colorLog("green", "Starting chess.com cheats...")
checkVersion()
engine

// Inject toastify
const css = document.head.appendChild(document.createElement("link"))
css.rel = "stylesheet"
css.type = "text/css"
css.href = "https://cdn.jsdelivr.net/npm/toastify-js/src/toastify.min.css"

const js = document.head.appendChild(document.createElement("script"))
js.type = "text/javascript"
js.src = "https://cdn.jsdelivr.net/npm/toastify-js"

loadPopup()
