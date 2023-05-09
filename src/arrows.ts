import { moveArrowHeads } from "./util.js"

const marker = `
<marker
	id="arrow"
	viewBox="0 0 10 10"
	refX="5"
	refY="5"
	markerWidth="5"
	markerHeight="2.5"
	orient="auto-start-reverse"
>
	<path d="M 0 0 L 10 5 L 0 10 z" />
</marker>
`

const notationToCoords = (notation: string): [number, number] => {
	const [file, rank] = notation
	const x = (file.charCodeAt(0) - 97) * 12.5 + 6.25
	const y = (8 - parseInt(rank)) * 12.5 + 6.25

	const color = document.getElementById("cc-current-color").innerText === "White"
	return color ? [x, y] : flipCoords([x, y])
}

const flipCoords = ([x, y]: [number, number]): [number, number] => [100 - x, 100 - y]

export const createArrow = (_start: string, _end: string, opacity: number) => {
	if (!arrows) return
	const [start, end] = moveArrowHeads(notationToCoords(_start), notationToCoords(_end), 5, 2.5)
	const arrow = arrows.appendChild(document.createElementNS("http://www.w3.org/2000/svg", "line"))

	arrow.setAttribute("opacity", `${opacity}`)
	arrow.setAttribute("marker-end", "url(#arrow)")
	arrow.setAttribute("stroke-width", "2")
	arrow.setAttribute("stroke", "black")
	arrow.setAttribute("x1", `${start[0]}`)
	arrow.setAttribute("y1", `${start[1]}`)
	arrow.setAttribute("x2", `${end[0]}`)
	arrow.setAttribute("y2", `${end[1]}`)
}

export const clearArrows = () => {
	if (!arrows) return
	for (const child of Array.from(arrows.children)) {
		if (child.tagName !== "defs") child.remove()
	}
}

export const hideArrows = () => {
	if (!arrows) return
	arrows.style.display = "none"
}

export const showArrows = () => {
	if (!arrows) return
	arrows.style.display = "block"
}

let arrows: SVGElement = null
export const loadArrows = () => {
	if (arrows) {
		clearArrows()
		return
	}

	arrows = document.createElementNS("http://www.w3.org/2000/svg", "svg")
	arrows.setAttribute("viewBox", "0 0 100 100")

	const defs = arrows.appendChild(document.createElementNS("http://www.w3.org/2000/svg", "defs"))
	defs.innerHTML = marker

	const chessBoard = document.querySelector("chess-board")
	if (!chessBoard) throw new Error("No chess board found")
	chessBoard.appendChild(arrows)
}
