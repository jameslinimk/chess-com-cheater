# Chess.com cheater

| ⚠⚠⚠ NEVER USE THIS ON A REAL CHESS GAME. THIS IS A CHEAT. YOU WILL BE BANNED. THIS PROJECT WAS MADE MERELY FOR EDUCATION PURPOSES! ⚠⚠⚠ |
| -------------------------------------------------------------------------------------------------------------------------------------- |

Runs a Stockfish engine in your chess.com games. Displays the best moves (up to 3) and evaluation for the current board. Uses the bundled ASM/WASM engine on chess.com and the lichess cloud-eval api to get the best move.

Because of the lack of cors headers on chess.com, a faster engine using SharedArrayBuffer is not possible. You can expect *~16 depth in a second* in standard positions, although, in common positions and opening lines, cloud-eval will provide evaluations of 40+ depth (using the lichess api).

The extension gets the current game by looking at the moves on the right hand side. So, you will not be able to start the extension until you (or the opponent) has made a move.

## Installation - Go to the [releases](https://github.com/jameslinimk/chess-com-cheater/releases/latest) and follow the instructions for your browser

## Popup Guide

<img src="./imgs/Screenshot%202023-04-05%20at%2013-21-45%20Play%20Chess%20Online%20Against%20the%20Computer.png" width="20%" alt="Chess.com cheat menu">

*Use the black bar at the top to move the popup window around

- The first few lines are engine options
  - Current engine - Either ASM or Single Threaded WASM. Single is preferred, but is not supported on all browsers
  - Current color - The color you are playing as. The arrows will be flipped if incorrectly configured
  - Multi lines - How many moves to display (the more transparent, the worse)
  - Max depth - The max depth to search to
- The `Start hack`/`Stop hack` button will start/stop the engine
- The next few lines are info about the current evaluation
  - Best move - The top engine move
  - Eval - The evaluation of the current board (1 = 1 pawn) (positive is good for white)
  - Depth - The depth the engine has searched to
- The next few buttons display info about the game
  - Copy FEN - Copies the current FEN to your clipboard
  - Copy PGN - Copies the current PGN to your clipboard
  - Open in lichess - Opens the current board in the lichess analysis board

## ⚠ Must have Chess.com Settings

- You must have "none" for move animations, "arcade" breaks it
- You must have "figurine" for piece notations, "text" breaks it

## How the arrows are drawn

> TLDR, the more transparent the arrow, the worse the move is compared to the best move.

If the difference between the best move's evaluation and the arrows move is:

| Difference     | Arrow opacity |
| -------------- | ------------- |
| `>5`           | 10%           |
| `>3`           | 20%           |
| `>1`           | 50%           |
| `>0.5`         | 70%           |
| any thing else | 90%           |

## Building

```bash
npm i pnpm -g # if you don't have pnpm
pnpm i
pnpm run watch # builds to ./dist and watches for changes
````

## Example

![screenshot](./imgs/Screenshot%202023-04-05%20at%2013-22-22%20Play%20Chess%20Online%20Against%20the%20Computer.png)
