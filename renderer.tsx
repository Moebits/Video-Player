import "bootstrap/dist/css/bootstrap.min.css"
import React from "react"
import ReactDom from "react-dom"
import TitleBar from "./components/TitleBar"
import VersionDialog from "./components/VersionDialog"
import VideoPlayer from "./components/VideoPlayer"
import "./index.less"

const App = () => {
  return (
    <main className="app">
      <TitleBar/>
      <VersionDialog/>
      <VideoPlayer/>
    </main>
  )
}

ReactDom.render(<App/>, document.getElementById("root"))
