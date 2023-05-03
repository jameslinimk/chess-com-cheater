import type { Chess } from "chess.js"
import copy from "copy-to-clipboard"
import { clearArrows, createArrow, hideArrows, showArrows } from "./arrows.js"
import { getChess } from "./content.js"
import { info, setMaxDepth, setMultilines, startEval, stopEval, updateEngine } from "./engine.js"
import { toast } from "./util.js"

const inactiveColor = "#7286D3"
const activeColor = "#D2001A"

const html = `
<div class="cc-parent" id="cc-parent">
    <div class="cc-dragger" id="cc-dragger"></div>
    <div class="cc-content">
        <h1 class="cc-title">Cheat menu <a class="cc-help" href="https://github.com/jameslinimk/chess-com-cheater" target="_blank">❓</a></h1>
        <p class="cc-subtitle">Hide with shift+a</p>

        Current engine: <span id="cc-current-engine">Single</span>
        <br />
        <button class="cc-button" id="cc-single-button">
            Single thread
        </button>
        <button class="cc-button" id="cc-asm-button">
            ASM
        </button>

        <br />

        Current color: <span id="cc-current-color">White</span>
        <br />
        <button class="cc-button" id="cc-white-button">
            White
        </button>
        <button class="cc-button" id="cc-black-button">
            Black
        </button>

        <br />

        Multi lines: <span id="cc-current-multiline">3</span>
        <button class="cc-button" style="padding-left: 4px; padding-right: 4px" id="cc-ml-plus-button">+</button>
        <button class="cc-button" style="padding-left: 7px; padding-right: 7px" id="cc-ml-minus-button">-</button>

        <br />

        <div class="cc-slide-container">
            Max depth: <span id="cc-current-max-depth">∞</span>
            <input type="range" min="1" max="31" value="31" class="cc-slider" id="cc-max-depth-slider">
        </div>

        <br />

        <button class="cc-button" style="background-color: ${inactiveColor}" id="cc-start-button">Start hack</button>

        <br />
        <br />

        Best move: <span id="cc-current-bm">N/A</span> <br />
        Eval (for white): <span id="cc-current-eval">0</span> <br />
        Depth: <span id="cc-current-depth">0</span>

        <br />
        <br />

        <button class="cc-button" id="cc-fen-button">
            Copy FEN
        </button>
        <button class="cc-button" id="cc-pgn-button">
            Copy PGN
        </button>
        <br />
        <div class="cc-center-parent">
            <button class="cc-button" id="cc-lichess-button">
                Open in lichess
            </button>
        </div>
    </div>
</div>
`

const css = `
.cc-parent {
    display: flex;
    flex-direction: column;
    position: fixed;
    top: 100px;
    left: 50px;
    box-shadow: 0 10px 16px 0 rgba(0, 0, 0, 0.2),0 6px 20px 0 rgba(0, 0, 0, 0.19);
    z-index: 2147483647;
  width: 231px;
}

.cc-dragger {
    height: 20px;
    background-color: #A59D95;
    cursor: grab;
}

.cc-content {
    background-color: #FAF9F6;
    box-sizing: border-box;
    padding: 10px;
    color: black;
    font-family: Verdana, sans-serif;
}

.cc-title {
    margin-top: 0px;
    margin-bottom: 0px;
    margin-right: 0px;
    margin-left: 0px;
    text-align: center;
}

.cc-help {
    cursor: pointer;
    margin-left: -2px;
}

.cc-subtitle {
    margin-top: 0px;
    margin-bottom: 10px;
    margin-right: 0px;
    margin-left: 0px;
    text-align: center;
    font-size: 13px;
}

.cc-button {
    font-family: Verdana, sans-serif;
    background-color: #413931;
    border: none;
    color: white;
    padding: 5px 12px;
    text-align: center;
    text-decoration: none;
    display: inline-block;
    font-size: 16px;
    margin: 4px 0px;
    cursor: pointer;
    transition: all 0.15s ease-in-out;
}

.cc-button:hover {
    background-color: #A59D95 !important;
}

.cc-center-parent {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
}

.cc-slide-container {
    margin-top: 3px;
}

.cc-slider {
    -webkit-appearance: none;
    width: 100%;
    height: 15px;
    margin-top: 7px;
    border-radius: 5px;
    background: #413931;
    outline: none;
    opacity: 0.7;
    -webkit-transition: 0.2s;
    transition: opacity 0.2s;
}

.cc-slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 25px;
    height: 25px;
    border-radius: 50%;
    background: black;
    cursor: pointer;
}

.cc-slider::-moz-range-thumb {
    width: 25px;
    height: 25px;
    border-radius: 50%;
    background: black;
    cursor: pointer;
}

.cc-slider:hover {
    opacity: 1;
}
`

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
        window.getSelection().removeAllRanges()
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

    const saveML = () => {
        localStorage.setItem("cc-popup-multilines", currentMultiline.innerText)
        setMultilines(parseInt(currentMultiline.innerText))
    }
    setMultilines(parseInt(currentMultiline.innerText))
    plusButton.addEventListener("click", () => {
        const current = parseInt(currentMultiline.innerText)
        currentMultiline.innerText = `${Math.min(current + 1, 5)}`
        saveML()
    })
    minusButton.addEventListener("click", () => {
        const current = parseInt(currentMultiline.innerText)
        currentMultiline.innerText = `${Math.max(current - 1, 1)}`
        saveML()
    })

    /* -------------------------------- Max depth ------------------------------- */
    const currentMaxDepth = document.getElementById("cc-current-max-depth") as HTMLSpanElement
    const localMaxDepth = localStorage.getItem("cc-popup-max-depth")
    if (localMaxDepth) currentMaxDepth.innerText = localMaxDepth

    const maxDepthSlider = document.getElementById("cc-max-depth-slider") as HTMLInputElement
    if (currentMaxDepth.innerText === "∞") maxDepthSlider.value = "31"
    else maxDepthSlider.value = currentMaxDepth.innerText

    let saveMaxDepthDelay: number

    const saveMaxDepth = (delay = true) => {
        if (saveMaxDepthDelay) clearTimeout(saveMaxDepthDelay)
        saveMaxDepthDelay = setTimeout(
            () => {
                localStorage.setItem("cc-popup-max-depth", currentMaxDepth.innerText)
                if (currentMaxDepth.innerText === "∞") setMaxDepth(-1)
                else setMaxDepth(parseInt(currentMaxDepth.innerText))
            },
            delay ? 200 : 0
        )
    }
    saveMaxDepth(false)

    maxDepthSlider.addEventListener("input", () => {
        currentMaxDepth.innerText = parseInt(maxDepthSlider.value) === 31 ? "∞" : maxDepthSlider.value
        saveMaxDepth()
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
            startEval(chess, () => {
                currentBM.innerText = info?.lines[0]?.moves?.[0] ?? "N/A"
                currentEval.innerText = info.evaluation
                currentDepth.innerText = info.cloud ? `${info.depth} (cloud)` : `${info.depth}`

                clearArrows()

                const parse = (evaluation: string) => {
                    const e = (() => {
                        if (evaluation.startsWith("M")) return 100
                        if (evaluation.startsWith("M-")) return -100
                        return parseFloat(evaluation)
                    })()
                    return currentColor.innerText === "White" ? e : -e
                }

                const bestEval = parse(info.evaluation)
                for (let i = 0; i < info.lines.length; i++) {
                    if (i >= parseInt(currentMultiline.innerText)) break

                    const line = info.lines?.[i]
                    const move = line?.moves?.[0]
                    if (!move) continue

                    const from = move.slice(0, 2)
                    const to = move.slice(2, 4)

                    const evaluation = parse(line.evaluation)
                    if (evaluation === bestEval) {
                        createArrow(from, to, 1)
                        continue
                    }

                    const diff = Math.abs(evaluation - bestEval)
                    const opacity = (() => {
                        if (diff > 5) return 0.1
                        if (diff > 3) return 0.2
                        if (diff > 1) return 0.5
                        if (diff > 0.5) return 0.7
                        return 0.9
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

    /* ------------------------------ Copy buttons ------------------------------ */
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

    const copyText = (text: string, name: string) => {
        if (copy(text)) toast(`${name} copied to clipboard.`, "#413931")
    }

    const fenButton = document.getElementById("cc-fen-button") as HTMLButtonElement
    const pgnButton = document.getElementById("cc-pgn-button") as HTMLButtonElement

    fenButton.addEventListener("click", () => {
        if (!gameExists()) return
        copyText(info.game.fen(), "FEN")
        toast("FEN copied to clipboard.", "#413931")
    })
    pgnButton.addEventListener("click", () => {
        if (!gameExists()) return
        copyText(info.game.pgn(), "PGN")
        toast("PGN copied to clipboard.", "#413931")
    })

    /* ----------------------------- Lichess button ----------------------------- */
    const lichessButton = document.getElementById("cc-lichess-button") as HTMLButtonElement
    lichessButton.addEventListener("click", () => {
        if (!gameExists()) return
        window.open(`https://lichess.org/analysis/standard/${info.game.fen().replaceAll(" ", "_")}`, "_blank")
    })
}
