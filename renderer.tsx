import "bootstrap/dist/css/bootstrap.min.css"
import React, { useState } from "react"
import ReactDom from "react-dom"
import TitleBar from "./components/TitleBar"
import VersionDialog from "./components/VersionDialog"
import VideoPlayer from "./components/VideoPlayer"
import ReverseDialog from "./components/ReverseDialog"
import ExportDialog from "./components/ExportDialog"
import LinkDialog from "./components/LinkDialog"
import ContextMenu from "./components/ContextMenu"
import "./index.less"

export const HoverContext = React.createContext<any>(null)

const App = () => {
  const [hover, setHover] = useState(true)
  return (
    <main className="app" onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
      <HoverContext.Provider value={{hover, setHover}}>
        <TitleBar/>
        <ContextMenu/>
        <VersionDialog/>
        <LinkDialog/>
        <ReverseDialog/>
        <ExportDialog/>
        <VideoPlayer/>
      </HoverContext.Provider>
    </main>
  )
}

ReactDom.render(<App/>, document.getElementById("root"))
