import { ComponentType, FC, useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { RootState } from "../store/store"
// import { Subtract } from "utility-types"

// An attempt at an injector component
// types are tricky for these
// contians templates for injctor component
// https://medium.com/@jrwebdev/react-higher-order-component-patterns-in-typescript-42278f7590fb
// contains a simpler explination for how to type injector type components
// https://stackoverflow.com/questions/43680786/writing-a-react-higher-order-component-with-typescript

// I'm gonna keep this around as an example of a higher order component
// props were kinda tricky, so .. I'm keeping it in here even though it's not even used haha
type AlternateMoves = { move: string; lineId: string }[]
export interface WithAlternateMovesProps {
  alternateMoves: AlternateMoves
}

const withAlternateMoves =
  <P extends WithAlternateMovesProps>(
    Component: React.ComponentType<P>
  ): FC<Omit<P, "alternateMoves">> =>
  ({ ...props }) => {
    const [alternateMoves, setAlternateMoves] = useState<AlternateMoves>([])
    const [currentLineLength, setCurrentLineLength] = useState(0)

    const playerColor = useSelector(
      ({ appStore }: RootState) => appStore.playAs
    )

    const possibleRemainingOpeningLines = useSelector(
      ({ appStore }: RootState) => appStore.possibleRemainingOpeningLines
    )

    const currentLineString = useSelector(
      ({ appStore }: RootState) =>
        appStore.selectedAlternateLineMoveString ||
        appStore.selectedOpeningLine?.lineString
    )

    const currentLineId = useSelector(
      ({ appStore }: RootState) =>
        appStore.currentAlternateLineId || appStore.selectedOpeningLine?.id
    )

    const moveNum = useSelector(({ appStore }: RootState) => appStore.moveNum)

    const turn = useSelector(({ appStore }: RootState) => appStore.turn)

    let dispatch = useDispatch()

    useEffect(() => {
      if (!currentLineString) {
        return
      }

      let numberOfMoves = currentLineString.split("|").length
      setCurrentLineLength(numberOfMoves)
    }, [currentLineString])

    useEffect(() => {
      if (!currentLineString) {
        return
      }

      // what is the next move??
      // If we're white, we want to look for black's alternate moves
      // If we're black, we want to look for white's alternate moves
      //

      // console.log("TURN IS")
      // console.log({
      //   moveNum,
      //   turn,
      //   currentLineLength
      // })

      if (
        (playerColor === "white" && turn === "b") ||
        (playerColor === "black" && turn === "w") ||
        moveNum == 2
      ) {
        let startIndex = 0
        let endIndex = 0

        if (turn === "b") {
          startIndex = moveNum * 10 + 5
          endIndex = startIndex + 4
        } else if (turn === "w") {
          // first let's just log the right characters
          // characters 0-3 of the current chunk
          startIndex = moveNum * 10
          endIndex = startIndex + 4
        }

        let nextMove = currentLineString.substring(startIndex, endIndex)
        // find the possibleRemaininglines where the next move doesn't match

        let remainingLineIds = Object.keys(possibleRemainingOpeningLines)

        // make a object nextmove [id's]
        // now, it's possilbe that because of the split, the alternate next move will be an empty string
        let nextMoveObj: Record<string, string[]> = {}
        remainingLineIds.forEach((remainingLineId) => {
          if (
            possibleRemainingOpeningLines[remainingLineId].substring(
              startIndex,
              endIndex
            ) !== nextMove
          ) {
            let alternateNextMove = possibleRemainingOpeningLines[
              remainingLineId
            ].substring(startIndex, endIndex)

            if (alternateNextMove !== "") {
              if (!nextMoveObj[alternateNextMove]) {
                nextMoveObj[alternateNextMove] = []
              }

              nextMoveObj[alternateNextMove].push(remainingLineId)
            }
          }
        })

        // if there are keys in the next move Object
        let possibleNextMoves = Object.keys(nextMoveObj)

        if (possibleNextMoves.length) {
          // pause the auto move ..

          // find the longest line in each of the nextMoveObject. form an object
          // move: lineId
          let moveAndIdObj: Record<string, string> = {}
          possibleNextMoves.forEach((move) => {
            let linesIds = nextMoveObj[move]
            let longestLine = ""
            linesIds.forEach((lineId) => {
              if (!longestLine) {
                longestLine = lineId
              } else if (
                possibleRemainingOpeningLines[lineId].length >
                possibleRemainingOpeningLines[longestLine].length
              ) {
                longestLine = lineId
              }
            })

            moveAndIdObj[move] = longestLine
          })

          // then finally form an array [{move: move, lineid: lineid}, ]
          let alternateMoveArray: AlternateMoves = []

          // first of all It would be good to also include the current line's move
          // we could either be on origional selected line or the selected alternate line moves
          // luckily we already have the current move
          if (currentLineId) {
            alternateMoveArray.push({ lineId: currentLineId, move: nextMove })
          }

          let moveAndIdObjKeys = Object.keys(moveAndIdObj)
          moveAndIdObjKeys.forEach((key) => {
            alternateMoveArray.push({ move: key, lineId: moveAndIdObj[key] })
          })

          console.log("ALTERNATE MOVE ARRAY IS ... ")
          console.log(alternateMoveArray)

          setAlternateMoves(alternateMoveArray)
        } else {
          setAlternateMoves([])
        }
        //}
      }
      // day 1: get the next possible moves
      // day 2: pause and resume on display click
      // day 3: switch to that line and move
    }, [
      possibleRemainingOpeningLines,
      currentLineString,
      moveNum,
      turn,
      playerColor
    ])

    return <Component alternateMoves={alternateMoves} {...(props as any)} />
  }

export default withAlternateMoves
