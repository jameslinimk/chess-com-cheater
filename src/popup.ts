import { getCurrentMove, getFen, validateFen } from "./content.js"
import { unselectAll } from "./util.js"

const html = `
<div class="cc-parent" id="cc-parent">
	<div class="cc-dragger" id="cc-dragger"> </div>

	<div class="cc-content">
		<h1 class="cc-title">
			Cheat menu
		</h1>

		<p class="cc-subtitle">
			Hide with shift+k
		</p>

		Current color: <span id="cc-current-color">White</span>
		<br />
		<button class="cc-button" id="cc-white-button">
			White
		</button>
		<button class="cc-button" id="cc-black-button">
			Black
		</button>

		<br />
		<br />
		<button class="cc-button" id="cc-test-button">
			Test
		</button>
		<br />
		Depth: 100
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
	box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
	z-index: 2147483647;
}

.cc-dragger {
	height: 20px;
	background-color: #A59D95;
	cursor: pointer;
}

.cc-content {
	height: 300px;
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
}
`

export const loadPopup = () => {
    document.body.appendChild(document.createElement("style")).innerHTML = css

    const div = document.body.appendChild(document.createElement("div"))
    div.innerHTML = html

    const parent = document.getElementById("cc-parent") as HTMLDivElement
    if (localStorage.getItem("cc-popup") === "false") parent.style.display = "none"

    document.addEventListener("keydown", (event) => {
        if (event.key.toLowerCase() === "k" && event.shiftKey) {
            if (parent.style.display === "none") {
                parent.style.display = "flex"
                localStorage.setItem("cc-popup", "true")
            } else {
                parent.style.display = "none"
                localStorage.setItem("cc-popup", "false")
            }
        }
    })

    const dragger = document.getElementById("cc-dragger") as HTMLDivElement
    const x = localStorage.getItem("cc-popup-x")
    const y = localStorage.getItem("cc-popup-y")
    if (x && y) {
        parent.style.left = x
        parent.style.top = y
    }

    dragger.addEventListener("mousedown", (event) => {
        unselectAll()
        document.body.style.userSelect = "none"

        const offsetX = event.clientX - parent.offsetLeft
        const offsetY = event.clientY - parent.offsetTop

        const mousemove = (e: MouseEvent) => {
            parent.style.left = `${e.clientX - offsetX}px`
            parent.style.top = `${e.clientY - offsetY}px`

            const rect = parent.getBoundingClientRect()
            if (rect.left < 0) parent.style.left = "0px"
            if (rect.top < 0) parent.style.top = "0px"
            if (rect.right > window.innerWidth) parent.style.left = `${window.innerWidth - rect.width}px`
            if (rect.bottom > window.innerHeight) parent.style.top = `${window.innerHeight - rect.height}px`

            localStorage.setItem("cc-popup-x", parent.style.left)
            localStorage.setItem("cc-popup-y", parent.style.top)
        }

        document.addEventListener("mousemove", mousemove)
        document.addEventListener("mouseup", () => {
            document.body.style.userSelect = "auto"
            document.removeEventListener("mousemove", mousemove)
        })
    })

    const currentColor = document.getElementById("cc-current-color") as HTMLSpanElement
    const whiteButton = document.getElementById("cc-white-button") as HTMLButtonElement
    const blackButton = document.getElementById("cc-black-button") as HTMLButtonElement

    whiteButton.addEventListener("click", () => (currentColor.innerText = "White"))
    blackButton.addEventListener("click", () => (currentColor.innerText = "Black"))

    const testButton = document.getElementById("cc-test-button") as HTMLButtonElement
    testButton.addEventListener("click", () => {
        const fen = getFen()
        const valid = validateFen(fen)
        const current = getCurrentMove()

        console.log({ fen, valid, current })
    })
}
