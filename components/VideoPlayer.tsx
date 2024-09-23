import React, {useEffect, useRef, useState, useContext} from "react"
import {BrightnessContext, ContrastContext, HueContext, SaturationContext, LightnessContext,
BlurContext, SharpenContext, PixelateContext} from "../renderer"
import {ipcRenderer} from "electron" 
import {app} from "@electron/remote"
import path from "path"
import Slider from "react-slider"
import functions from "../structures/functions"
import playButton from "../assets/icons/play.png"
import playButtonHover from "../assets/icons/play-hover.png"
import pauseButton from "../assets/icons/pause.png"
import pauseButtonHover from "../assets/icons/pause-hover.png"
import nextButton from "../assets/icons/next.png"
import nextButtonHover from "../assets/icons/next-hover.png"
import previousButton from "../assets/icons/previous.png"
import previousButtonHover from "../assets/icons/previous-hover.png"
import reverseButton from "../assets/icons/reverse.png"
import reverseButtonHover from "../assets/icons/reverse-hover.png"
import reverseActiveButton from "../assets/icons/reverse-active.png"
import speedButton from "../assets/icons/speed.png"
import speedButtonHover from "../assets/icons/speed-hover.png"
import speedActiveButton from "../assets/icons/speed-active.png"
import loopButton from "../assets/icons/loop.png"
import loopButtonHover from "../assets/icons/loop-hover.png"
import loopActiveButton from "../assets/icons/loop-active.png"
import abloopButton from "../assets/icons/abloop.png"
import abloopButtonHover from "../assets/icons/abloop-hover.png"
import abloopActiveButton from "../assets/icons/abloop-active.png"
import resetButton from "../assets/icons/clear.png"
import resetButtonHover from "../assets/icons/clear-hover.png"
import subtitleButton from "../assets/icons/sub.png"
import subtitleButtonHover from "../assets/icons/sub-hover.png"
import subtitleButtonActive from "../assets/icons/sub-active.png"
import fullscreenButton from "../assets/icons/fullscreen.png"
import fullscreenButtonHover from "../assets/icons/fullscreen-hover.png"
import volumeButton from "../assets/icons/volume.png"
import volumeButtonHover from "../assets/icons/volume-hover.png"
import volumeLowButton from "../assets/icons/volume-low.png"
import volumeLowButtonHover from "../assets/icons/volume-low-hover.png"
import muteButton from "../assets/icons/mute.png"
import muteButtonHover from "../assets/icons/mute-hover.png"
import rewindButton from "../assets/icons/rewind.png"
import rewindButtonHover from "../assets/icons/rewind-hover.png"
import fastForwardButton from "../assets/icons/fastforward.png"
import fastForwardButtonHover from "../assets/icons/fastforward-hover.png"
import {useDropzone} from "react-dropzone"
import placeholder from "../assets/images/placeholder.png"
import "./styles/videoplayer.less"

const videoExtensions = [".mp4", ".mov", ".avi", ".mkv", ".webm", ".m4v"]
const audioExtensions = [".mp3", ".wav", ".ogg"]

const VideoPlayer: React.FunctionComponent = (props) => {
    const playerRef = useRef(null) as React.RefObject<HTMLDivElement>
    const videoRef = useRef(null) as React.RefObject<HTMLVideoElement>
    const speedBar = useRef(null) as React.RefObject<HTMLInputElement>
    const speedPopup = useRef(null) as React.RefObject<HTMLDivElement>
    const speedImg = useRef(null) as React.RefObject<HTMLImageElement>
    const videoFilterRef = useRef(null) as React.RefObject<HTMLDivElement>
    const videoLightnessRef = useRef(null) as React.RefObject<HTMLImageElement>
    const videoSharpnessRef = useRef(null) as React.RefObject<HTMLCanvasElement>
    const videoPixelateRef = useRef(null) as React.RefObject<HTMLCanvasElement>
    const videoCanvasRef = useRef(null) as React.RefObject<HTMLCanvasElement>
    const {brightness, setBrightness} = useContext(BrightnessContext)
    const {contrast, setContrast} = useContext(ContrastContext)
    const {hue, setHue} = useContext(HueContext)
    const {saturation, setSaturation} = useContext(SaturationContext)
    const {lightness, setLightness} = useContext(LightnessContext)
    const {pixelate, setPixelate} = useContext(PixelateContext)
    const {blur, setBlur} = useContext(BlurContext)
    const {sharpen, setSharpen} = useContext(SharpenContext)
    const [hover, setHover] = useState(false)
    const [hoverBar, setHoverBar] = useState(false)
    const [playHover, setPlayHover] = useState(false)
    const [fastForwardHover, setFastforwardHover] = useState(false)
    const [rewindHover, setRewindHover] = useState(false)
    const [reverseHover, setReverseHover] = useState(false)
    const [speedHover, setSpeedHover] = useState(false)
    const [loopHover, setLoopHover] = useState(false)
    const [abloopHover, setABLoopHover] = useState(false)
    const [resetHover, setResetHover] = useState(false)
    const [subtitleHover, setSubtitleHover] = useState(false)
    const [volumeHover, setVolumeHover] = useState(false)
    const [fullscreenHover, setFullscreenHover] = useState(false)
    const [nextHover, setNextHover] = useState(false)
    const [previousHover, setPreviousHover] = useState(false)
    const [videoData, setVideoData] = useState(null) as any
    const [backFrame, setBackFrame] = useState(null) as any
    const [videoLoaded, setVideoLoaded] = useState(false)
    const [subtitlesLoaded, setSubtitlesLoaded] = useState(false)
    const [subtitleText, setSubtitleText] = useState("")
    const [paused, setPaused] = useState(false)
    const [reverse, setReverse] = useState(false)
    const [speed, setSpeed] = useState(1)
    const [preservesPitch, setPreservesPitch] = useState(true)
    const [secondsProgress, setSecondsProgress] = useState(0)
    const [progress, setProgress] = useState(0)
    const [duration, setDuration] = useState(0)
    const [src, setSrc] = useState(null as any)
    const [subtitleSrc, setSubtitleSrc] = useState(null as any)
    const [prevVolume, setPrevVolume] = useState(1)
    const [volume, setVolume] = useState(1)
    const [loop, setLoop] = useState(false)
    const [abloop, setABLoop] = useState(false)
    const [subtitles, setSubtitles] = useState(false)
    const [loopStart, setLoopStart] = useState(0)
    const [loopEnd, setLoopEnd] = useState(100)
    const [savedLoop, setSavedLoop] = useState([0, 100])
    const [dragging, setDragging] = useState(false)
    const [dragProgress, setDragProgress] = useState(0)
    const [audio, setAudio] = useState(false)
    const [seekTo, setSeekTo] = useState(null as any)
    const abSlider = useRef(null) as any

    useEffect(() => {
        const getOpenedFile = async () => {
            const file = await ipcRenderer.invoke("get-opened-file")
            if (file) upload(file)
        }
        getOpenedFile()
        const openFile = (event: any, file: string) => {
            if (file) upload(file)
        }
        const uploadFile = () => {
            upload()
        }
        const onClick = (event: any) => {
            if (speedPopup.current?.style.display === "flex") {
                if (!(speedPopup.current?.contains(event.target) || speedImg.current?.contains(event.target))) {
                    if (event.target !== speedPopup.current) speedPopup.current!.style.display = "none"
                }
            }
        }
        const openLink = async (event: any, link: string) => {
            if (link) {
                let video = link
                if (link.includes("youtube.com") || link.includes("youtu.be")) {
                    video = await ipcRenderer.invoke("download-yt-video", link)
                }
                upload(video)
            }
        }
        abSlider.current.slider.style.display = "none"
        initState()
        ipcRenderer.on("open-file", openFile)
        ipcRenderer.on("upload-file", uploadFile)
        ipcRenderer.on("open-link", openLink)
        window.addEventListener("click", onClick)
        return () => {
            ipcRenderer.removeListener("open-file", openFile)
            ipcRenderer.removeListener("upload-file", uploadFile)
            ipcRenderer.removeListener("open-link", openLink)
            window.removeEventListener("click", onClick)
            window.clearInterval(undefined)
        }
    }, [])

    const initState = async () => {
        let newState = {}
        const saved = await ipcRenderer.invoke("get-state")
        if (saved.speed !== undefined) {
            setSpeed(saved.speed)
            videoRef.current!.playbackRate = saved.speed
        }
        if (saved.preservesPitch !== undefined) {
            setPreservesPitch(saved.preservesPitch)
            // @ts-ignore
            videoRef.current!.preservesPitch = saved.preservesPitch
        }
        if (saved.loop !== undefined) {
            setLoop(saved.loop)
            videoRef.current!.loop = saved.loop
        }
    }

    useEffect(() => {
        const timeUpdate = () => {
            let progress = 0
            let duration = 0
            if (videoRef.current) {
                let secondsProgress = videoRef.current.currentTime / speed
                duration = videoRef.current.duration / speed
                progress = (secondsProgress / duration) * 100
                if (abloop) {
                    const current = videoRef.current.currentTime
                    const start = reverse ? (videoRef.current.duration / 100) * (100 - loopStart) : (videoRef.current.duration / 100) * loopStart
                    const end = reverse ? (videoRef.current.duration / 100) * (100 - loopEnd) : (videoRef.current.duration / 100) * loopEnd
                    if (reverse) {
                        if (current > start || current < end) {
                            videoRef.current.currentTime = end
                            if (!dragging) {
                                setProgress(end)
                            }
                        }
                    } else {
                        if (current < start || current > end) {
                            videoRef.current.currentTime = start
                            if (!dragging) {
                                setProgress(start)
                            }
                        }
                    }
                }
            }
            if (!dragging) {
                //setProgress(progress)
                //setDuration(duration)
            }
        }
        if (subtitles) {
            videoRef.current!.textTracks[0].mode = "showing"
        } else {
            videoRef.current!.textTracks[0].mode = "hidden"
        }
        if (hover) {
            document.documentElement.style.setProperty("--subtitle-transform", "translateY(-80px)")
        } else {
            document.documentElement.style.setProperty("--subtitle-transform", "translateY(0)")
        }
        const onEnd = () => {
            setPaused(true)
        }
        const triggerDownload = () => {
            download()
        }
        const keyDown = (event: KeyboardEvent) => {
            if (event.shiftKey) {
                event.preventDefault()
                speedBar.current!.step = "0.01"
            }
            if (event.code === "Space") {
                event.preventDefault()
                play()
            }
            if (event.key === "ArrowLeft") {
                event.preventDefault()
                rewind(1)
            }
            if (event.key === "ArrowRight") {
                event.preventDefault()
                fastforward(1)
            }
            if (event.key === "ArrowUp") {
                event.preventDefault()
                changeVolume(volume + 0.05)
            }
            if (event.key === "ArrowDown") {
                event.preventDefault()
                changeVolume(volume - 0.05)
            }
        }
        const keyUp = (event: KeyboardEvent) => {
            if (!event.shiftKey) {
                if (Number(speedBar.current!.value) % 0.5 !== 0) speedBar.current!.value = String(functions.round(Number(speedBar.current!.value), 0.5))
                speedBar.current!.step = "0.5"
            }
        }
        const wheel = (event: WheelEvent) => {
            event.preventDefault()
            const delta = Math.sign(event.deltaY)
            changeVolume(volume - delta * 0.05)
        }
        const copyLoop = () => {
            if (abloop && loopEnd) {
                setSavedLoop([loopStart, loopEnd])
            }
        }
        const pasteLoop = () => {
            if (!abloop) toggleAB(true)
            changeABLoop(savedLoop)
            setLoopStart(savedLoop[0])
            setLoopEnd(savedLoop[1])
        }
        saveState()
        videoRef.current!.addEventListener("timeupdate", timeUpdate)
        videoRef.current!.addEventListener("ended", onEnd)
        ipcRenderer.on("trigger-download", triggerDownload)
        ipcRenderer.on("copy-loop", copyLoop)
        ipcRenderer.on("paste-loop", pasteLoop)
        window.addEventListener("keydown", keyDown)
        window.addEventListener("keyup", keyUp)
        window.addEventListener("wheel", wheel)
        return () => {
            videoRef.current!.removeEventListener("timeupdate", timeUpdate)
            videoRef.current!.removeEventListener("ended", onEnd)
            ipcRenderer.removeListener("trigger-download", triggerDownload)
            ipcRenderer.removeListener("copy-loop", copyLoop)
            ipcRenderer.removeListener("paste-loop", pasteLoop)
            window.removeEventListener("keydown", keyDown)
            window.removeEventListener("keyup", keyUp)
            window.removeEventListener("wheel", wheel)
        }
    })

    useEffect(() => {
        if (!abSlider.current) return
        if (abloop) {
            abSlider.current.slider.style.display = "flex"
        } else {
            abSlider.current.slider.style.display = "none"
        }
    }, [abloop])

    
    const parseVideo = async () => {
        if (!videoRef.current) return
        let frames = null as any
        if (path.extname(src) === ".mp4") {
            frames = await functions.extractMP4Frames(src)
        } else if (path.extname(src) === ".webm") {
            frames = await functions.extractWebMFrames(src)
        }
        let canvasFrames = [] as any 
        for (let i = 0; i < frames.length; i++) {
            const canvas = document.createElement("canvas")
            const img = frames[i]
            canvas.width = img.width
            canvas.height = img.height
            const ctx = canvas.getContext("bitmaprenderer") as any
            ctx.transferFromImageBitmap(img)
            canvasFrames.push(canvas)
        }
        setVideoData(canvasFrames)
        setBackFrame(canvasFrames[0].toDataURL())
        if (videoRef.current) {
            //backFrameRef.current.style.display = "flex"
            //backFrameRef.current.style.position = "relative"
            videoRef.current.style.position = "absolute"
            videoRef.current.style.top = "0px"
            videoRef.current.style.bottom = "0px"
            videoRef.current.style.right = "0px"
            videoRef.current.style.left = "0px"
        }
    }
    
    /*
    const reverseAudioStream = async () => {
        if (!ffmpeg.isLoaded()) await ffmpeg.load()
        const name = path.basename(props.img, path.extname(props.img))
        const ext = path.extname(props.img)
        const input = `${name}${ext}`
        const output = `${name}-reversed${ext}`
        ffmpeg.FS("writeFile", input, await fetchFile(props.img))
        await ffmpeg.run("-i", input, "-map", "0", "-c:v", "copy", "-af", "areverse", output)
        const binary = ffmpeg.FS("readFile", output)
        if (binary) {
            const blob = new Blob([new DataView(binary.buffer)], {type: mime.lookup(path.extname(props.img)) || "video/mp4"})
            const url = URL.createObjectURL(blob)
            setReverseVideo(`${url}#${ext}`)
            localStorage.setItem("reverseVideo", `${url}#${ext}`)
        }
        ffmpeg.FS("unlink", output)
        // ffmpeg.exit()
    }*/

    useEffect(() => {
        const loadBackFrame = async () => {
            if (backFrame) return 
            const thumb = await functions.videoThumbnail(src)
            setBackFrame(thumb)
        }
        if (videoLoaded) loadBackFrame()
    }, [videoLoaded])

    useEffect(() => {
        const element = videoFilterRef.current
        let newContrast = contrast
        const video = videoRef.current
        const sharpenOverlay = videoSharpnessRef.current
        const lightnessOverlay = videoLightnessRef.current
        if (!element || !video || !lightnessOverlay || !sharpenOverlay) return
        if (sharpen !== 0) {
            const sharpenOpacity = sharpen / 5
            newContrast += 25 * sharpenOpacity
            sharpenOverlay.style.backgroundImage = `url(${video.src})`
            sharpenOverlay.style.filter = `blur(4px) invert(1) contrast(75%)`
            sharpenOverlay.style.mixBlendMode = "overlay"
            sharpenOverlay.style.opacity = `${sharpenOpacity}`
        } else {
            sharpenOverlay.style.backgroundImage = "none"
            sharpenOverlay.style.filter = "none"
            sharpenOverlay.style.mixBlendMode = "normal"
            sharpenOverlay.style.opacity = "0"
        }
        if (lightness !== 100) {
            const filter = lightness < 100 ? "brightness(0)" : "brightness(0) invert(1)"
            lightnessOverlay.style.filter = filter
            lightnessOverlay.style.opacity = `${Math.abs((lightness - 100) / 100)}`
        } else {
            lightnessOverlay.style.filter = "none"
            lightnessOverlay.style.opacity = "0"
        }
        element.style.filter = `brightness(${brightness}%) contrast(${newContrast}%) hue-rotate(${hue - 180}deg) saturate(${saturation}%) blur(${blur}px)`
    }, [brightness, contrast, hue, saturation, lightness, blur, sharpen])

    const fixAspect = () => {
        const sharpenOverlay = videoSharpnessRef.current
        const lightnessOverlay = videoLightnessRef.current
        const pixelateCanvas = videoPixelateRef.current
        if (videoRef.current && sharpenOverlay && pixelateCanvas && lightnessOverlay) {
            const landscape = videoRef.current.videoWidth > videoRef.current.videoHeight
            if (landscape) {
                const aspectRatio = videoRef.current.videoWidth / videoRef.current.videoHeight
                videoSharpnessRef.current.width = videoRef.current.clientWidth
                videoSharpnessRef.current.height = Math.floor(videoRef.current.clientWidth / aspectRatio)
                videoPixelateRef.current.width = videoRef.current.clientWidth
                videoPixelateRef.current.height = Math.floor(videoRef.current.clientWidth / aspectRatio)
                lightnessOverlay.width = videoRef.current.clientWidth
                lightnessOverlay.height = Math.floor(videoRef.current.clientWidth / aspectRatio)
                const margin = Math.floor((videoRef.current!.clientHeight - (videoRef.current.clientWidth / aspectRatio)) / 4)
                pixelateCanvas.style.marginTop = `${margin}px`
                sharpenOverlay.style.marginTop = `${margin}px`
                lightnessOverlay.style.marginTop = `${margin}px`
                pixelateCanvas.style.marginLeft = "0px"
                sharpenOverlay.style.marginLeft = "0px"
                lightnessOverlay.style.marginLeft = "0px"
            } else {
                const aspectRatio = videoRef.current.videoHeight / videoRef.current.videoWidth
                videoSharpnessRef.current.height = videoRef.current.clientHeight
                videoSharpnessRef.current.width = Math.floor(videoRef.current.clientHeight / aspectRatio)
                videoPixelateRef.current.height = videoRef.current.clientHeight
                videoPixelateRef.current.width = Math.floor(videoRef.current.clientHeight / aspectRatio)
                lightnessOverlay.height = videoRef.current.clientHeight
                lightnessOverlay.width = Math.floor(videoRef.current.clientHeight / aspectRatio)
                const margin = Math.floor((videoRef.current!.clientWidth - (videoRef.current.clientHeight / aspectRatio)) / 2)
                pixelateCanvas.style.marginLeft = `${margin}px`
                sharpenOverlay.style.marginLeft = `${margin}px`
                lightnessOverlay.style.marginLeft = `${margin}px`
                pixelateCanvas.style.marginTop = "0px"
                sharpenOverlay.style.marginTop = "0px"
                lightnessOverlay.style.marginTop = "0px"
            }
        }
    }

    
    useEffect(() => {
        let id = 0
        let timeout = null as any
        const animationLoop = async () => {
            if (videoLoaded && videoRef.current) {
                if (paused) {
                    videoRef.current.pause()
                    setSeekTo(null)
                    if (!dragging && !videoData) return
                } else {
                    if (videoRef.current?.paused) videoRef.current.play()
                }
                if (preservesPitch) {
                    // @ts-ignore
                    videoRef.current.preservesPitch = true
                } else {
                    // @ts-ignore
                    videoRef.current.preservesPitch = false
                }
                videoRef.current.style.opacity = "0"
                const adjustedData = videoData ? functions.videoSpeed(videoData, speed) : null
                videoRef.current.playbackRate = speed 
                const sharpenOverlay = videoSharpnessRef.current
                let sharpenCtx = sharpenOverlay?.getContext("2d")
                const pixelateCanvas = videoPixelateRef.current
                const pixelateCtx = pixelateCanvas?.getContext("2d")
                if (pixelateCanvas) pixelateCanvas.style.opacity = "1"
                let frames = adjustedData ? adjustedData.length - 1 : 1
                let duration = videoRef.current!.duration / speed
                let interval = duration / frames
                let sp = seekTo !== null ? seekTo : secondsProgress
                if (dragging) sp = dragProgress
                let pos = Math.floor(sp / interval)
                if (!adjustedData?.[pos]) pos = 0
                let seekValue = seekTo !== null ? seekTo * speed : null 
                seekValue = dragging ? dragProgress * speed : seekValue
                if (seekValue !== null) if (Number.isNaN(seekValue) || !Number.isFinite(seekValue)) seekValue = 0
                if (seekValue) videoRef.current.currentTime = seekValue
                if (reverse && adjustedData) pos = (adjustedData.length - 1) - pos
                let frame = adjustedData ? adjustedData[pos] : videoRef.current as any
                setDuration(duration)
                fixAspect()

                const update = () => {
                    if (!videoRef.current) return
                    if (reverse) {
                        pos--
                    } else {
                        pos++
                    }
                    if (adjustedData) {
                        if (pos < 0) pos = adjustedData.length - 1
                        if (pos > adjustedData.length - 1) pos = 0
                    }
                    frame = adjustedData ? adjustedData[pos] : videoRef.current
                    let secondsProgress = videoRef.current.currentTime / speed
                    if (reverse) secondsProgress = (videoRef.current.duration / speed) - secondsProgress
                    setSecondsProgress(secondsProgress)
                    setProgress((secondsProgress / duration) * 100)
                }
    
                const draw = () => {
                    if (sharpenOverlay) {
                        if (sharpen !== 0) {
                            const sharpenOpacity = sharpen / 5
                            sharpenOverlay.style.filter = `blur(4px) invert(1) contrast(75%)`
                            sharpenOverlay.style.mixBlendMode = "overlay"
                            sharpenOverlay.style.opacity = `${sharpenOpacity}`
                            sharpenCtx?.clearRect(0, 0, sharpenOverlay.width, sharpenOverlay.height)
                            sharpenCtx?.drawImage(frame, 0, 0, sharpenOverlay.width, sharpenOverlay.height)
                        } else {
                            sharpenOverlay.style.filter = "none"
                            sharpenOverlay.style.mixBlendMode = "normal"
                            sharpenOverlay.style.opacity = "0"
                        }
                    }
                    if (pixelateCanvas) {
                        if (pixelate !== 1) {
                            const pixelWidth = pixelateCanvas.width / pixelate
                            const pixelHeight = pixelateCanvas.height / pixelate
                            pixelateCtx?.clearRect(0, 0, pixelateCanvas.width, pixelateCanvas.height)
                            pixelateCtx?.drawImage(frame, 0, 0, pixelWidth, pixelHeight)
                            const landscape = pixelateCanvas.width >= pixelateCanvas.height
                            if (landscape) {
                                pixelateCanvas.style.width = `${pixelateCanvas.width * pixelate}px`
                                pixelateCanvas.style.height = "auto"
                            } else {
                                pixelateCanvas.style.width = "auto"
                                pixelateCanvas.style.height = `${pixelateCanvas.height * pixelate}px`
                            }
                            pixelateCanvas.style.imageRendering = "pixelated"
                        } else {
                            pixelateCanvas.style.width = `${pixelateCanvas.width}px`
                            pixelateCanvas.style.height = `${pixelateCanvas.height}px`
                            pixelateCanvas.style.imageRendering = "none"
                            pixelateCtx?.clearRect(0, 0, pixelateCanvas.width, pixelateCanvas.height)
                            pixelateCtx?.drawImage(frame, 0, 0, pixelateCanvas.width, pixelateCanvas.height)
                        }
                    }
                }
    
                const videoLoop = async () => {
                    draw()
                    if (paused) {
                        if (videoRef.current?.cancelVideoFrameCallback) {
                            return videoRef.current?.cancelVideoFrameCallback(id)
                        } else {
                            return window.cancelAnimationFrame(id)
                        }
                    }
                    update()
                    await new Promise<void>((resolve) => {
                        if (videoRef.current?.requestVideoFrameCallback) {
                            id = videoRef.current.requestVideoFrameCallback(() => resolve())
                        } else {
                            id = window.requestAnimationFrame(() => resolve())
                        }
                    }).then(videoLoop)
                }
                videoLoop()
            }
        }
        animationLoop()
        return () => {
            clearTimeout(timeout)
            if (videoRef.current?.cancelVideoFrameCallback) {
                videoRef.current.cancelVideoFrameCallback(id)
            } else {
                window.cancelAnimationFrame(id)
            }
        }
    }, [videoLoaded, src, sharpen, pixelate, lightness, speed, reverse, seekTo, paused, speed, preservesPitch, dragging, dragProgress])

    const resizeOverlay = () => {
        if (!videoRef.current || !videoSharpnessRef.current || !videoPixelateRef.current || !videoLightnessRef.current) return
        if (videoRef.current.clientWidth === 0) return
        const landscape = videoRef.current.videoWidth > videoRef.current.videoHeight
        if (landscape) {
            const aspectRatio = videoRef.current.videoWidth / videoRef.current.videoHeight
            videoSharpnessRef.current.width = videoRef.current.clientWidth
            videoSharpnessRef.current.height = Math.floor(videoRef.current.clientWidth / aspectRatio)
            videoPixelateRef.current.width = videoRef.current.clientWidth
            videoPixelateRef.current.height = Math.floor(videoRef.current.clientWidth / aspectRatio)
            videoLightnessRef.current.width = videoRef.current.clientWidth
            videoLightnessRef.current.height = Math.floor(videoRef.current.clientWidth / aspectRatio)
        } else {
            const aspectRatio = videoRef.current.videoHeight / videoRef.current.videoWidth
            videoSharpnessRef.current.height = videoRef.current.clientHeight
            videoSharpnessRef.current.width = Math.floor(videoRef.current.clientHeight / aspectRatio)
            videoPixelateRef.current.height = videoRef.current.clientHeight
            videoPixelateRef.current.width = Math.floor(videoRef.current.clientHeight / aspectRatio)
            videoLightnessRef.current.height = videoRef.current.clientHeight
            videoLightnessRef.current.width = Math.floor(videoRef.current.clientHeight / aspectRatio)
        }
    }

    useEffect(() => {
        const element = videoRef.current
        new ResizeObserver(resizeOverlay).observe(element!)
    }, [])

    useEffect(() => {
        if (!subtitlesLoaded) return
        setTimeout(() => {
            const track = videoRef.current?.textTracks[0]
            if (!track || !track.cues?.length) return
            track.mode = "hidden"
            for (let i = 0; i < track.cues?.length; i++) {
                const cue = track.cues[i]
                cue.onenter = () => {
                    // @ts-ignore
                    setSubtitleText(functions.cleanHTML(cue.text))
                }
                cue.onexit = () => {
                    setSubtitleText("")
                }
            }
        }, 1000)
    }, [subtitlesLoaded])

    const refreshState = () => {
        changeSpeed(speed)
        changePreservesPitch(preservesPitch)
        if (abloop) changeABLoop([loopStart, loopEnd])
    }

    const saveState = () => {
        ipcRenderer.invoke("save-state", {reverse, speed, preservesPitch, loop, abloop, loopStart, loopEnd})
    }

    const upload = async (file?: string) => {
        if (!videoRef.current) return
        if (!file) file = await ipcRenderer.invoke("select-file")
        if (!file) return
        if (!videoExtensions.includes(path.extname(file)) && !audioExtensions.includes(path.extname(file))) return
        let sizeImg = file
        if (audioExtensions.includes(path.extname(file))) {
            sizeImg = placeholder
            setAudio(true)
        } else {
            setAudio(false)
        }
        if (path.extname(file) === ".mov") file = await ipcRenderer.invoke("mov-to-mp4", file) as string
        setVideoLoaded(false)
        setVideoData(null)
        setSubtitlesLoaded(false)
        videoRef.current.src = file
        videoRef.current.currentTime = 0
        videoRef.current.play()
        setPaused(false)
        setSrc(file)
        setReverse(false)
        refreshState()
        ipcRenderer.invoke("resize-window", sizeImg)
        ipcRenderer.invoke("extract-subtitles", file).then((subtitles) => {
            if (subtitles) {
                setSubtitleSrc(subtitles)
                setSubtitlesLoaded(true)
            } else {
                setSubtitles(false)
            }
        })
    }

    const play = () => {
        if (!videoRef.current) return
        if (videoRef.current.paused) {
            videoRef.current.play()
            setPaused(false)
        } else {
            videoRef.current.pause()
            setPaused(true)
        }
    }

    const changeReverse = async (value?: boolean) => {
        if (!videoLoaded) return
        if (!videoData) await parseVideo()
        const val = value !== undefined ? value : !reverse 
        let secondsProgress = val === true ? (duration / 100) * (100 - progress) : (duration / 100) * progress
        setReverse(val)
        setSeekTo(secondsProgress)
    }

    const changeSpeed = (value?: string | number) => {
        if (!value) return
        setSpeed(Number(value))
    }

    const changePreservesPitch = (value?: boolean) => {
        const secondsProgress = (progress / 100) * duration
        setPreservesPitch((prev) => value !== undefined ? value : !prev)
        setSeekTo(secondsProgress)
    }

    const seek = (position: number) => {
        let secondsProgress = (position / 100) * duration
        const progress = reverse ? (videoRef.current!.duration / 100) * (100 - position) : (videoRef.current!.duration / 100) * position
        videoRef.current!.currentTime = progress
        setProgress(progress)
        setSeekTo(secondsProgress)
        setDragging(false)
    }

    const changeVolume = (value: number) => {
        if (!videoRef.current) return
        if (value < 0) value = 0
        if (value > 1) value = 1
        if (Number.isNaN(value)) value = 0
        if (value > 0) {
            videoRef.current.muted = false
        } else {
            videoRef.current.muted = true
        }
        videoRef.current.volume = functions.logSlider(value)
        setVolume(value)
        setPrevVolume(value)
    }

    const volumeIcon = () => {
        if (volume > 0.5) {
            if (volumeHover) return volumeButtonHover
            return volumeButton
        } else if (volume > 0) {
            if (volumeHover) return volumeLowButtonHover
            return volumeLowButton
        } else {
            if (volumeHover) return muteButtonHover
            return muteButton
        }
    }

    const mute = () => {
        if (!videoRef.current) return
        if (videoRef.current.volume > 0) {
            videoRef.current.muted = true
            videoRef.current.volume = 0
            setVolume(0)
        } else {
            const newVol = prevVolume ? prevVolume : 1
            videoRef.current.volume = functions.logSlider(newVol)
            videoRef.current.muted = false
            setVolume(newVol)
        }
    }

    const fullscreen = () => {
        if (document.fullscreenElement) {
            document.exitFullscreen()
        } else {
            playerRef.current?.requestFullscreen()
        }
    }

    const changeLoop = (value?: boolean) => {
        const toggle = value !== undefined ? value : !loop
        videoRef.current!.loop = toggle
        setLoop(toggle)
    }

    const reset = () => {
        // const {forwardSrc, reverseSrc, subtitleSrc, subtitles, volume, prevVolume, audio} = state
        videoRef.current!.playbackRate = 1
        // @ts-ignore
        videoRef.current!.preservesPitch = true
        videoRef.current!.src = src
        videoRef.current!.currentTime = 0
        videoRef.current!.play()
    }

    const changeSubtitles = () => {
        setSubtitles((prev) => !prev)
    }

    const changeABLoop = (value: number[]) => {
        const loopStart = value[0]
        const loopEnd = value[1]
        const current = videoRef.current!.currentTime
        const start = reverse ? (videoRef.current!.duration / 100) * (100 - loopStart) : (videoRef.current!.duration / 100) * loopStart
        const end = reverse ? (videoRef.current!.duration / 100) * (100 - loopEnd) : (videoRef.current!.duration / 100) * loopEnd
        if (reverse) {
            if (current > start || current < end) {
                videoRef.current!.currentTime = end
                setProgress(end)
            }
        } else {
            if (current < start || current > end) {
                videoRef.current!.currentTime = start
                setProgress(start)
            }
        }
        setLoopStart(loopStart)
        setLoopEnd(loopEnd)
        setDragging(false)
    }

    const toggleAB = (value?: boolean) => {
        const ab = value !== undefined ? value : !abloop
        setABLoop(ab)
    }

    const rewind = (value?: number) => {
        if (!value) value = videoRef.current!.duration / 10
        let newTime = reverse ? videoRef.current!.currentTime + value : videoRef.current!.currentTime - value
        if (newTime < 0) newTime = 0
        if (newTime > videoRef.current!.duration) newTime = videoRef.current!.duration
        setSeekTo(newTime)
    }

    const fastforward = (value?: number) => {
        if (!value) value = videoRef.current!.duration / 10
        let newTime = reverse ? videoRef.current!.currentTime - value : videoRef.current!.currentTime + value
        if (newTime < 0) newTime = 0
        if (newTime > videoRef.current!.duration) newTime = videoRef.current!.duration
        setSeekTo(newTime)
    }

    const next = async () => {
        const nextFile = await ipcRenderer.invoke("next", src)
        if (nextFile) upload(nextFile)
    }

    const previous = async () => {
        const previousFile = await ipcRenderer.invoke("previous", src)
        if (previousFile) upload(previousFile)
    }
    
    const getName = () => {
        return src ? path.basename(src.replace("file:///"), path.extname(src.replace("file:///"))) : ""
    }

    const download = async () => {
        let defaultPath = src
        if (defaultPath.startsWith("http")) {
            let name = path.basename(defaultPath)
            defaultPath = `${app.getPath("downloads")}/${name}`
        }
        let savePath = await ipcRenderer.invoke("save-dialog", defaultPath)
        if (!savePath) return
        if (!path.extname(savePath)) savePath += path.extname(defaultPath)
        videoRef.current?.pause()
        setPaused(true)
        ipcRenderer.invoke("export-dialog", true)
        await ipcRenderer.invoke("export-video", src, savePath, {reverse, speed, preservesPitch, abloop, loopStart, loopEnd, duration: videoRef.current!.duration})
        ipcRenderer.invoke("export-dialog", false)
        videoRef.current!.load()
        videoRef.current!.play()
        setPaused(false)
    }

    const updateProgressText = (value: number) => {
        let percent = value / 100
        if (reverse === true) {
            const secondsProgress = (1-percent) * duration
            setDragProgress(duration - secondsProgress)
        } else {
            const secondsProgress = percent * duration
            setDragProgress(secondsProgress)
        }
    }

    const updateProgressTextAB = (value: number[]) => {
        if (loopStart === value[0]) {
            let percent = value[1] / 100
            const progress = reverse ? duration - (1-percent) * duration : percent * duration
            setLoopStart(value[0])
            setLoopEnd(value[1])
            setDragProgress(progress)
        } else {
            let percent = value[0] / 100
            const progress = reverse ? duration - (1-percent) * duration : percent * duration
            setLoopStart(value[0])
            setLoopEnd(value[1])
            setDragProgress(progress)
        }
    }

    const onLoad = (event: any) => {
        if (videoRef.current) videoRef.current.style.display = "flex"
        setVideoLoaded(true)
        setTimeout(() => {
            seek(0)
        }, 70)
    }

    const onDrop = (files: any) => {
        files = files.map((f: any) => f.path)
        if (files[0]) {
            upload(files[0])
        }
    }

    const {getRootProps} = useDropzone({onDrop})

    return (
        <main className="video-player" {...getRootProps()}>
            <div className="video-player-container" ref={playerRef}>
                <div className={hoverBar ? "left-bar visible" : "left-bar"} onMouseEnter={() => setHoverBar(true)} onMouseLeave={() => setHoverBar(false)}>
                    <img className="bar-button" src={previousHover ? previousButtonHover : previousButton} onClick={() => previous()} onMouseEnter={() => setPreviousHover(true)} onMouseLeave={() => setPreviousHover(false)}/>
                </div>
                <div className={hoverBar ? "right-bar visible" : "right-bar"} onMouseEnter={() => setHoverBar(true)} onMouseLeave={() => setHoverBar(false)}>
                    <img className="bar-button" src={nextHover ? nextButtonHover : nextButton} onClick={() => next()} onMouseEnter={() => setNextHover(true)} onMouseLeave={() => setNextHover(false)}/>
                </div>
                {audio ? <img className="audio-placeholder" src={placeholder}/> : null}
                <div className="video-filters" ref={videoFilterRef}>
                    <img className="video-lightness-overlay" ref={videoLightnessRef} src={backFrame}/>
                    <canvas draggable={false} className="video-sharpen-overlay" ref={videoSharpnessRef}></canvas>
                    <canvas draggable={false} className="video-pixelate-canvas" ref={videoPixelateRef}></canvas>
                    {/*<canvas draggable={false} className="video-canvas" ref={videoCanvasRef}></canvas>*/}
                    <video className="video" ref={videoRef} style={audio ? {display: "none"} : {display: "flex"}} onLoadedData={(event) => onLoad(event)}>
                        <track kind="subtitles" src={subtitleSrc}></track>
                    </video>
                </div>
                <div className={paused && hover ? "control-title-container visible" : "control-title-container"}>
                    <p className="control-title">{getName()}</p>
                </div>
                {subtitles ?
                <div className="video-subtitle-container" style={{bottom: hover ? "100px" : "20px"}}>
                    <p className="video-subtitles">{subtitleText}</p>
                </div> 
                : null}
                <div className={hover ? "video-controls visible" : "video-controls"} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
                    <div className="control-row">
                        <p className="control-text">{dragging ? functions.formatSeconds(dragProgress) : functions.formatSeconds(secondsProgress)}</p>
                        <div className="progress-container" onMouseUp={() => setDragging(false)}>
                            <Slider className="progress-slider" trackClassName="progress-slider-track" thumbClassName="progress-slider-thumb" onBeforeChange={() => setDragging(true)} onChange={(value) => updateProgressText(value)} onAfterChange={(value) => seek(reverse ? 100 - value : value)} min={0} max={100} step={0.1} value={progress}/>
                            <Slider ref={abSlider} className="ab-slider" trackClassName="ab-slider-track" thumbClassName="ab-slider-thumb" min={0} max={100} step={0.1} value={[loopStart, loopEnd]} onBeforeChange={() => setDragging(true)} onChange={(value) => updateProgressTextAB(value)} onAfterChange={(value) => changeABLoop(value)}/>
                        </div>
                        <p className="control-text">{functions.formatSeconds(duration)}</p>
                    </div>
                    <div className="control-row">
                        <img className="control-button" src={reverseHover ? reverseButtonHover : (reverse ? reverseActiveButton : reverseButton)} onClick={() => changeReverse()} onMouseEnter={() => setReverseHover(true)} onMouseLeave={() => setReverseHover(false)}/>
                        <div className="speed-popup-container" ref={speedPopup} style={({display: "none"})}>
                                <div className="speed-popup">
                                    <input type="range" ref={speedBar} onChange={(event) => changeSpeed(event.target.value)} min="0.5" max="4" step="0.5" value={speed} className="speed-bar"/>
                                    <div className="speed-checkbox-container">
                                    <p className="speed-text">Pitch?</p><input type="checkbox" checked={!preservesPitch} onChange={() => changePreservesPitch()} className="speed-checkbox"/>
                                    </div>
                                </div>
                            </div>
                        <img className="control-button" src={speedHover ? speedButtonHover : (speed !== 1 ? speedActiveButton : speedButton)} ref={speedImg} onClick={() => speedPopup.current!.style.display === "flex" ? speedPopup.current!.style.display = "none" : speedPopup.current!.style.display = "flex"} onMouseEnter={() => setSpeedHover(true)} onMouseLeave={() => setSpeedHover(false)}/>
                        <img className="control-button" src={loopHover ? loopButtonHover : (loop ? loopActiveButton : loopButton)} onClick={() => changeLoop()} onMouseEnter={() => setLoopHover(true)} onMouseLeave={() => setLoopHover(false)}/>
                        <img className="control-button" src={abloopHover ? abloopButtonHover : (abloop ? abloopActiveButton : abloopButton)} onClick={() => toggleAB()} onMouseEnter={() => setABLoopHover(true)} onMouseLeave={() => setABLoopHover(false)}/>
                        <img className="control-button" src={resetHover ? resetButtonHover : resetButton} onClick={() => reset()} onMouseEnter={() => setResetHover(true)} onMouseLeave={() => setResetHover(false)}/>
                        <img className="control-button rewind-button" src={rewindHover ? rewindButtonHover : rewindButton} onClick={() => rewind()} onMouseEnter={() => setRewindHover(true)} onMouseLeave={() => setRewindHover(false)}/>
                        <img className="control-button play-button" src={playHover ? (paused ? playButtonHover : pauseButtonHover) : (paused ? playButton : pauseButton)} onClick={() => play()} onMouseEnter={() => setPlayHover(true)} onMouseLeave={() => setPlayHover(false)}/>
                        <img className="control-button rewind-button" src={fastForwardHover ? fastForwardButtonHover : fastForwardButton} onClick={() => fastforward()} onMouseEnter={() => setFastforwardHover(true)} onMouseLeave={() => setFastforwardHover(false)}/>
                        <img className="control-button" src={subtitleHover ? subtitleButtonHover : (subtitles ? subtitleButtonActive : subtitleButton)} onClick={() => changeSubtitles()} onMouseEnter={() => setSubtitleHover(true)} onMouseLeave={() => setSubtitleHover(false)}/>
                        <img className="control-button" src={fullscreenHover ? fullscreenButtonHover : fullscreenButton} onClick={() => fullscreen()} onMouseEnter={() => setFullscreenHover(true)} onMouseLeave={() => setFullscreenHover(false)}/>
                        <img className="control-button" src={volumeIcon()} onClick={() => mute()} onMouseEnter={() => setVolumeHover(true)} onMouseLeave={() => setVolumeHover(false)}/>
                        <Slider className="volume-slider" trackClassName="volume-slider-track" thumbClassName="volume-slider-thumb" onChange={(value) => changeVolume(value)} min={0} max={1} step={0.01} value={volume}/>
                    </div>
                </div>
            </div>
        </main>
    )
}

export default VideoPlayer