import { FC, useEffect, useState } from "react"
import { RootState } from "../../store/store"

import { useDispatch, useSelector } from "react-redux"
import { Chess } from "chess.js"
import withAlternateMoves, {
  WithAlternateMovesProps
} from "../WithAlternateMoves"
import {
  setAlternateMove,
  setSelectedAlternateLineMoves,
  openModal,
  setShowConfetti,
  playSound
} from "../../store/reducer"

const MOVE_DELAY = 350

interface IProps extends WithAlternateMovesProps {}

const AlternateMoves: FC<IProps> = ({ alternateMoves }) => {
  const [chessGame, setChessGame] = useState<Chess>(new Chess())
  const [currentLineLength, setCurrentLineLength] = useState(0)
  const [transPosed, setHasTransposed] = useState(false)
  const [transPosedToName, setTransposedToName] = useState("")
  const [wrongPlayerColor, setWrongPlayerColor] = useState(false)
  const [readableAlternateMoves, setReadableAlternateMoves] = useState<
    {
      move: string
      lineId: string
    }[]
  >([])

  const selectedOpeningLine = useSelector(
    ({ appStore }: RootState) => appStore.selectedOpeningLine
  )

  const possibleRemainingOpeningLines = useSelector(
    ({ appStore }: RootState) => appStore.possibleRemainingOpeningLines
  )

  const moveNum = useSelector(({ appStore }: RootState) => appStore.moveNum)

  const mostRecentMoveLan = useSelector(
    ({ appStore }: RootState) => appStore.mostRecentMoveLan
  )

  const playerColor = useSelector(({ appStore }: RootState) => appStore.playAs)

  const currentLineId = useSelector(
    ({ appStore }: RootState) =>
      appStore.currentAlternateLineId || appStore.selectedOpeningLine?.id
  )

  const theOpeningIsFor = useSelector(
    ({ appStore }: RootState) => appStore.openingIsFor
  )

  const currentLineString = useSelector(
    ({ appStore }: RootState) =>
      appStore.selectedAlternateLineMoveString ||
      appStore.selectedOpeningLine?.lineString
  )

  const turn = useSelector(({ appStore }: RootState) => appStore.turn)

  const currentOpening = useSelector(
    ({ appStore }: RootState) => appStore.currentOpening
  )

  const openingList = useSelector(
    ({ appStore }: RootState) => appStore.openingList
  )

  const alternatesOn = useSelector(
    ({ appStore }: RootState) => appStore.alternateMoves === "on"
  )

  useEffect(() => {
    if (!currentLineString) {
      return
    }

    let numberOfMoves = currentLineString.split("|").length
    setCurrentLineLength(numberOfMoves)
  }, [currentLineString])

  useEffect(() => {
    if (playerColor !== theOpeningIsFor) {
      setWrongPlayerColor(true)
    } else {
      setWrongPlayerColor(false)
    }
  }, [playerColor, theOpeningIsFor])

  useEffect(() => {
    if (mostRecentMoveLan) {
      try {
        chessGame.move(mostRecentMoveLan)
      } catch (e) {
        // this runs multiple times so .. I don't care if there's an error because there will be
      }
    }

    // what if the movenum is greater than or equal to the currentLine.length?
    if (alternateMoves.length) {
      let readalbeAlternateMovesArr: { move: string; lineId: string }[] = []
      alternateMoves.forEach((alternateMove) => {
        let { move, lineId } = alternateMove

        try {
          // it could be that we're on the last move of the line
          if (!move) {
            return
          }
          chessGame.move(move)
        } catch (e) {
          // this runs multiple times so .. I don't care if there's an error because there will be
          //console.log({ turn, move, pgn: chessGame.pgn(), error: e })
        }

        let moveNumberString = `${moveNum + 1}.`

        if (chessGame.pgn().split(moveNumberString)[1]) {
          let whiteAndBlackMoves = chessGame
            .pgn()
            .split(moveNumberString)[1]
            ?.trim()
            .split(" ")

          // we want the opposite of the player color
          if (playerColor === "white" && whiteAndBlackMoves[1]) {
            readalbeAlternateMovesArr.push({
              move: whiteAndBlackMoves[1],
              lineId
            })
          } else if (playerColor === "black" && whiteAndBlackMoves[0]) {
            //console.log({ move, lineId })
            readalbeAlternateMovesArr.push({
              move: whiteAndBlackMoves[0],
              lineId
            })
          }
        }

        chessGame.undo()
      })

      if (readalbeAlternateMovesArr && moveNum === currentLineLength) {
        readalbeAlternateMovesArr.unshift({
          lineId: "success",
          move: "Success"
        })
      }

      setReadableAlternateMoves(readalbeAlternateMovesArr)

      // what if there is only one line left?
      if (
        Object.keys(possibleRemainingOpeningLines).length === 1 &&
        currentLineId !== selectedOpeningLine?.id
      ) {
        setHasTransposed(true)
        // setTransposedToName("Some name")
        // console.log("/-/-/-/-/-/-/-/-/-/-/-/-/-/-/-/-/- THE OPENING JSON IS")
        // console.log(openingList)
        // console.log(currentOpening)
        // ok find the name in opeing names
        // sigh this is kind of an involved prospect

        let possibleOpeningLines = openingList.find(
          (entry) => entry.name === currentOpening
        )?.lines

        if (possibleOpeningLines) {
          let line = possibleOpeningLines.find(
            (line) => line.id === currentLineId
          )

          if (line) {
            setTransposedToName(line.name)
          }
        } else {
          setTransposedToName(`${currentOpening} - Unknown name`)
        }

        // setTransposedToName(theNewLine?.name || "")
      } else {
        setHasTransposed(false)
        setTransposedToName("")
      }
    } else {
      if (currentLineLength && moveNum >= currentLineLength) {
        if (
          (playerColor === "white" && turn === "w") ||
          (playerColor === "black" && turn === "b")
        ) {
          // there's a weird edge case where there's multiple alternate lines, but the alternate moves
          // don't come until later in the line, but the current line is finished. In this case...
          // .. I'm getting over this. .. I could display 'success' or 'continue' .. maybe later ..
          // in this case just set success. This seems like the best place to do it ..
          console.log(
            "EXPERIMENTAL - SETTING SUCCESS - FROM WITHIN THE ALTERNATE MOVES COMPONENT"
          )

          setTimeout(() => {
            dispatch(openModal("Success!!"))
            dispatch(setShowConfetti(true))
            dispatch(playSound("success"))
          }, MOVE_DELAY)
        }
      }
      setReadableAlternateMoves([])
    }
  }, [mostRecentMoveLan, alternateMoves])

  let dispatch = useDispatch()

  return (
    <>
      {alternatesOn && (
        <div className="my-2">
          {!wrongPlayerColor && (
            <div className="text-gray-100 text-sm">
              {!transPosed && (
                <>
                  {Object.keys(possibleRemainingOpeningLines).length > 1 && (
                    <p>
                      Alternates Enabled: <br />
                      {`${
                        Object.keys(possibleRemainingOpeningLines).length
                      } lines remain`}
                    </p>
                  )}
                  {Object.keys(possibleRemainingOpeningLines).length == 1 && (
                    <p>This is the last remaining line</p>
                  )}
                </>
              )}
              {transPosed && <p>Transposed to: {transPosedToName}</p>}
              {readableAlternateMoves.length !== 0 && (
                <p>
                  Choose move for {playerColor === "white" ? "Black" : "White"}
                </p>
              )}
            </div>
          )}

          {!wrongPlayerColor && readableAlternateMoves.length !== 0 && (
            <div className="text-gray-100 mt-2">
              {readableAlternateMoves.map((entry) => {
                return (
                  <span
                    className={`px-1 mr-2 rounded-sm cursor-pointer hover:bg-teal-600 hover:text-gray-100 ${
                      entry.lineId === currentLineId ||
                      entry.lineId === "success"
                        ? "bg-sky-500 text-gray-100"
                        : "bg-gray-100 text-slate-700"
                    }`}
                    key={entry.move}
                    onClick={() => {
                      if (entry.lineId === "success") {
                        dispatch(openModal("Success!!"))
                        dispatch(setShowConfetti(true))
                        dispatch(playSound("success"))
                      } else {
                        dispatch(setSelectedAlternateLineMoves(entry.lineId))
                        dispatch(setAlternateMove(entry.move)) // pretty much all this does is trigger the chessboard to continue
                      }
                    }}
                  >
                    {entry.move}
                  </span>
                )
              })}
            </div>
          )}

          {wrongPlayerColor && (
            <div className="text-gray-100 text-sm">
              <p>
                These lines are for {theOpeningIsFor}
                <br />
                Play as {theOpeningIsFor} to enable alternate moves
              </p>
            </div>
          )}
        </div>
      )}
    </>
  )
}

export default withAlternateMoves(AlternateMoves)
