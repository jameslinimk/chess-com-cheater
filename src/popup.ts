import type { Chess } from "chess.js"
import copy from "copy-to-clipboard"
import { clearArrows, createArrow, hideArrows, showArrows } from "./arrows.js"
import { getChess } from "./content.js"
import { info, startEval, stopEval, updateEngine } from "./engine.js"
import { toast, unselectAll } from "./util.js"

const inactiveColor = "#7286D3"
const activeColor = "#D2001A"

const html =
    "<div class=cc-parent id=cc-parent><div class=cc-dragger id=cc-dragger></div><div class=cc-content><h1 class=cc-title>Cheat menu <a class=cc-help href=https://github.com/jameslinimk/chess-com-cheater target=_blank>❓</a></h1><p class=cc-subtitle>Hide with shift+a</p>Current engine: <span id=cc-current-engine>ASM</span><br><button class=cc-button id=cc-asm-button>ASM</button> <button class=cc-button id=cc-single-button>Single thread</button><br>Current color: <span id=cc-current-color>White</span><br><button class=cc-button id=cc-white-button>White</button> <button class=cc-button id=cc-black-button>Black</button><br>Multi lines: <span id=cc-current-multiline>3</span> <button class=cc-button id=cc-ml-plus-button style=padding-left:4px;padding-right:4px>+</button> <button class=cc-button id=cc-ml-minus-button style=padding-left:7px;padding-right:7px>-</button><br><br><button class=cc-button id=cc-start-button style=background-color:{};>Start hack</button><br><br>Best move: <span id=cc-current-bm>N/A</span><br>Eval (for white): <span id=cc-current-eval>0</span><br>Depth: <span id=cc-current-depth>0</span><br><br><button class=cc-button id=cc-fen-button>Copy FEN</button> <button class=cc-button id=cc-pgn-button>Copy PGN</button><br><div class=cc-center-parent><button class=cc-button id=cc-lichess-button>Open in lichess</button></div></div></div>"
const css =
    ".cc-parent {display: flex;flex-direction: column;position: fixed;top: 100px;left: 50px;box-shadow: 0 10px 16px 0 rgba(0,0,0,0.2),0 6px 20px 0 rgba(0,0,0,0.19);z-index: 2147483647;width: 231px;}.cc-dragger {height: 20px;background-color: #A59D95;cursor: grab;}.cc-content {background-color: #FAF9F6;box-sizing: border-box;padding: 10px;color: black;font-family: Verdana, sans-serif;}.cc-title {margin-top: 0px;margin-bottom: 0px;margin-right: 0px;margin-left: 0px;text-align: center;}.cc-help {cursor: pointer;margin-left: -2px;}.cc-subtitle {margin-top: 0px;margin-bottom: 10px;margin-right: 0px;margin-left: 0px;text-align: center;font-size: 13px;}.cc-button {font-family: Verdana, sans-serif;background-color: #413931;border: none;color: white;padding: 5px 12px;text-align: center;text-decoration: none;display: inline-block;font-size: 16px;margin: 4px 0px;cursor: pointer;transition: all 0.15s ease-in-out;}.cc-button:hover {background-color: #A59D95 !important;}.cc-center-parent {display: flex;justify-content: center;align-items: center;width: 100%;}"

export const loadPopup = () => {
    document.head.appendChild(document.createElement("style")).innerHTML = css

    const div = document.body.appendChild(document.createElement("div"))
    div.innerHTML = html

    const parent = document.getElementById("cc-parent") as HTMLDivElement
    if (localStorage.getItem("cc-popup") === "false") {
        parent.style.display = "none"
        toast("Hack menu is hidden. Press shift+a to show it.", "#413931")
    }

    /* ---------------------------- Hide with shift+a --------------------------- */
    document.addEventListener("keydown", (event) => {
        if (event.key.toLowerCase() === "a" && event.shiftKey) {
            if (parent.style.display === "none") {
                showArrows()
                parent.style.display = "flex"
                localStorage.setItem("cc-popup", "true")
            } else {
                hideArrows()
                parent.style.display = "none"
                localStorage.setItem("cc-popup", "false")
            }
        }
    })

    /* -------------------------------- Dragging -------------------------------- */
    const dragger = document.getElementById("cc-dragger") as HTMLDivElement
    const x = localStorage.getItem("cc-popup-x")
    const y = localStorage.getItem("cc-popup-y")
    if (x && y) {
        parent.style.left = x
        parent.style.top = y
    }

    const boundParent = () => {
        const rect = parent.getBoundingClientRect()
        if (rect.left < 0) parent.style.left = "0px"
        if (rect.top < 0) parent.style.top = "0px"
        if (rect.right > document.body.clientWidth) parent.style.left = `${document.body.clientWidth - rect.width}px`
        if (rect.bottom > window.innerHeight) parent.style.top = `${window.innerHeight - rect.height}px`
    }

    dragger.addEventListener("mousedown", (event) => {
        unselectAll()
        document.body.style.userSelect = "none"
        dragger.style.cursor = "grabbing"

        const offsetX = event.clientX - parent.offsetLeft
        const offsetY = event.clientY - parent.offsetTop

        const mousemove = (e: MouseEvent) => {
            parent.style.left = `${e.clientX - offsetX}px`
            parent.style.top = `${e.clientY - offsetY}px`
            boundParent()

            localStorage.setItem("cc-popup-x", parent.style.left)
            localStorage.setItem("cc-popup-y", parent.style.top)
        }

        document.addEventListener("mousemove", mousemove)
        document.addEventListener("mouseup", () => {
            document.body.style.userSelect = "auto"
            dragger.style.cursor = "grab"
            document.removeEventListener("mousemove", mousemove)
        })
    })
    window.addEventListener("resize", () => boundParent())

    /* ---------------------------------- Color --------------------------------- */
    const currentColor = document.getElementById("cc-current-color") as HTMLSpanElement
    const localColor = localStorage.getItem("cc-popup-color")
    if (localColor) currentColor.innerText = localColor

    const whiteButton = document.getElementById("cc-white-button") as HTMLButtonElement
    const blackButton = document.getElementById("cc-black-button") as HTMLButtonElement

    const saveColor = () => localStorage.setItem("cc-popup-color", currentColor.innerText)
    whiteButton.addEventListener("click", () => {
        currentColor.innerText = "White"
        saveColor()
    })
    blackButton.addEventListener("click", () => {
        currentColor.innerText = "Black"
        saveColor()
    })

    /* --------------------------------- Engine --------------------------------- */
    const currentEngine = document.getElementById("cc-current-engine") as HTMLSpanElement
    const localEngine = localStorage.getItem("cc-popup-engine")
    if (localEngine) currentEngine.innerText = localEngine

    const asmButton = document.getElementById("cc-asm-button") as HTMLButtonElement
    const singleButton = document.getElementById("cc-single-button") as HTMLButtonElement

    const saveEngine = () => localStorage.setItem("cc-popup-engine", currentEngine.innerText)
    asmButton.addEventListener("click", () => {
        currentEngine.innerText = "ASM"
        saveEngine()
        updateEngine()
    })
    singleButton.addEventListener("click", () => {
        currentEngine.innerText = "Single"
        saveEngine()
        updateEngine()
    })

    /* ------------------------------- Multilines ------------------------------- */
    const currentMultiline = document.getElementById("cc-current-multiline") as HTMLSpanElement
    const localML = localStorage.getItem("cc-popup-multilines")
    if (localML) currentMultiline.innerText = localML

    const plusButton = document.getElementById("cc-ml-plus-button") as HTMLButtonElement
    const minusButton = document.getElementById("cc-ml-minus-button") as HTMLButtonElement

    const saveML = () => localStorage.setItem("cc-popup-multilines", currentMultiline.innerText)
    plusButton.addEventListener("click", () => {
        const current = parseInt(currentMultiline.innerText)
        currentMultiline.innerText = `${Math.min(current + 1, 3)}`
        saveML()
    })
    minusButton.addEventListener("click", () => {
        const current = parseInt(currentMultiline.innerText)
        currentMultiline.innerText = `${Math.max(current - 1, 1)}`
        saveML()
    })

    /* ------------------------------ Start button ------------------------------ */
    const currentBM = document.getElementById("cc-current-bm") as HTMLSpanElement
    const currentEval = document.getElementById("cc-current-eval") as HTMLSpanElement
    const currentDepth = document.getElementById("cc-current-depth") as HTMLSpanElement

    const startButton = document.getElementById("cc-start-button") as HTMLButtonElement
    startButton.addEventListener("click", () => {
        if (startButton.innerText === "Stopping...") return

        if (startButton.innerText === "Start hack") {
            let chess: Chess
            try {
                chess = getChess()
            } catch {
                toast("You must be in a game (with at least 1 move) to start the hack")
                return
            }

            startButton.innerText = "Stop hack"
            startButton.style.backgroundColor = activeColor
            startEval(chess, parseInt(currentMultiline.innerText), () => {
                currentBM.innerText = info?.lines[0]?.moves?.[0] ?? "N/A"

                // Just switching the evaluation sign if the color is black
                const color = currentColor.innerText === "White"
                const ev = parseFloat(info.evaluation)
                currentEval.innerText = color
                    ? `${info.evaluation}`
                    : !Number.isNaN(ev)
                    ? `${-ev}`
                    : info.evaluation.startsWith("-")
                    ? info.evaluation.slice(1)
                    : `-${info.evaluation}`

                currentDepth.innerText = info.cloud ? `${info.depth} (cloud)` : `${info.depth}`

                clearArrows()
                for (let i = 0; i < info.lines.length; i++) {
                    if (i >= parseInt(currentMultiline.innerText)) break

                    const move = info.lines[i]?.moves?.[0]
                    if (!move) continue

                    const from = move.slice(0, 2)
                    const to = move.slice(2, 4)

                    const opacity = (() => {
                        if (i === 0) return 1
                        if (i === 1) return 0.3
                        if (i === 2) return 0.1
                    })()
                    createArrow(from, to, opacity)
                }
            })
            return
        }

        startButton.innerText = "Stopping..."
        stopEval(() => {
            clearArrows()
            startButton.innerText = "Start hack"
            startButton.style.backgroundColor = inactiveColor
        })
    })

    const gameExists = () => {
        if (!info?.game) {
            try {
                info.game = getChess()
            } catch {
                toast("You must be in a game (with at least 1 move) to use this feature.")
                return false
            }
        }
        return true
    }

    /* ------------------------------ Copy buttons ------------------------------ */
    const fenButton = document.getElementById("cc-fen-button") as HTMLButtonElement
    const pgnButton = document.getElementById("cc-pgn-button") as HTMLButtonElement

    fenButton.addEventListener("click", () => {
        if (!gameExists()) return
        copy(info.game.fen())
        toast("FEN copied to clipboard.", "#413931")
    })
    pgnButton.addEventListener("click", () => {
        if (!gameExists()) return
        copy(info.game.pgn())
        toast("PGN copied to clipboard.", "#413931")
    })

    /* ----------------------------- Lichess button ----------------------------- */
    const lichessButton = document.getElementById("cc-lichess-button") as HTMLButtonElement
    lichessButton.addEventListener("click", () => {
        if (!gameExists()) return
        window.open(`https://lichess.org/analysis/standard/${info.game.fen().replaceAll(" ", "_")}`, "_blank")
    })
}
