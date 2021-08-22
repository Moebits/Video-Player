import {app, BrowserWindow, dialog, globalShortcut, ipcMain, shell} from "electron"
import {autoUpdater} from "electron-updater"
import Store from "electron-store"
import path from "path"
import ffmpeg from "fluent-ffmpeg"
import process from "process"
import "./dev-app-update.yml"
import pack from "./package.json"
import fs from "fs"
import functions from "./structures/functions"

process.setMaxListeners(0)
let window: Electron.BrowserWindow | null
let ffmpegPath = path.join(app.getAppPath(), "../../ffmpeg/ffmpeg.exe") as any
if (!fs.existsSync(ffmpegPath)) ffmpegPath = undefined
if (ffmpegPath) ffmpeg.setFfmpegPath(ffmpegPath)
autoUpdater.autoDownload = false
const store = new Store()

ipcMain.handle("next", async (event, videoFile: string) => {
  if (videoFile.startsWith("file:///")) videoFile = videoFile.replace("file:///", "")
  const directory = path.dirname(videoFile)
  const files = await functions.getSortedFiles(directory)
  const index = files.findIndex((f) => f === path.basename(videoFile))
  if (index !== -1) {
    if (files[index + 1]) return `file:///${directory}/${files[index + 1]}`
  }
  return null
})

ipcMain.handle("previous", async (event, videoFile: string) => {
  if (videoFile.startsWith("file:///")) videoFile = videoFile.replace("file:///", "")
  const directory = path.dirname(videoFile)
  const files = await functions.getSortedFiles(directory)
  const index = files.findIndex((f) => f === path.basename(videoFile))
  if (index !== -1) {
    if (files[index - 1]) return `file:///${directory}/${files[index - 1]}`
  }
  return null
})

ipcMain.handle("reverse-dialog", async (event, visible: boolean) => {
  window?.webContents.send("close-all-dialogs", "reverse")
  window?.webContents.send("show-reverse-dialog", visible)
})

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

ipcMain.handle("extract-subtitles", async (event, videoFile) => {
    if (videoFile.startsWith("file:///")) videoFile = videoFile.replace("file:///", "")
    const name = path.basename(videoFile, path.extname(videoFile))
    const vidDest = path.join(app.getAppPath(), `../assets/subtitles`)
    if (!fs.existsSync(vidDest)) fs.mkdirSync(vidDest, {recursive: true})
    const newDest = path.join(vidDest, `./${name}.vtt`)
    return new Promise<string>((resolve, reject) => {
        ffmpeg(videoFile)
        .save(newDest)
        .on("end", () => {
            resolve(newDest)
        })
        .on("error", () => reject())
    }).catch(() => "")
})

const splitVideo = async (videoFile: string, savePath: string) => {
  const baseFlags = ["-pix_fmt", "yuv420p", "-movflags", "+faststart"]
  await new Promise<void>((resolve) => {
    ffmpeg(videoFile).outputOptions([...baseFlags, "-acodec", "copy", "-vcodec", "copy", "-f", "segment", "-segment_time", "10", "-reset_timestamps", "1", "-map", "0"])
        .save(savePath)
        .on("end", () => {
            resolve()
        })
  })
  return fs.readdirSync(path.dirname(savePath), {withFileTypes: true}).filter((p) => p.isFile()).map((p) => `${path.dirname(savePath)}/${p.name}`)
}

const reverseSegments = async (segments: string[], savePath: string) => {
  const baseFlags = ["-pix_fmt", "yuv420p", "-movflags", "+faststart"]
  let queue: string[][] = []
  const total = segments.length
  while (segments.length) queue.push(segments.splice(0, 2))
  let counter = 0
  for (let i = 0; i < queue.length; i++) {
    window?.webContents.send("reverse-progress", {current: counter, total})
    await Promise.all(queue[i].map(async (f) => {
      counter++
      return new Promise<void>((resolve) => {
        ffmpeg(f).outputOptions([...baseFlags, "-vf", "reverse", "-af", "areverse"])
        .save(`${savePath}/${path.basename(f)}`)
        .on("end", () => {
            resolve()
        })
      })
    }))
  }
  return fs.readdirSync(savePath, {withFileTypes: true}).filter((p) => p.isFile()).map((p) => `${savePath}/${p.name}`)
}

const concatSegments = async (segments: string[], savePath: string) => {
  const baseFlags = ["-pix_fmt", "yuv420p", "-movflags", "+faststart"]
  const sorted = segments.sort(new Intl.Collator(undefined, {numeric: true, sensitivity: "base"}).compare).reverse()
  const text = sorted.map((s) => `file '${s}'`).join("\n")
  const textPath = `${path.dirname(savePath)}/list.txt`
  fs.writeFileSync(textPath, text)
  await new Promise<void>((resolve) => {
    ffmpeg(textPath)
    .inputOptions(["-f", "concat", "-safe", "0"])
    .outputOptions([...baseFlags, "-c", "copy"])
    .save(savePath)
    .on("end", () => {
        resolve()
    })
  })
  return savePath
}

ipcMain.handle("get-reverse-src", async (event, videoFile: string) => {
  const ext = path.extname(videoFile)
  const name = path.basename(videoFile, ext)
  const vidDest = path.join(app.getAppPath(), `../assets/videos/`)
  const newDest = path.join(vidDest, `./${name}_reverse${ext}`)
  if (fs.existsSync(newDest)) return newDest
  return null
})

ipcMain.handle("reverse-video", async (event, videoFile: string) => {
    if (videoFile.startsWith("file:///")) videoFile = videoFile.replace("file:///", "")
    const ext = path.extname(videoFile)
    const name = path.basename(videoFile, ext)
    const vidDest = path.join(app.getAppPath(), `../assets/videos/`)
    const newDest = path.join(vidDest, `./${name}_reverse${ext}`)
    if (!fs.existsSync(`${vidDest}/segments/reversed`)) fs.mkdirSync(`${vidDest}/segments/reversed`, {recursive: true})
    const segments = await splitVideo(videoFile, `${vidDest}/segments/seg%d${ext}`)
    const reversedSegments = await reverseSegments(segments, `${vidDest}/segments/reversed`)
    const reverseFile = await concatSegments(reversedSegments, newDest)
    functions.removeDirectory(`${vidDest}/segments`)
    return reverseFile
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

ipcMain.handle("get-theme", () => {
  return store.get("theme", "light")
})

ipcMain.handle("save-theme", (event, theme: string) => {
  store.set("theme", theme)
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
    window = new BrowserWindow({width: 900, height: 650, minWidth: 720, minHeight: 450, frame: false, backgroundColor: "#7d47c9", center: true, webPreferences: {nodeIntegration: true, contextIsolation: false, enableRemoteModule: true, webSecurity: false}})
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
