import { FC, useState, useEffect } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { useDispatch, useSelector } from "react-redux"
import { RootState } from "../../store/store"
import { forwardToggle, backwardToggle, resetToggle } from "../../store/reducer"
import {
  faForward,
  faBackward,
  faRefresh
} from "@fortawesome/free-solid-svg-icons"

interface IProps {}

const ForwardBackReset: FC<IProps> = () => {
  let dispatch = useDispatch()

  const [backEnabled, setBackEnabled] = useState(false)
  const [resetEnabled, setResetEnabled] = useState(false)
  const [forwardEnabled, setForwardEnabled] = useState(false)

  const moveNum = useSelector(({ appStore }: RootState) => appStore.moveNum)
  const selectedOpeningLine = useSelector(
    ({ appStore }: RootState) => appStore.selectedOpeningLine
  )

  const errorSquares = useSelector(
    ({ appStore }: RootState) => appStore.errorSquares
  )

  const alternatesOn = useSelector(
    ({ appStore }: RootState) => appStore.alternateMoves === "on"
  )

  useEffect(() => {
    // console.log("start here")
    // enable/diable move buttons
    // perform morves. See the chess.js library for the back() function
    // goal for tomorrow

    // then.. sounds
    // play as black/white
    // hints and orientation
    // alternate links .. next week!
    // then finally.. notes and eval
    // then done! Put online. Goal 2 weeks
    if (!selectedOpeningLine) {
      setBackEnabled(false)
      setResetEnabled(false)
      setForwardEnabled(false)

      return
    }

    if (moveNum === 0) {
      setBackEnabled(false)
      if (!errorSquares?.length) {
        setResetEnabled(false)
      } else {
        setResetEnabled(true)
      }
    } else {
      setBackEnabled(true)
      setResetEnabled(true)
    }

    if (moveNum >= selectedOpeningLine.moves.length - 1) {
      setForwardEnabled(false)
    } else {
      setForwardEnabled(true)
    }
  }, [errorSquares, moveNum, selectedOpeningLine])

  return (
    <>
      <div className="text-gray-100 flex justify-between text-2xl my-2">
        <FontAwesomeIcon
          className={`cursor-pointer ${
            !backEnabled || errorSquares?.length || alternatesOn
              ? "opacity-50 cursor-not-allowed pointer-events-none"
              : "hover:text-stone-400"
          }`}
          icon={faBackward}
          onClick={() => {
            if (backEnabled && !alternatesOn) {
              dispatch(backwardToggle())
            }
          }}
        />
        <FontAwesomeIcon
          className={`cursor-pointer ${
            !resetEnabled && !errorSquares?.length
              ? "opacity-50 cursor-not-allowed pointer-events-none"
              : "hover:text-stone-400"
          }`}
          icon={faRefresh}
          onClick={() => {
            if (resetEnabled) {
              dispatch(resetToggle())
            }
          }}
        />
        <FontAwesomeIcon
          className={`cursor-pointer ${
            !forwardEnabled || errorSquares?.length || alternatesOn
              ? "opacity-50 cursor-not-allowed pointer-events-none"
              : "hover:text-stone-400"
          }`}
          icon={faForward}
          onClick={() => {
            if (forwardEnabled && !alternatesOn) {
              dispatch(forwardToggle())
            }
          }}
        />
      </div>
      {alternatesOn && (
        <div className="flex justify-center items-center text-sm opacity-50">
          <p>Alternates on: Fwd and Back are disabled</p>
        </div>
      )}
    </>
  )
}

export default ForwardBackReset
