import { FC } from "react"
import { useState, useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import type { RootState } from "../store/store"
import { ShortPieceName } from "../types"

let pieceSortValue: Record<ShortPieceName, number> = {
  p: 1,
  n: 2,
  b: 3,
  r: 4,
  q: 5
}

let materialValue: Record<ShortPieceName, number> = {
  p: 1,
  n: 3,
  b: 3,
  r: 5,
  q: 9
}

const Material: FC = () => {
  let [sortedWhitePieces, setSortedWhitePieces] = useState<string[]>([])
  let [sortedBlackPieces, setSortedBlackPieces] = useState<string[]>([])
  let [whiteScoreAdvantage, setWhiteScoreAdvangage] = useState(0)
  let [blackScoreAdvantage, setBlackScoreAdvantage] = useState(0)

  const material = useSelector(({ appStore }: RootState) => appStore.material)

  const selectedAlternateLineMoveString = useSelector(
    ({ appStore }: RootState) => appStore.selectedAlternateLineMoveString
  )

  const selectedOpeningLine = useSelector(
    ({ appStore }: RootState) => appStore.selectedOpeningLine
  )

  useEffect(() => {
    let { white, black } = material

    setSortedWhitePieces(
      [...white].sort((a, b) => {
        return pieceSortValue[a] - pieceSortValue[b]
      })
    )

    setSortedBlackPieces(
      [...black].sort((a, b) => {
        return pieceSortValue[a] - pieceSortValue[b]
      })
    )

    // calculate score
    let whiteStolen = white.reduce((acc, curr) => {
      return materialValue[curr] + acc
    }, 0)

    let blackStolen = black.reduce((acc, curr) => {
      return materialValue[curr] + acc
    }, 0)

    setWhiteScoreAdvangage(blackStolen - whiteStolen)
    setBlackScoreAdvantage(whiteStolen - blackStolen)
  }, [material])

  return (
    <>
      {(selectedAlternateLineMoveString || selectedOpeningLine) && (
        <div className="flex h-8 mb-2 items-center justify-between w-full">
          <div className="flex  pl-7 items-center">
            {sortedWhitePieces.map((pieceChar, i) => {
              let imgFile: string
              switch (pieceChar) {
                case "p":
                  imgFile = "wP.png"
                  break
                case "n":
                  imgFile = "wN.png"
                  break
                case "b":
                  imgFile = "wB.png"
                  break
                case "r":
                  imgFile = "wR.png"
                  break
                case "q":
                  imgFile = "wQ.png"
                  break
              }

              return <img key={i} className="h-6" src={`/pieces/${imgFile!}`} />
            })}
            {/* <div className="text-sm text-gray-400">
          {sortedWhitePieces.length !== 0 && whiteScoreAdvantage > 0 && "+"}
          {sortedWhitePieces.length !== 0 && whiteScoreAdvantage}
        </div> */}
          </div>
          <div>
            {whiteScoreAdvantage > 0 && (
              <p className="text-sm text-gray-400">
                White +{whiteScoreAdvantage}
              </p>
            )}
            {blackScoreAdvantage > 0 && (
              <p className="text-sm text-gray-400">
                Black +{blackScoreAdvantage}
              </p>
            )}
            {whiteScoreAdvantage === 0 && (
              <p className="text-sm text-gray-400">Even</p>
            )}
          </div>
          <div className="flex  items-center">
            {sortedBlackPieces.map((pieceChar, i) => {
              let imgFile: string
              switch (pieceChar) {
                case "p":
                  imgFile = "bP.png"
                  break
                case "n":
                  imgFile = "bN.png"
                  break
                case "b":
                  imgFile = "bB.png"
                  break
                case "r":
                  imgFile = "bR.png"
                  break
                case "q":
                  imgFile = "bQ.png"
                  break
              }

              return (
                <img
                  key={i}
                  className="black-piece-material-filter h-6"
                  src={`/pieces/${imgFile!}`}
                />
              )
            })}
            {/* <div className="text-sm text-gray-400">
          {sortedBlackPieces.length !== 0 && blackScoreAdvantage > 0 && "+"}
          {sortedBlackPieces.length !== 0 && blackScoreAdvantage}
        </div> */}
          </div>
        </div>
      )}
    </>
  )
}

export default Material
