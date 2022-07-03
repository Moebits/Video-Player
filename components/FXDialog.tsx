import {ipcRenderer, clipboard} from "electron"
import React, {useEffect, useState, useContext} from "react"
import {BrightnessContext, ContrastContext, HueContext, SaturationContext, LightnessContext, PixelateContext, BlurContext, SharpenContext} from "../renderer"
import brightnessIcon from "../assets/icons/brightness.png"
import contrastIcon from "../assets/icons/contrast.png"
import hueIcon from "../assets/icons/hue.png"
import saturationIcon from "../assets/icons/saturation.png"
import lightnessIcon from "../assets/icons/lightness.png"
import blurIcon from "../assets/icons/blur.png"
import sharpenIcon from "../assets/icons/sharpen.png"
import pixelateIcon from "../assets/icons/pixelate.png"
import "../styles/fxdialog.less"
import Slider from "react-slider"

const FXDialog: React.FunctionComponent = (props) => {
    const [visible, setVisible] = useState(false)
    const [hover, setHover] = useState(false)
    const {brightness, setBrightness} = useContext(BrightnessContext)
    const {contrast, setContrast} = useContext(ContrastContext)
    const {hue, setHue} = useContext(HueContext)
    const {saturation, setSaturation} = useContext(SaturationContext)
    const {lightness, setLightness} = useContext(LightnessContext)
    const {pixelate, setPixelate} = useContext(PixelateContext)
    const {blur, setBlur} = useContext(BlurContext)
    const {sharpen, setSharpen} = useContext(SharpenContext)

    useEffect(() => {
        const showFXDialog = (event: any) => {
            setVisible((prev) => !prev)
        }
        const closeAllDialogs = (event: any, ignore: any) => {
            if (ignore !== "fx") setVisible(false)
        }
        ipcRenderer.on("show-fx-dialog", showFXDialog)
        ipcRenderer.on("close-all-dialogs", closeAllDialogs)
        return () => {
            ipcRenderer.removeListener("show-fx-dialog", showFXDialog)
            ipcRenderer.removeListener("close-all-dialogs", closeAllDialogs)
        }
    }, [])

    useEffect(() => {
        const escapePressed = () => {
            if (visible) setVisible(false)
        }
        ipcRenderer.on("escape-pressed", escapePressed)
        return () => {
            ipcRenderer.removeListener("escape-pressed", escapePressed)
        }
    })

    const close = () => {
        setTimeout(() => {
            if (!hover && visible) setVisible(false)
        }, 100)
    }

    const updateFX = async () => {
        
        // setVisible(false)
    }

    const resetFilters = () => {
        setBrightness(100)
        setContrast(100)
        setHue(180)
        setSaturation(100)
        setLightness(100)
        setBlur(0)
        setSharpen(0)
        setPixelate(1)
    }
        return (
            <section className="fx-dialog" onMouseDown={close}>
                <div className={`fx-dropdown ${!visible ? `hide-fx-dropdown` : ""}`} onMouseOver={() => setHover(true)} onMouseLeave={() => setHover(false)}
                style={{marginRight: "140px", top: "30px"}}>
                    <div className="fx-dropdown-row">
                        <img className="fx-dropdown-img" src={brightnessIcon}/>
                        <span className="fx-dropdown-text">Brightness</span>
                        <Slider className="fx-slider" trackClassName="fx-slider-track" thumbClassName="fx-slider-thumb" onChange={(value) => setBrightness(value)} min={60} max={140} step={1} value={brightness}/>
                    </div>
                    <div className="fx-dropdown-row">
                        <img className="fx-dropdown-img" src={contrastIcon}/>
                        <span className="fx-dropdown-text">Contrast</span>
                        <Slider className="fx-slider" trackClassName="fx-slider-track" thumbClassName="fx-slider-thumb" onChange={(value) => setContrast(value)} min={60} max={140} step={1} value={contrast}/>
                    </div>
                    <div className="fx-dropdown-row">
                        <img className="fx-dropdown-img" src={hueIcon}/>
                        <span className="fx-dropdown-text">Hue</span>
                        <Slider className="fx-slider" trackClassName="fx-slider-track" thumbClassName="fx-slider-thumb" onChange={(value) => setHue(value)} min={150} max={210} step={1} value={hue}/>
                    </div>
                    <div className="fx-dropdown-row">
                        <img className="fx-dropdown-img" src={saturationIcon}/>
                        <span className="fx-dropdown-text">Saturation</span>
                        <Slider className="fx-slider" trackClassName="fx-slider-track" thumbClassName="fx-slider-thumb" onChange={(value) => setSaturation(value)} min={60} max={140} step={1} value={saturation}/>
                    </div>
                    <div className="fx-dropdown-row">
                        <img className="fx-dropdown-img" src={lightnessIcon}/>
                        <span className="fx-dropdown-text">Lightness</span>
                        <Slider className="fx-slider" trackClassName="fx-slider-track" thumbClassName="fx-slider-thumb" onChange={(value) => setLightness(value)} min={60} max={140} step={1} value={lightness}/>
                    </div>
                    <div className="fx-dropdown-row">
                        <img className="fx-dropdown-img" src={blurIcon}/>
                        <span className="fx-dropdown-text">Blur</span>
                        <Slider className="fx-slider" trackClassName="fx-slider-track" thumbClassName="fx-slider-thumb" onChange={(value) => setBlur(value)} min={0} max={4} step={0.1} value={blur}/>
                    </div>
                    <div className="fx-dropdown-row">
                        <img className="fx-dropdown-img" src={sharpenIcon}/>
                        <span className="fx-dropdown-text">Sharpen</span>
                        <Slider className="fx-slider" trackClassName="fx-slider-track" thumbClassName="fx-slider-thumb" onChange={(value) => setSharpen(value)} min={0} max={7} step={0.1} value={sharpen}/>
                    </div>
                    <div className="fx-dropdown-row">
                        <img className="fx-dropdown-img" src={pixelateIcon}/>
                        <span className="fx-dropdown-text">Pixelate</span>
                        <Slider className="fx-slider" trackClassName="fx-slider-track" thumbClassName="fx-slider-thumb" onChange={(value) => setPixelate(value)} min={1} max={12} step={0.1} value={pixelate}/>
                    </div>
                    <div className="fx-dropdown-row">
                        <button className="fx-button" onClick={() => resetFilters()}>Reset</button>
                    </div>
                </div>
            </section>
        )
}

export default FXDialog