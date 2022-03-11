import React, {useEffect, useRef, useState} from "react"
import {ipcRenderer} from "electron" 
import {app} from "@electron/remote"
import path from "path"
import Slider from "rc-slider"
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
import "../styles/videoplayer.less"

const videoExtensions = [".mp4", ".mov", ".avi", ".mkv", ".webm", ".m4v"]
const audioExtensions = [".mp3", ".wav", ".ogg"]

const VideoPlayer: React.FunctionComponent = (props) => {
    const playerRef = useRef(null) as React.RefObject<HTMLDivElement>
    const videoRef = useRef(null) as React.RefObject<HTMLVideoElement>
    const speedBar = useRef(null) as React.RefObject<HTMLInputElement>
    const speedPopup = useRef(null) as React.RefObject<HTMLDivElement>
    const speedImg = useRef(null) as React.RefObject<HTMLImageElement>
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

    const initialState = {
        forwardSrc: null as any,
        reverseSrc: null as any,
        subtitleSrc: null as any,
        reverse: false,
        speed: 1,
        preservesPitch: true,
        progress: 0,
        duration: 0,
        prevVolume: 1,
        volume: 1,
        paused: false,
        subtitles: false,
        loop: false,
        abloop: false,
        loopStart: 0,
        loopEnd: 100,
        savedLoop: [0, 100],
        dragging: false,
        dragProgress: 0,
        audio: false
    }

    const [state, setState] = useState(initialState)

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
            window.clearInterval()
        }
    }, [])

    const initState = async () => {
        let newState = {}
        const saved = await ipcRenderer.invoke("get-state")
        if (saved.speed !== undefined) {
            newState = {...newState, speed: saved.speed}
            videoRef.current!.playbackRate = saved.speed
        }
        if (saved.preservesPitch !== undefined) {
            newState = {...newState, preservesPitch: saved.preservesPitch}
            // @ts-ignore
            videoRef.current!.preservesPitch = saved.preservesPitch
        }
        if (saved.loop !== undefined) {
            newState = {...newState, loop: saved.loop}
            videoRef.current!.loop = saved.loop
        }
        setState((prev) => {
            return {...prev, ...newState}
        })
    }

    useEffect(() => {
        const timeUpdate = () => {
            let progress = 0
            let duration = 0
            if (videoRef.current) {
                progress = videoRef.current.currentTime / videoRef.current.playbackRate
                duration = videoRef.current.duration / videoRef.current.playbackRate
                if (state.abloop) {
                    const current = videoRef.current.currentTime
                    const start = state.reverse ? (videoRef.current.duration / 100) * (100 - state.loopStart) : (videoRef.current.duration / 100) * state.loopStart
                    const end = state.reverse ? (videoRef.current.duration / 100) * (100 - state.loopEnd) : (videoRef.current.duration / 100) * state.loopEnd
                    if (state.reverse) {
                        if (current > start || current < end) {
                            videoRef.current.currentTime = end
                            if (!state.dragging) {
                                setState((prev) => {
                                    return {...prev, progress: end}
                                })
                            }
                        }
                    } else {
                        if (current < start || current > end) {
                            videoRef.current.currentTime = start
                            if (!state.dragging) {
                                setState((prev) => {
                                    return {...prev, progress: start}
                                })
                            }
                        }
                    }
                }
            }
            if (!state.dragging) {
                setState((prev) => {
                    return {...prev, progress, duration}
                })
            }
        }
        if (state.subtitles) {
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
            setState((prev) => {
                return {...prev, paused: true}
            })
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
                volume(state.volume + 0.05)
            }
            if (event.key === "ArrowDown") {
                event.preventDefault()
                volume(state.volume - 0.05)
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
            volume(state.volume - delta * 0.05)
        }
        const copyLoop = () => {
            if (state.abloop && state.loopEnd) {
                setState((prev) => {
                    return {...prev, savedLoop: [state.loopStart, state.loopEnd]}
                })
            }
        }
        const pasteLoop = () => {
            if (!state.abloop) toggleAB(true)
            abloop(state.savedLoop)
            setState((prev) => {
                return {...prev, loopStart: state.savedLoop[0], loopEnd: state.savedLoop[1]}
            })
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

    const refreshState = () => {
        speed(state.speed)
        preservesPitch(state.preservesPitch)
        if (state.abloop) abloop([state.loopStart, state.loopEnd])
    }

    const saveState = () => {
        ipcRenderer.invoke("save-state", {reverse: state.reverse, speed: state.speed, preservesPitch: state.preservesPitch, loop: state.loop, abloop: state.abloop, loopStart: state.loopStart, loopEnd: state.loopEnd})
    }

    const upload = async (file?: string) => {
        if (!file) file = await ipcRenderer.invoke("select-file")
        if (!file) return
        if (!videoExtensions.includes(path.extname(file)) && !audioExtensions.includes(path.extname(file))) return
        let sizeImg = file
        if (audioExtensions.includes(path.extname(file))) {
            sizeImg = placeholder
            setState((prev) => {
                return {...prev, audio: true}
            })
        } else {
            setState((prev) => {
                return {...prev, audio: false}
            })
        }
        if (path.extname(file) === ".mov") file = await ipcRenderer.invoke("mov-to-mp4", file) as string
        videoRef.current!.src = file
        videoRef.current!.currentTime = 0
        videoRef.current!.play()
        setState((prev) => {
            return {...prev, forwardSrc: file, reverseSrc: null, reverse: false, paused: false}
        })
        refreshState()
        ipcRenderer.invoke("resize-window", sizeImg)
        ipcRenderer.invoke("extract-subtitles", file).then((subtitles) => {
            if (subtitles) {
                setState((prev) => {
                    return {...prev, subtitleSrc: subtitles}
                })
            } else {
                setState((prev) => {
                    return {...prev, subtitles: false}
                })
            }
        })
        ipcRenderer.invoke("get-reverse-src", file).then((reverseSrc) => {
            if (reverseSrc) {
                setState((prev) => {
                    return {...prev, reverseSrc}
                })
            }
        })
    }

    const play = () => {
        if (videoRef.current!.paused) {
            videoRef.current!.play()
            setState((prev) => {
                return {...prev, paused: false}
            })
        } else {
            videoRef.current!.pause()
            setState((prev) => {
                return {...prev, paused: true}
            })
        }
    }

    const reverse = async () => {
        if (!state.reverseSrc) {
            videoRef.current?.pause()
            setState((prev) => {
                return {...prev, paused: true}
            })
            ipcRenderer.invoke("reverse-dialog", true)
            await new Promise<void>((resolve) => {
                ipcRenderer.invoke("reverse-video", state.forwardSrc).then((reversed) => {
                    ipcRenderer.invoke("reverse-dialog", false)
                    let percent = videoRef.current!.currentTime / videoRef.current!.duration
                    const newTime = (1-percent) * videoRef.current!.duration
                    videoRef.current!.src = reversed
                    videoRef.current!.currentTime = newTime
                    videoRef.current!.play()
                    refreshState()
                    setState((prev) => {
                        return {...prev, reverseSrc: reversed, reverse: true, paused: false}
                    })
                    resolve()
                })
            })
            return
        }
        if (state.reverse) {
            let percent = videoRef.current!.currentTime / videoRef.current!.duration
            const newTime = (1-percent) * videoRef.current!.duration
            videoRef.current!.src = state.forwardSrc
            videoRef.current!.currentTime = newTime
            videoRef.current!.play()
            refreshState()
            setState((prev) => {
                return {...prev, reverse: false}
            })
        } else {
            let percent = videoRef.current!.currentTime / videoRef.current!.duration
            const newTime = (1-percent) * videoRef.current!.duration
            videoRef.current!.src = state.reverseSrc
            videoRef.current!.currentTime = newTime
            videoRef.current!.play()
            refreshState()
            setState((prev) => {
                return {...prev, reverse: true}
            })
        }
        setState((prev) => {
            return {...prev, paused: false}
        })
    }

    const speed = (value?: number | string) => {
        videoRef.current!.playbackRate = Number(value)
        setState((prev) => {
            return {...prev, speed: Number(value)}
        })
    }

    const preservesPitch = (value?: boolean) => {
        const preservesPitch = value !== undefined ? value : !state.preservesPitch
        // @ts-ignore
        videoRef.current!.preservesPitch = preservesPitch
        setState((prev) => {
            return {...prev, preservesPitch}
        })
    }

    const seek = (position: number) => {
        const progress = state.reverse ? (videoRef.current!.duration / 100) * (100 - position) : (videoRef.current!.duration / 100) * position
        videoRef.current!.currentTime = progress
        setState((prev) => {
            return {...prev, progress, dragging: false}
        })
    }

    const volume = (value: number) => {
        if (value < 0) value = 0
        if (value > 1) value = 1
        videoRef.current!.volume = value
        setState((prev) => {
            return {...prev, volume: value, prevVolume: value}
        })
    }

    const volumeIcon = () => {
        if (state.volume > 0.5) {
            if (volumeHover) return volumeButtonHover
            return volumeButton
        } else if (state.volume > 0) {
            if (volumeHover) return volumeLowButtonHover
            return volumeLowButton
        } else {
            if (volumeHover) return muteButtonHover
            return muteButton
        }
    }

    const mute = () => {
        if (videoRef.current!.volume > 0) {
            videoRef.current!.volume = 0
            setState((prev) => {
                return {...prev, volume: 0}
            })
        } else {
            const newVol = state.prevVolume ? state.prevVolume : 1
            videoRef.current!.volume = newVol
            setState((prev) => {
                return {...prev, volume: newVol}
            })
        }
    }

    const fullscreen = () => {
        if (document.fullscreenElement) {
            document.exitFullscreen()
        } else {
            playerRef.current?.requestFullscreen()
        }
    }

    const loop = (value?: boolean) => {
        const toggle = value !== undefined ? value : !state.loop
        videoRef.current!.loop = toggle
        setState((prev) => {
            return {...prev, loop: toggle}
        })
    }

    const reset = () => {
        const {forwardSrc, reverseSrc, subtitleSrc, subtitles, volume, prevVolume, audio} = state
        videoRef.current!.playbackRate = 1
        // @ts-ignore
        videoRef.current!.preservesPitch = true
        videoRef.current!.src = forwardSrc
        videoRef.current!.currentTime = 0
        videoRef.current!.play()
        setState(initialState)
        setState((prev) => {
            return {...prev, forwardSrc, reverseSrc, subtitleSrc, subtitles, volume, prevVolume, audio}
        })
    }

    const subtitles = () => {
        setState((prev) => {
            return {...prev, subtitles: !prev.subtitles}
        })
    }

    const abloop = (value: number[]) => {
        const loopStart = value[0]
        const loopEnd = value[1]
        const current = videoRef.current!.currentTime
        const start = state.reverse ? (videoRef.current!.duration / 100) * (100 - loopStart) : (videoRef.current!.duration / 100) * loopStart
        const end = state.reverse ? (videoRef.current!.duration / 100) * (100 - loopEnd) : (videoRef.current!.duration / 100) * loopEnd
        if (state.reverse) {
            if (current > start || current < end) {
                videoRef.current!.currentTime = end
                setState((prev) => {
                    return {...prev, progress: end}
                })
            }
        } else {
            if (current < start || current > end) {
                videoRef.current!.currentTime = start
                setState((prev) => {
                    return {...prev, progress: start}
                })
            }
        }
        setState((prev) => {
            return {...prev, loopStart, loopEnd, dragging: false}
        })
    }

    const toggleAB = (value?: boolean) => {
        const abloop = value !== undefined ? value : !state.abloop
        setState((prev) => {
            return {...prev, abloop}
        })
    }

    const rewind = (value?: number) => {
        if (!value) value = 10
        let newTime = state.reverse ? videoRef.current!.currentTime + value : videoRef.current!.currentTime - value
        if (newTime < 0) newTime = 0
        if (newTime > videoRef.current!.duration) newTime = videoRef.current!.duration
        videoRef.current!.currentTime = newTime
        setState((prev) => {
            return {...prev, progress: newTime}
        })
    }

    const fastforward = (value?: number) => {
        if (!value) value = 10
        let newTime = state.reverse ? videoRef.current!.currentTime - value : videoRef.current!.currentTime + value
        if (newTime < 0) newTime = 0
        if (newTime > videoRef.current!.duration) newTime = videoRef.current!.duration
        videoRef.current!.currentTime = newTime
        setState((prev) => {
            return {...prev, progress: newTime}
        })
    }

    const next = async () => {
        const nextFile = await ipcRenderer.invoke("next", state.forwardSrc)
        if (nextFile) upload(nextFile)
    }

    const previous = async () => {
        const previousFile = await ipcRenderer.invoke("previous", state.forwardSrc)
        if (previousFile) upload(previousFile)
    }
    
    const getName = () => {
        return state.forwardSrc ? path.basename(state.forwardSrc.replace("file:///"), path.extname(state.forwardSrc.replace("file:///"))) : ""
    }

    const download = async () => {
        let defaultPath = state.forwardSrc
        if (defaultPath.startsWith("http")) {
            let name = path.basename(defaultPath)
            defaultPath = `${app.getPath("downloads")}/${name}`
        }
        let savePath = await ipcRenderer.invoke("save-dialog", defaultPath)
        if (!savePath) return
        if (!path.extname(savePath)) savePath += path.extname(defaultPath)
        videoRef.current?.pause()
        setState((prev) => {
            return {...prev, paused: true}
        })
        ipcRenderer.invoke("export-dialog", true)
        await ipcRenderer.invoke("export-video", state.forwardSrc, savePath, {reverse: state.reverse, speed: state.speed, preservesPitch: state.preservesPitch, abloop: state.abloop, loopStart: state.loopStart, loopEnd: state.loopEnd, duration: videoRef.current!.duration})
        ipcRenderer.invoke("export-dialog", false)
        videoRef.current!.load()
        videoRef.current!.play()
        setState((prev) => {
            return {...prev, paused: false}
        })
    }

    const updateProgressText = (value: number) => {
        let percent = value / 100
        if (state.reverse === true) {
            const progress = (1-percent) * state.duration
            setState((prev) => {
                return {...prev, progress, dragProgress: state.duration - progress}
            })
        } else {
            const progress = percent * state.duration
            setState((prev) => {
                return {...prev, progress, dragProgress: progress}
            })
        }
    }

    const updateProgressTextAB = (value: number[]) => {
        if (state.loopStart === value[0]) {
            let percent = value[1] / 100
            const progress = state.reverse ? state.duration - (1-percent) * state.duration : percent * state.duration
            setState((prev) => {
                return {...prev, loopStart: value[0], loopEnd: value[1], dragProgress: progress}
            })
        } else {
            let percent = value[0] / 100
            const progress = state.reverse ? state.duration - (1-percent) * state.duration : percent * state.duration
            setState((prev) => {
                return {...prev, loopStart: value[0], loopEnd: value[1], dragProgress: progress}
            })
        }
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
                {state.audio ? <img className="audio-placeholder" src={placeholder}/> : null}
                <video className="video" ref={videoRef} style={state.audio ? {display: "none"} : {display: "flex"}}>
                    <track kind="subtitles" src={state.subtitleSrc}></track>
                </video>
                <div className={state.paused && hover ? "control-title-container visible" : "control-title-container"}>
                    <p className="control-title">{getName()}</p>
                </div>
                <div className={hover ? "video-controls visible" : "video-controls"} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
                    <div className="control-row">
                        <p className="control-text">{state.dragging ? functions.formatSeconds(state.dragProgress) : functions.formatSeconds(state.reverse ? state.duration - state.progress : state.progress)}</p>
                        <div className="progress-container" onMouseUp={() => setState((prev) => {return {...prev, dragging: false}})}>
                            <Slider className="progress-slider" onBeforeChange={() => setState((prev) => {return {...prev, dragging: true}})} onChange={(value) => updateProgressText(value)} onAfterChange={(value) => seek(value)} min={0} max={100} step={0.1} value={state.reverse ? ((1 - state.progress / state.duration) * 100) : (state.progress / state.duration * 100)}/>
                            <Slider.Range className="ab-slider" min={0} max={100} step={0.1} value={[state.loopStart, state.loopEnd]} onBeforeChange={() => setState((prev) => {return {...prev, dragging: true}})} onChange={(value) => updateProgressTextAB(value)} onAfterChange={(value) => abloop(value)} style={({display: `${state.abloop ? "flex" : "none"}`})}/>
                        </div>
                        <p className="control-text">{functions.formatSeconds(state.duration)}</p>
                    </div>
                    <div className="control-row">
                        <img className="control-button" src={reverseHover ? reverseButtonHover : (state.reverse ? reverseActiveButton : reverseButton)} onClick={() => reverse()} onMouseEnter={() => setReverseHover(true)} onMouseLeave={() => setReverseHover(false)}/>
                        <div className="speed-popup-container" ref={speedPopup} style={({display: "none"})}>
                                <div className="speed-popup">
                                    <input type="range" ref={speedBar} onChange={(event) => speed(event.target.value)} min="0.5" max="4" step="0.5" value={state.speed} className="speed-bar"/>
                                    <div className="speed-checkbox-container">
                                    <p className="speed-text">Pitch?</p><input type="checkbox" checked={!state.preservesPitch} onChange={() => preservesPitch()} className="speed-checkbox"/>
                                    </div>
                                </div>
                            </div>
                        <img className="control-button" src={speedHover ? speedButtonHover : (state.speed !== 1 ? speedActiveButton : speedButton)} ref={speedImg} onClick={() => speedPopup.current!.style.display === "flex" ? speedPopup.current!.style.display = "none" : speedPopup.current!.style.display = "flex"} onMouseEnter={() => setSpeedHover(true)} onMouseLeave={() => setSpeedHover(false)}/>
                        <img className="control-button" src={loopHover ? loopButtonHover : (state.loop ? loopActiveButton : loopButton)} onClick={() => loop()} onMouseEnter={() => setLoopHover(true)} onMouseLeave={() => setLoopHover(false)}/>
                        <img className="control-button" src={abloopHover ? abloopButtonHover : (state.abloop ? abloopActiveButton : abloopButton)} onClick={() => toggleAB()} onMouseEnter={() => setABLoopHover(true)} onMouseLeave={() => setABLoopHover(false)}/>
                        <img className="control-button" src={resetHover ? resetButtonHover : resetButton} onClick={() => reset()} onMouseEnter={() => setResetHover(true)} onMouseLeave={() => setResetHover(false)}/>
                        <img className="control-button rewind-button" src={rewindHover ? rewindButtonHover : rewindButton} onClick={() => rewind()} onMouseEnter={() => setRewindHover(true)} onMouseLeave={() => setRewindHover(false)}/>
                        <img className="control-button play-button" src={playHover ? (state.paused ? playButtonHover : pauseButtonHover) : (state.paused ? playButton : pauseButton)} onClick={() => play()} onMouseEnter={() => setPlayHover(true)} onMouseLeave={() => setPlayHover(false)}/>
                        <img className="control-button rewind-button" src={fastForwardHover ? fastForwardButtonHover : fastForwardButton} onClick={() => fastforward()} onMouseEnter={() => setFastforwardHover(true)} onMouseLeave={() => setFastforwardHover(false)}/>
                        <img className="control-button" src={subtitleHover ? subtitleButtonHover : (state.subtitles ? subtitleButtonActive : subtitleButton)} onClick={() => subtitles()} onMouseEnter={() => setSubtitleHover(true)} onMouseLeave={() => setSubtitleHover(false)}/>
                        <img className="control-button" src={fullscreenHover ? fullscreenButtonHover : fullscreenButton} onClick={() => fullscreen()} onMouseEnter={() => setFullscreenHover(true)} onMouseLeave={() => setFullscreenHover(false)}/>
                        <img className="control-button" src={volumeIcon()} onClick={() => mute()} onMouseEnter={() => setVolumeHover(true)} onMouseLeave={() => setVolumeHover(false)}/>
                        <Slider className="volume-slider" onChange={(value) => volume(value)} min={0} max={1} step={0.01} value={state.volume}/>
                    </div>
                </div>
            </div>
        </main>
    )
}

export default VideoPlayer