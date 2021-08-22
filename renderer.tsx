import "bootstrap/dist/css/bootstrap.min.css"
import React, {useEffect} from "react"
import ReactDom from "react-dom"
import TitleBar from "./components/TitleBar"
import VersionDialog from "./components/VersionDialog"
import VideoPlayer from "./components/VideoPlayer"
import ReverseDialog from "./components/ReverseDialog"
import "./index.less"
import {ipcRenderer} from "electron"

const App = () => {
  return (
    <main className="app">
      <TitleBar/>
      <VersionDialog/>
      <ReverseDialog/>
      <VideoPlayer/>
    </main>
  )
}

ReactDom.render(<App/>, document.getElementById("root"))
