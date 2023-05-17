import { FC, useEffect, useRef, useState } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { useDispatch, useSelector } from "react-redux"
import {
  faVolumeOff,
  faVolumeLow,
  faVolumeHigh,
  faVolumeMute
} from "@fortawesome/free-solid-svg-icons"
import type { RootState } from "../../store/store"
import { Sounds } from "../../types"
import { playSound } from "../../store/reducer"

// const sounds = {
//   null: null,
//   start: new Audio("/audio/start.mp3"),
//   success: new Audio("/audio/success.mp3"),
//   error: new Audio("/audio/error.webm"),
//   move: new Audio("/audio/move.webm"),
//   capture: new Audio("/audio/capture.webm"),
//   castle: new Audio("/audio/castle.webm"),
//   check: new Audio("/audio/check.mp3"),
//   checkmate: new Audio("/audio/checkmate.mp3")
// }

const soundFiles = {
  null: null,
  start: "/audio/start.mp3",
  success: "/audio/success.mp3",
  error: "/audio/error.webm",
  move: "/audio/move.webm",
  capture: "/audio/capture.webm",
  castle: "/audio/castle.webm",
  check: "/audio/check.mp3",
  checkmate: "/audio/checkmate.mp3"
}

const SoundInput: FC = () => {
  let [muted, setMuted] = useState(false)
  let [width, setWidth] = useState(100)
  let [vol, setVol] = useState(100)

  // useState is funny
  let [checkingLocalStorage, setCheckingLocalStorage] = useState(true)
  let dispatch = useDispatch()

  const currentSound = useSelector(
    ({ appStore }: RootState) => appStore.soundPlaying
  )

  useEffect(() => {
    let savedVol = localStorage.getItem("vol")
    let savedMuteSetting = localStorage.getItem("muted")

    if (savedVol) {
      setVol(parseInt(savedVol))
    }

    if (savedMuteSetting === "true") {
      setMuted(true)
    } else {
      setMuted(false)
    }

    // I dont have to do this when using the reducer
    setCheckingLocalStorage(false)
  }, [])

  // useEffect(() => {
  //   Object.keys(sounds).forEach((key) => {
  //     if (sounds[key as Sounds]) {
  //       sounds[key as Sounds]?.load()

  //       sounds[key as Sounds]?.addEventListener(
  //         "ended",
  //         () => {
  //           sounds[key as Sounds]?.pause()
  //           dispatch(playSound("null"))
  //         },
  //         false
  //       )
  //     }
  //   })
  // })

  useEffect(() => {
    if (!currentSound) {
      return
    }

    //let sound = sounds[currentSound as Sounds]

    // I can't make heads or tles out of this typescript error
    // currentSound will never be null here
    // @ts-ignore
    let sound = new Audio(soundFiles[currentSound as Sounds])

    if (!sound) {
      return
    }

    if (muted) {
      sound.volume = 0
    } else {
      // regular volume doesn't get quiet fast enough for my taste
      // so divide it by a number that gets bigger the smaller the volume goes
      let percentage = vol / 100 // between 0 and 1
      let fudgeFactor = 1 + (1 - percentage) * 3 // between 1 and 4

      let finalVol = parseFloat((percentage / fudgeFactor).toFixed(2))
      sound.volume = finalVol
    }

    sound.play()
  }, [currentSound])

  useEffect(() => {
    // needs an extra logic step, otherwise it runs this before anything
    // and volume and muted always get set to their useState values
    // don't need to do this when I manage things with the reducer but meh
    if (!checkingLocalStorage) {
      if (muted) {
        setWidth(0)
        localStorage.setItem("muted", "true")
      } else {
        localStorage.setItem("muted", "false")
        setWidth(vol)
      }

      localStorage.setItem("vol", vol.toString())
      // console.log("Setting volume and muted to")
      // console.log({ vol, muted })
    }
  }, [vol, muted, checkingLocalStorage])

  let volRef = useRef<HTMLDivElement>(null)

  // see App.scss .. this is kind a "trick"
  // Can't get the triangle to look right with nested elements
  // so I use a :before style to control the volume triangle
  const beforeStyle = {
    "--width": `${width}%`
  }

  return (
    <div className="sound-volume-container flex items-center justify-between">
      <div
        className="text-white text-2xl cursor-pointer"
        onClick={() => {
          setMuted(!muted)
        }}
      >
        {vol === 0 || muted ? (
          <FontAwesomeIcon className="relative" icon={faVolumeMute} />
        ) : vol < 35 ? (
          <FontAwesomeIcon className="relative" icon={faVolumeOff} />
        ) : vol < 65 ? (
          <FontAwesomeIcon className="relative" icon={faVolumeLow} />
        ) : (
          <FontAwesomeIcon className="relative" icon={faVolumeHigh} />
        )}
      </div>
      <div
        ref={volRef}
        className="sound-volume-control-outer"
        onClick={(e) => {
          let rect = volRef?.current?.getBoundingClientRect()
          let width = volRef?.current?.offsetWidth

          if (!rect || !width) {
            return
          }

          var x = e.clientX - rect.left //x position within the element.

          // let's add about 5 to this percent because it looks too small
          // sure any volumes between 0 and 5 percent will be impossible but I'm willing to sacrifice that for visual purposes
          let leftPercent = Math.round((x / width) * 100 + 5)
          leftPercent = leftPercent >= 100 ? (leftPercent = 100) : leftPercent
          // It's frankly difficult to click this low
          leftPercent = leftPercent < 15 ? (leftPercent = 0) : leftPercent
          setVol(leftPercent)
          setMuted(false)
        }}
      >
        <div
          className="sound-volume-control"
          // @ts-ignore
          style={beforeStyle}
        />
      </div>
    </div>
  )
}

export default SoundInput
