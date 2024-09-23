import fs from "fs"
import path from "path"
import MP4Demuxer from "./MP4Demuxer"
import {JsWebm} from "jswebm"

const videoExtensions = [".mp4", ".mov", ".avi", ".mkv", ".webm", ".m4v", ".mp3", ".wav", ".ogg"]

export default class Functions {
    public static arrayIncludes = (str: string, arr: string[]) => {
        for (let i = 0; i < arr.length; i++) {
            if (str.includes(arr[i])) return true
        }
        return false
    }

    public static arrayRemove = <T>(arr: T[], val: T) => {
        return arr.filter((item) => item !== val)
    }

    public static timeout = async (ms: number) => {
        return new Promise((resolve) => setTimeout(resolve, ms))
    }

    public static removeDirectory = (dir: string) => {
        if (!fs.existsSync(dir)) return
        fs.readdirSync(dir).forEach((file: string) => {
            const current = path.join(dir, file)
            if (fs.lstatSync(current).isDirectory()) {
                Functions.removeDirectory(current)
            } else {
                fs.unlinkSync(current)
            }
        })
        try {
            fs.rmdirSync(dir)
        } catch (e) {
            console.log(e)
        }
    }

    public static logSlider = (position: number) => {
        const minPos = 0
        const maxPos = 1
        const minValue = Math.log(0.01)
        const maxValue = Math.log(1)
        const scale = (maxValue - minValue) / (maxPos - minPos)
        const value = Math.exp(minValue + scale * (position - minPos))
        return value
    }

      public static parseSeconds = (str: string) => {
        const split = str.split(":")
        let seconds = 0
        if (split.length === 3) {
            seconds += Number(split[0]) * 3600
            seconds += Number(split[1]) * 60
            seconds += Number(split[2])
        } else if (split.length === 2) {
            seconds += Number(split[0]) * 60
            seconds += Number(split[1])
        } else if (split.length === 1) {
            seconds += Number(split[0])
        }
        return seconds
    }

    public static formatSeconds = (duration: number) => {
        let seconds = Math.floor(duration % 60) as any
        let minutes = Math.floor((duration / 60) % 60) as any
        let hours = Math.floor((duration / (60 * 60)) % 24) as any
        if (Number.isNaN(seconds) || seconds < 0) seconds = 0
        if (Number.isNaN(minutes) || minutes < 0) minutes = 0
        if (Number.isNaN(hours) || hours < 0) hours = 0

        hours = (hours === 0) ? "" : ((hours < 10) ? "0" + hours + ":" : hours + ":")
        minutes = hours && (minutes < 10) ? "0" + minutes : minutes
        seconds = (seconds < 10) ? "0" + seconds : seconds
        return `${hours}${minutes}:${seconds}`
    }

    public static decodeEntities(encodedString: string) {
        const regex = /&(nbsp|amp|quot|lt|gt);/g
        const translate = {
            nbsp:" ",
            amp : "&",
            quot: "\"",
            lt  : "<",
            gt  : ">"
        } as any
        return encodedString.replace(regex, function(match, entity) {
            return translate[entity]
        }).replace(/&#(\d+);/gi, function(match, numStr) {
            const num = parseInt(numStr, 10)
            return String.fromCharCode(num)
        })
    }

    public static cleanHTML = (str: string) => {
        return Functions.decodeEntities(str).replace(/<\/?[^>]+(>|$)/g, "")
    }

    public static round = (value: number, step?: number) => {
        if (!step) step = 1.0
        const inverse = 1.0 / step
        return Math.round(value * inverse) / inverse
    }

    public static streamToBuffer = async (stream: NodeJS.ReadableStream) => {
        const chunks: any[] = []
        const arr = await new Promise<Buffer>((resolve, reject) => {
          stream.on("data", (chunk) => chunks.push(Buffer.from(chunk)))
          stream.on("error", (err) => reject(err))
          stream.on("end", () => resolve(Buffer.concat(chunks)))
        })
        return arr.buffer
    }

    public static getFile = async (filepath: string) => {
        const blob = await fetch(filepath).then((r) => r.blob())
        const name = path.basename(filepath).replace(".mp3", "").replace(".wav", "").replace(".flac", "").replace(".ogg", "")
        // @ts-ignore
        blob.lastModifiedDate = new Date()
        // @ts-ignore
        blob.name = name
        return blob as File
    }

    public static getSortedFiles = async (dir: string) => {
        const files = await fs.promises.readdir(dir)
        return files
            .filter((f) => videoExtensions.includes(path.extname(f)))
            .map(fileName => ({
                name: fileName,
                time: fs.statSync(`${dir}/${fileName}`).mtime.getTime(),
            }))
            .sort((a, b) => b.time - a.time)
            .map(file => file.name)
    }

    public static constrainDimensions = (width: number, height: number) => {
        const maxWidth = 1450
        const maxHeight = 942
        const minWidth = 520
        const minHeight = 250
        let newWidth = width
        let newHeight = height
        if (width > maxWidth) {
            const scale = width / maxWidth
            newWidth /= scale
            newHeight /= scale
        }
        if (height > maxHeight) {
            const scale = height / maxHeight
            newHeight /= scale
            newWidth /= scale
        }
        if (minWidth > width) {
            const scale = minWidth / width
            newWidth *= scale
            newHeight *= scale
        }
        if (minHeight > height) {
            const scale = minHeight / height
            newHeight *= scale
            newWidth *= scale
        }
        return {width: Math.floor(newWidth), height: Math.floor(newHeight)}
    }

    public static videoThumbnail = (link: string) => {
        return new Promise<string>((resolve) => {
            const video = document.createElement("video")
            video.src = link 
            video.addEventListener("loadeddata", (event) => {
                video.currentTime = 0.001
            })
            video.addEventListener("seeked", () => {
                const canvas = document.createElement("canvas")
                const ctx = canvas.getContext("2d") as any
                canvas.width = video.videoWidth 
                canvas.height = video.videoHeight
                ctx?.drawImage(video, 0, 0, canvas.width, canvas.height)
                resolve(canvas.toDataURL())
            })
            video.load()
        })
    }

    public static escapeQuotes = (str: string) => {
        return str.replace(/"/g, `"\\""`).replace(/'/g, `'\\''`)
    }

    public static extractMP4Frames = async (videoFile: string) => {
        let frames = [] as any
        await new Promise<void>(async (resolve) => {
            let demuxer = new MP4Demuxer(videoFile)
            let timeout: any 
            // @ts-ignore
            let decoder = new VideoDecoder({
                output : (frame: any) => {
                    clearTimeout(timeout)
                    const bitmap = createImageBitmap(frame)
                    frames.push(bitmap)
                    frame.close()
                    timeout = setTimeout(() => {
                        resolve()
                    }, 500)
                },
                error : (e: any) => console.error(e)
            })
            const config = await demuxer.getConfig()
            decoder.configure(config)
            demuxer.start((chunk: any) => decoder.decode(chunk))
        })
        return Promise.all(frames)
    }

    public static extractWebMFrames = async (videoFile: string, vp9?: boolean) => {
        let frames = [] as any
        await new Promise<void>(async (resolve) => {
            let demuxer = new JsWebm()
            const arrayBuffer = await fetch(videoFile).then((r) => r.arrayBuffer())
            demuxer.queueData(arrayBuffer)
            let timeout: any 
            // @ts-ignore
            let decoder = new VideoDecoder({
                output : (frame: any) => {
                    clearTimeout(timeout)
                    const bitmap = createImageBitmap(frame)
                    frames.push(bitmap)
                    frame.close()
                    timeout = setTimeout(() => {
                        resolve()
                    }, 500)
                },
                error : (e: any) => console.error(e)
            })
            while (!demuxer.eof) {
                demuxer.demux()
            }
            decoder.configure({
                codec: vp9 ? "vp09.00.10.08" : "vp8",
                codedWidth: demuxer.videoTrack.width,
                codedHeight: demuxer.videoTrack.height,
                displayAspectWidth: demuxer.videoTrack.width,
                displayAspectHeight: demuxer.videoTrack.height,
                colorSpace: {
                    primaries: "bt709",
                    transfer: "bt709",
                    matrix: "rgb"
                },
                hardwareAcceleration: "no-preference",
                optimizeForLatency: true
            })
            let foundKeyframe = false
            for (let i = 0; i < demuxer.videoPackets.length; i++) {
                const packet = demuxer.videoPackets[i]
                if (packet.isKeyframe) foundKeyframe = true 
                if (!foundKeyframe) continue
                // @ts-ignore
                const chunk = new EncodedVideoChunk({type: packet.isKeyframe ? "key" : "delta", data: packet.data, timestamp: packet.timestamp * demuxer.segmentInfo.timecodeScale / 1000})
                decoder.decode(chunk)
            }
        })
        return Promise.all(frames)
    }

    public static videoSpeed = (data: any[], speed: number) => {
        if (speed === 1) return data 
        const constraint = speed > 1 ? data.length / speed : data.length
        let step = Math.ceil(data.length / constraint)
        let newData = [] as any 
        for (let i = 0; i < data.length; i += step) {
            const frame = data[i]
            newData.push(frame)
            if (speed < 1) {
                const amount = (1 / speed) - 1 
                for (let i = 0; i < amount; i++) {
                    newData.push(frame)
                }
            }
        }
        return newData
    }
}
