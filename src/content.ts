import { Chess } from "chess.js"
import { engine } from "./engine.js"
import { loadPopup } from "./popup.js"
import { colorLog } from "./util.js"

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

            console.log(`(${x}, ${y}) ${pieceStr}`)

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
    return fen.join("/")
}

export const getChess = () => {
    const moves = []
    const moveDivs = document.querySelectorAll("div[data-ply]:not(.time-white):not(.time-black)")
    for (const moveDiv of Array.from(moveDivs)) {
        const piece = moveDiv.children[0]?.getAttribute("data-figurine") ?? ""
        const mv = moveDiv.textContent
        moves.push(mv.endsWith("=") ? mv + piece : piece + mv)
    }

    const chess = new Chess()
    chess.loadPgn(moves.join(" "))
    return chess
}

colorLog("green", "Starting chess.com cheats...")
engine

loadPopup()
