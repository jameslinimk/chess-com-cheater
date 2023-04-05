import fetch from "sync-fetch"
import Toast from "toastify-js"

const version = "1.0.0"

export const checkVersion = () => {
    const gitUrl = "https://raw.githack.com/jameslinimk/chess-com-cheater/master/src/version.ts"
    const gitVersion = fetch(gitUrl)
        .text()
        .match(/(?<=")(.*?)(?=")/)[2]

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
