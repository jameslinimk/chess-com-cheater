export const retrieveWindowVariable = (variable: string): any => ({
    threadedEnginePaths: {
        stockfish: {
            fakeWorker: {
                loader: "https://www.chess.com/bundles/app/js/engine/stockfish-nnue-15.1-no-Worker.47c3d633.js",
                engine: "https://www.chess.com/bundles/app/js/engine/stockfish-nnue-15.1-no-Worker.a459ad84.wasm",
            },
            multiThreaded: {
                loader: "https://www.chess.com/bundles/app/js/engine/stockfish-nnue-15.1.274aa595.js",
                engine: "/bundles/app/js/engine/stockfish-nnue-15.1.5f5319f2.wasm",
                nnue: "/bundles/app/js/engine/nn-ad9b42354671.f89fd37b.nnue",
            },
            singleThreaded: {
                loader: "/bundles/app/js/engine/stockfish-single.830cf9cc.js",
                engine: "/bundles/app/js/engine/stockfish-single.8ffa2b70.wasm",
            },
            asm: "/bundles/app/js/engine/stockfish.asm.16fa8540.js",
            fakeWorkerBrowserVersions: [
                {
                    browser: "chrome",
                    version: 109,
                },
            ],
        },
    },
})
