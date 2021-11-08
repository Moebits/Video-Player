import "bootstrap/dist/css/bootstrap.min.css"
import React from "react"
import ReactDom from "react-dom"
import TitleBar from "./components/TitleBar"
import VersionDialog from "./components/VersionDialog"
import VideoPlayer from "./components/VideoPlayer"
import ReverseDialog from "./components/ReverseDialog"
import ExportDialog from "./components/ExportDialog"
import LinkDialog from "./components/LinkDialog"
import "./index.less"

const App = () => {
  return (
    <main className="app">
      <TitleBar/>
      <VersionDialog/>
      <LinkDialog/>
      <ReverseDialog/>
      <ExportDialog/>
      <VideoPlayer/>
    </main>
  )
}

ReactDom.render(<App/>, document.getElementById("root"))
