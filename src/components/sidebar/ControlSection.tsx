import { FC } from "react"
import { useDispatch, useSelector } from "react-redux"
import type { RootState } from "../../store/store"
import {
  setPlayAs,
  setOrientation,
  setAlternateMoves,
  setHints,
  setShowLegalSquares,
  setShowNotes,
  setGamePaused,
  resetToggle
} from "../../store/reducer"
import Select from "../Select"
import ForwardBackReset from "./ForwardBackReset"
import CheckInput from "../CheckInput"
import SoundInput from "./SoundInput"

const ControlSection: FC = () => {
  const dispatch = useDispatch()
  const playAs = useSelector((state: RootState) => state.appStore.playAs)
  const boardOrientation = useSelector(
    (state: RootState) => state.appStore.orientation
  )
  const alternateMoves = useSelector(
    (state: RootState) => state.appStore.alternateMoves
  )
  const hints = useSelector((state: RootState) => state.appStore.hints)

  const showLegalSquares = useSelector(
    ({ appStore }: RootState) => appStore.showLegalSquares
  )

  const paused = useSelector(({ appStore }: RootState) => appStore.gamePaused)

  const showNotes = useSelector(({ appStore }: RootState) => appStore.showNotes)

  // console.log("show legal squares is")
  // console.log(showLegalSquares)
  // console.log(typeof showLegalSquares)

  return (
    <div>
      <div
        id="select-controls"
        className="w-full flex justify-between flex-wrap"
      >
        <Select
          className={`box-border w-2/5 inline-block mb-2 ${
            paused ? "opacity-75 select-none pointer-events-none" : ""
          }`}
          label="Play As"
          value={playAs}
          onChange={(value) => {
            dispatch(setPlayAs(value))
          }}
          options={[
            { name: "White", value: "white" },
            { name: "Black", value: "black" }
          ]}
        />

        <Select
          className="box-border w-2/5 inline-block mb-2"
          label="Orientation"
          value={boardOrientation}
          onChange={(value) => {
            dispatch(setOrientation(value))
          }}
          options={[
            { name: "White", value: "white" },
            { name: "Black", value: "black" }
          ]}
        />

        <Select
          className="box-border w-2/5 inline-block mb-2"
          label="Alternate Lines"
          value={alternateMoves}
          onChange={(value) => {
            dispatch(setAlternateMoves(value))
            dispatch(resetToggle())
          }}
          options={[
            { name: "Off", value: "off" },
            { name: "On", value: "on" }
          ]}
        />

        <Select
          className="box-border w-2/5 inline-block mb-2"
          label="Hints"
          value={hints}
          onChange={(value) => {
            dispatch(setHints(value))
          }}
          options={[
            { name: "All", value: "all" },
            { name: "Moves", value: "moves" },
            { name: "Spaces", value: "spaces" },
            { name: "Off", value: "off" }
          ]}
        />
      </div>

      <div className="flex items-center justify-between my-2">
        <CheckInput
          value={showLegalSquares}
          label={"Moves"}
          cb={(newVal) => {
            dispatch(setShowLegalSquares(newVal))
          }}
        />
        <CheckInput
          value={showNotes}
          label={"Notes"}
          cb={(newVal) => {
            dispatch(setShowNotes(newVal))
          }}
        />
        <SoundInput />
      </div>

      {paused && (
        <div
          className="p-1 flex my-2 shadow bg-gray-100 text-slate-700 rounded-sm cursor-pointer items-center justify-center hover:text-gray-100 hover:bg-stone-400"
          onClick={() => {
            dispatch(setGamePaused(false))
          }}
        >
          <p className="rounded-sm font-bold">Unpause</p>
        </div>
      )}

      <div className="my-4">
        <ForwardBackReset />
      </div>
    </div>
  )
}

export default ControlSection
