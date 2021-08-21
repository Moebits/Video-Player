import {app, BrowserWindow, dialog, globalShortcut, ipcMain, shell} from "electron"
import {autoUpdater} from "electron-updater"
import Store from "electron-store"
import path from "path"
import ffmpeg from "fluent-ffmpeg"
import process from "process"
import "./dev-app-update.yml"
import pack from "./package.json"
import fs from "fs"

process.setMaxListeners(0)
let window: Electron.BrowserWindow | null
let ffmpegPath = path.join(app.getAppPath(), "../../ffmpeg/ffmpeg.exe") as any
if (!fs.existsSync(ffmpegPath)) ffmpegPath = undefined
if (ffmpegPath) ffmpeg.setFfmpegPath(ffmpegPath)
autoUpdater.autoDownload = false
const store = new Store()

ipcMain.handle("get-state", () => {
  return store.get("state", {})
})

ipcMain.handle("save-state", (event, newState: any) => {
  let state = store.get("state", {}) as object
  state = {...state, ...newState}
  store.set("state", state)
})

ipcMain.handle("upload-file", () => {
  window?.webContents.send("upload-file")
})

ipcMain.handle("reverse-video", async (event, videoFile) => {
    const baseFlags = ["-pix_fmt", "yuv420p", "-movflags", "+faststart"]
    const ext = path.extname(videoFile)
    const name = path.basename(videoFile, ext)
    const vidDest = path.join(__dirname, `assets/videos`)
    if (!fs.existsSync(vidDest)) fs.mkdirSync(vidDest, {recursive: true})
    const newDest = path.join(vidDest, `./${name}_reverse${ext}`)
    if (fs.existsSync(newDest)) return newDest
    await new Promise<void>((resolve) => {
        ffmpeg(videoFile).outputOptions([...baseFlags, "-vf", "reverse", "-af", "areverse"])
        .save(newDest)
        .on("end", () => {
            resolve()
        })
    })
    return newDest
})

ipcMain.handle("select-file", async () => {
  if (!window) return
  const files = await dialog.showOpenDialog(window, {
    filters: [
      {name: "All Files", extensions: ["*"]},
      {name: "Video", extensions: ["mp4", "mkv", "mov", "avi"]}
    ],
    properties: ["openFile"]
  })
  return files.filePaths[0] ? files.filePaths[0] : null
})

ipcMain.handle("install-update", async (event) => {
  await autoUpdater.downloadUpdate()
  autoUpdater.quitAndInstall()
})

ipcMain.handle("check-for-updates", async (event, startup: boolean) => {
  window?.webContents.send("close-all-dialogs", "version")
  const update = await autoUpdater.checkForUpdates()
  const newVersion = update.updateInfo.version
  if (pack.version === newVersion) {
    if (!startup) window?.webContents.send("show-version-dialog", null)
  } else {
    window?.webContents.send("show-version-dialog", newVersion)
  }
})

ipcMain.handle("get-opened-file", () => {
  return process.argv[1]
})

const openFile = (argv?: any) => {
  let file = argv ? argv[2] : process.argv[1]
  window?.webContents.send("open-file", file)
}

const singleLock = app.requestSingleInstanceLock()

if (!singleLock) {
  app.quit()
} else {
  app.on("second-instance", (event, argv) => {
    if (window) {
      if (window.isMinimized()) window.restore()
      window.focus()
    }
    openFile(argv)
  })

  app.on("ready", () => {
    window = new BrowserWindow({width: 900, height: 650, minWidth: 720, minHeight: 450, frame: false, backgroundColor: "#f53171", center: true, webPreferences: {nodeIntegration: true, contextIsolation: false, enableRemoteModule: true, webSecurity: false}})
    window.loadFile(path.join(__dirname, "index.html"))
    window.removeMenu()
    openFile()
    window.on("closed", () => {
      window = null
    })
    globalShortcut.register("Control+Shift+I", () => {
      window?.webContents.toggleDevTools()
    })
  })
}

app.allowRendererProcessReuse = false
