export interface Config {
    domain: Domain
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
    pathToPersonalityBooks: PersonalityBooks
    threadedEnginePaths: ThreadedEnginePaths
    oldThemes: boolean
    isPlay: boolean
    isStaff: boolean
    noAvatar: string
    wdlJsonModel: string
    wdlWeights: string
    ad: Ad
    adCustomPath: string
    pathToTinyMCE: string
    pathToFCMWorker: string
    pathToDiagramViewerCSS: string
    pathToDiagramViewerJS: string
}

interface PersonalityBooks {
    aggressive: string
    balanced: string
    beginner: string
    classical: string
    "f-pawner": string
    fischer: string
    gambit: string
    indian: string
    nakamura: string
    offbeat: string
    positional: string
    quick_queen: string
    rensch: string
    winger: string
}

interface Domain {
    main: string
    static: string
    files: string
    live: string
    live2: string
    live3: string
    voice: string
    cssjs: string
    images: string
    avatars: string
    baseUrl: string
}

interface Ad {
    noAds: boolean
    disabledAds: any[]
}

interface ThreadedEnginePaths {
    stockfish: Stockfish
}

interface Stockfish {
    fakeWorker: FakeWorker
    multiThreaded: MultiThreaded
    singleThreaded: FakeWorker
    asm: string
    fakeWorkerBrowserVersions: FakeWorkerBrowserVersion[]
}

interface FakeWorker {
    loader: string
    engine: string
}

interface FakeWorkerBrowserVersion {
    browser: string
    version: number
}

interface MultiThreaded {
    loader: string
    engine: string
    nnue: string
}
