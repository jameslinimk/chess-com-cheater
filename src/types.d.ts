export interface Config {
    "cometd.url": string
    "domain.main": string
    "domain.static": string
    "domain.files": string
    "domain.live": string
    "domain.live2": string
    "domain.live3": string
    "domain.voice": string
    "domain.cssjs": string
    "domain.images": string
    "domain.avatars": string
    "domain.baseUrl": string
    isFacebookCanvas: boolean
    facebookId: string
    pathToEngineWorker: string
    pathToEngineWorkerAlt: string
    pathToWasmEngine: string
    pathToNonWasmEngine: string
    pathToKomodoWorker: string
    pathToWasmKomodo: string
    pathToNonWasmKomodo: string
    pathToExplanationEngineWorker: string
    pathToWasmExplanationEngine: string
    pathToEcoJson: string
    pathToBook: string
    pathToBookSmall: string
    pathToWebGL: string
    pathToGamePreviewLoader: string
    pathToPersonalityBooks: { [key: string]: string }
    threadedEnginePaths: ThreadedEnginePaths
    oldThemes: boolean
    isPlay: boolean
    isStaff: boolean
    noAvatar: string
    wdlJsonModel: string
    wdlWeights: string
    "ad.noAds": boolean
    "ad.disabledAds": any[]
    adCustomPath: string
    pathToTinyMCE: string
    pathToFCMWorker: string
    pathToDiagramViewerCSS: string
    pathToDiagramViewerJS: string
}

export interface ThreadedEnginePaths {
    stockfish: Stockfish
}

export interface Stockfish {
    fakeWorker: FakeWorker
    multiThreaded: MultiThreaded
    singleThreaded: FakeWorker
    asm: string
    fakeWorkerBrowserVersions: FakeWorkerBrowserVersion[]
}

export interface FakeWorker {
    loader: string
    engine: string
}

export interface FakeWorkerBrowserVersion {
    browser: string
    version: number
}

export interface MultiThreaded {
    loader: string
    engine: string
    nnue: string
}
