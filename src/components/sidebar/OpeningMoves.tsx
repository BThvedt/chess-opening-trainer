import { FC } from "react"
import { useState, useEffect } from "react"
import { useSelector } from "react-redux"
import { Chess } from "chess.js"
import type { RootState } from "../../store/store"
import CheckInput from "../CheckInput"
import AlternateMoves from "./AlternateMoves"

interface IProps {}

const OpeningMoves: FC<IProps> = () => {
  const moveNum = useSelector(({ appStore }: RootState) => appStore.moveNum)
  const [highlight, setHighlight] = useState(true)

  // const turn = useSelector(({ appStore }: RootState) => appStore.turn)

  const selectedOpeningLine = useSelector(
    ({ appStore }: RootState) => appStore.selectedOpeningLine
  )

  const playerColor = useSelector(({ appStore }: RootState) => appStore.playAs)

  const selectedAlternateLineMoveString = useSelector(
    ({ appStore }: RootState) => appStore.selectedAlternateLineMoveString
  )

  const selectedAlternateLineMoves = useSelector(({ appStore }: RootState) => {
    let moveString = appStore.selectedAlternateLineMoveString
    let moveArray = (moveString as string).split("|")
    let moves: string[][] = []
    if (moveArray.length > 1) {
      moves = moveArray.map((item: string) => {
        return item.split(":")
      })
    }

    return moves
  })

  // for getting readable moves
  const [readableMoves, setReadableMoves] = useState<string[][]>([])

  // for setting initial value
  useEffect(() => {
    const highlightMove = localStorage.getItem("highlightMove")

    highlightMove === "true"
      ? setHighlight(true)
      : highlightMove === "false"
      ? setHighlight(false)
      : setHighlight(true)
  }, [])

  // useEffect(() => {
  //   console.log(`setting highlight mvoe to ${highlight}`)
  //   localStorage.setItem("highlightMove", highlight ? "true" : "false")
  // }, [highlight])

  useEffect(() => {
    // let moveArray = selectedOpeningLine?.moves

    let moveArray = selectedAlternateLineMoves.length
      ? selectedAlternateLineMoves
      : selectedOpeningLine?.moves

    const dummyChess = new Chess()

    moveArray?.forEach((moveArr) => {
      moveArr.forEach((move) => {
        dummyChess.move(move)
      })
    })

    // get the pgn() (readable move list), split by 1., 2., 3., etc.
    // trim and get a proper liet of moves
    // console.log(dummyChess.pgn())

    // breaks the moves up into just the move strings.. the first is always blank so just slice it off
    let readableMoveArray = dummyChess
      .pgn()
      .split(/[0-9][0-9]?\./)
      .slice(1)

    let readableMoveList = readableMoveArray.map((moveString: string) =>
      moveString.trim()
    )
    let finalReadableMoveList = readableMoveList.map((moveString: string) =>
      moveString.split(" ")
    )

    setReadableMoves(finalReadableMoveList)
  }, [selectedOpeningLine, selectedAlternateLineMoveString])

  return (
    <div>
      <AlternateMoves />
      <CheckInput
        classes="my-2"
        value={highlight}
        label={"Highlight Move"}
        cb={(newVal) => {
          setHighlight(newVal)
          localStorage.setItem("highlightMove", newVal ? "true" : "false")
        }}
      />

      <ol className="list-decimal pl-6">
        {readableMoves.map((twoMoveArray, theMoveNum) => {
          // twoMoveArray is like .. ['e2e4','e7e4']
          return (
            <li key={theMoveNum}>
              {twoMoveArray.map((move, i) => {
                return (
                  <span
                    key={i}
                    className={`${
                      highlight &&
                      moveNum === theMoveNum &&
                      ((i === 0 && playerColor === "white") ||
                        (i === 1 && playerColor === "black"))
                        ? "bg-gray-100 text-slate-700"
                        : ""
                    } px-1 my-1 rounded`}
                  >
                    {move}{" "}
                  </span>
                )
              })}
            </li>
          )
        })}
      </ol>
    </div>
  )
}

export default OpeningMoves
