import "bootstrap/dist/css/bootstrap.min.css"
import React, { useState } from "react"
import ReactDom from "react-dom"
import TitleBar from "./components/TitleBar"
import VersionDialog from "./components/VersionDialog"
import VideoPlayer from "./components/VideoPlayer"
import ReverseDialog from "./components/ReverseDialog"
import ExportDialog from "./components/ExportDialog"
import LinkDialog from "./components/LinkDialog"
import FXDialog from "./components/FXDialog"
import ContextMenu from "./components/ContextMenu"
import "./index.less"

export const HoverContext = React.createContext<any>(null)
export const BrightnessContext = React.createContext<any>(null)
export const ContrastContext = React.createContext<any>(null)
export const HueContext = React.createContext<any>(null)
export const SaturationContext = React.createContext<any>(null)
export const LightnessContext = React.createContext<any>(null)
export const BlurContext = React.createContext<any>(null)
export const SharpenContext = React.createContext<any>(null)
export const PixelateContext = React.createContext<any>(null)

const App = () => {
  const [hover, setHover] = useState(true)
  const [brightness, setBrightness] = useState(100)
  const [contrast, setContrast] = useState(100)
  const [hue, setHue] = useState(180)
  const [saturation, setSaturation] = useState(100)
  const [lightness, setLightness] = useState(100)
  const [blur, setBlur] = useState(0)
  const [sharpen, setSharpen] = useState(0)
  const [pixelate, setPixelate] = useState(1)

  return (
    <main className="app" onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
      <PixelateContext.Provider value={{pixelate, setPixelate}}>
      <BrightnessContext.Provider value={{brightness, setBrightness}}>
      <ContrastContext.Provider value={{contrast, setContrast}}>
      <HueContext.Provider value={{hue, setHue}}>
      <SaturationContext.Provider value={{saturation, setSaturation}}>
      <LightnessContext.Provider value={{lightness, setLightness}}>
      <BlurContext.Provider value={{blur, setBlur}}>
      <SharpenContext.Provider value={{sharpen, setSharpen}}>
      <HoverContext.Provider value={{hover, setHover}}>
        <TitleBar/>
        <ContextMenu/>
        <VersionDialog/>
        <LinkDialog/>
        <FXDialog/>
        <ReverseDialog/>
        <ExportDialog/>
        <VideoPlayer/>
      </HoverContext.Provider>
      </SharpenContext.Provider>
      </BlurContext.Provider>
      </LightnessContext.Provider>
      </SaturationContext.Provider>
      </HueContext.Provider>
      </ContrastContext.Provider>
      </BrightnessContext.Provider>
      </PixelateContext.Provider>
    </main>
  )
}

ReactDom.render(<App/>, document.getElementById("root"))
