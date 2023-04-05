const baseUrl = "https://lichess.org/api"

export interface CloudEval {
    fen: string
    knodes: number
    depth: number
    pvs: PV[]
}

export interface PV {
    moves: string
    cp?: number
    mate?: number
}

export const cloudEval = (fen: string, multilines: number): Promise<CloudEval | null> =>
    new Promise((resolve) => {
        chrome.runtime.sendMessage(
            {
                id: "fetchData",
                url: `${baseUrl}/cloud-eval?fen=${fen}&multiPv=${multilines}`,
            },
            (response) => {
                if (response?.error || "error" in response.response) resolve(null)
                resolve(response.response as CloudEval)
            }
        )
    })
