import Toast from "toastify-js"

const getVersion = (): Promise<string> =>
    new Promise((resolve) => {
        chrome.runtime.sendMessage(
            {
                id: "fetchText",
                url: "https://raw.githack.com/jameslinimk/chess-com-cheater/master/static/manifest.json",
            },
            (response) => {
                if (response?.error) resolve(null)
                resolve(response.response)
            }
        )
    })

export const checkVersion = async () => {
    const res = await getVersion()
    if (!res) return

    let manifest: { version: string }
    try {
        manifest = JSON.parse(res)
    } catch {
        return
    }

    const url = chrome.runtime.getURL("manifest.json")
    const local: { version: string } = await (await fetch(url)).json()

    if (local.version !== manifest.version) {
        Toast({
            text: "New version available, click here to update!",
            duration: 10000,
            gravity: "top",
            position: "center",
            style: {
                background: "#F3654C",
                boxShadow: "0 10px 16px 0 rgba(0,0,0,0.2),0 6px 20px 0 rgba(0,0,0,0.19)",
            },
            onClick: () => {
                window.open("https://github.com/jameslinimk/chess-com-cheater/releases/latest", "_blank")
            },
        }).showToast()
    }
}
