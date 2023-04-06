import Toast from "toastify-js"
import { extractAllText } from "./util.js"

const version = "1.0.2"

const getVersion = (): Promise<string> =>
    new Promise((resolve) => {
        chrome.runtime.sendMessage(
            {
                id: "fetchText",
                url: "https://raw.githack.com/jameslinimk/chess-com-cheater/master/src/version.ts",
            },
            (response) => {
                if (response?.error) resolve(null)
                resolve(response.response)
            }
        )
    })

export const checkVersion = async () => {
    const res = await getVersion()
    const gitVersion = extractAllText(res)[2]

    if (version !== gitVersion) {
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
