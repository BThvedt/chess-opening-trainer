import { useState, useEffect, FC } from "react"
import { useSelector } from "react-redux"
import { RootState } from "../store/store"

interface IProps {}

// redo the eval bar. 0-1 takes up 20%, 1-2 and 2-3 take up 15%, 3-4 and 4-5 each take up 10%,
// 5 - 6 and 6 - 7 take up 7.5 % eatch, and 7 - 8 5 %.All else except for mate stay at 90 %.
// Then this is divided by two.

// between 0 and 45%, weighted as bigger numbers take up progressively smaller percents, topping out
// at around 8. I think chess.com tops out at 5 but I go a bit higher. I tried an asymptopic function at first,
// which sorta worked, but I think this is better and a bit closer to chess.com's bar, but with slightly
// bigger range like I want
const getYValue = (x: number) => {
  // 0-1 takes up 20%, 1-2 and 2-3 take up 15%, 3-4 and 4-5 each take up 10%, (we're at 70%)
  // 5 - 6 and 6 - 7 take up 7.5 % eatch, and 7 - 8 adds 5% then that's the top. All else except for mate stay at 90 %.
  // Then this is divided by two and returned
  let percentage = 0

  if (x > 8) {
    return 45
  }

  // round x down, create an array (remainder is last entry) and weight each part then add them gether
  let arrayLength = Math.floor(x)
  let theArray = new Array(arrayLength).fill(1)
  // push the remaindr on the end
  theArray.push(x % 1)

  // x is either 1 or a remainder .. in whichever case, mulply the entry by a weighting facter then return
  // the array to be summed up
  let weightedArray = theArray.map((x, i) => {
    if (i === 0) {
      return x * 0.2
    } else if (i === 1 || i === 2) {
      return x * 0.15
    } else if (i === 3 || i === 4) {
      return x * 0.1
    } else if (i === 4 || i === 5) {
      return x * 0.075
    } else if (i === 6 || i === 7) {
      return x * 0.05
    }
  })

  let yValue = weightedArray.reduce((acc, curr) => {
    return acc! + curr! // nothing should be undefined
  }, 0)

  // yValue is between 0 and 0.9, but we want between 0 and 0.45 so divide by two
  return yValue! / 2
}

const getEvalBarHeight = (
  whiteEval: string | null,
  whiteForcedMate: boolean,
  blackForcedMate: boolean
) => {
  if (whiteForcedMate) {
    return "100%"
  } else if (blackForcedMate) {
    return "0%"
  }

  if (!whiteEval) {
    return "50%"
  }

  let whiteEvalNum = parseFloat(whiteEval)
  let x = Math.abs(whiteEvalNum)

  let y = getYValue(x)

  // ok this should be somewhere between 0 and 0.5 with a horizontal asymtope approaching 0.5
  // if white is ahead add it to 0.5
  // if black is ahead subtract it from 0.5
  // to get a number between 0 and 1. Multiply that by 100, and that's the bar height in percent
  let finalEval = 0.5
  if (whiteEvalNum > 0) {
    finalEval = finalEval + y
  } else {
    finalEval = finalEval - y
  }
  // else it's exactly 0.5 anyway
  finalEval = +(finalEval * 100).toFixed(2) // trick turn "toFixed" into a number (toFixed returns a string)

  return `${finalEval}%`
}

const getTheEvalString = (theEval: string, color: string) => {
  if (!Number.isNaN(parseFloat(theEval))) {
    let returnCandidate =
      color === "white" ? parseFloat(theEval) : -1 * parseFloat(theEval)

    if (returnCandidate >= 0) {
      return returnCandidate.toFixed(1)
    } else {
      return ""
    }
  }

  if (theEval.indexOf("M") !== -1) {
    // either M3 or -M4 for example
    if (color === "white" && theEval.indexOf("-") === -1) {
      if (theEval.indexOf("0") !== -1) {
        return "1-0"
      }
      return theEval
    } else if (color === "black" && theEval.indexOf("-") !== -1) {
      if (theEval.indexOf("0") !== -1) {
        return "0-1"
      }
      return theEval.slice(1)
    }
  }

  return ""
}

const EvalBar: FC<IProps> = () => {
  let [whiteEval, setWhiteEval] = useState<string | null>(null)
  let [whiteForcedMate, setWhiteForcedMate] = useState<boolean>(false)
  let [blackForcedMate, setBlackForcedMate] = useState<boolean>(false)

  const selectedOpeningLine = useSelector(
    ({ appStore }: RootState) => appStore.selectedOpeningLine
  )

  const selectedAlternateLineEval = useSelector(
    ({ appStore }: RootState) => appStore.selectedAlternateLineEval
  )

  const playerColor = useSelector(({ appStore }: RootState) => appStore.playAs)

  const moveNum = useSelector(({ appStore }: RootState) => appStore.moveNum)

  useEffect(() => {
    // to avoid the bar jumping around too much, I'll only change it once per move, although,
    // I'll use the evalutation at the player's color
    // only edge case is the last move might be white only
    // so if that case, always set it to white otherwise set it to whatever player color

    if (
      (selectedOpeningLine?.eval && selectedOpeningLine?.eval.length) ||
      (selectedAlternateLineEval && selectedAlternateLineEval.length)
    ) {
      let evalArray: string[][] = [] //= selectedAlternateLineEval || selectedOpeningLine?.eval
      let subIndex = 0 // 0 is white, 1 is black

      if (selectedAlternateLineEval?.length) {
        evalArray = selectedAlternateLineEval
      } else if (selectedOpeningLine?.eval) {
        evalArray = selectedOpeningLine.eval
      }

      if (!evalArray?.length) {
        return
      }

      if (
        evalArray &&
        evalArray[moveNum] &&
        evalArray[moveNum][0].indexOf("M") !== -1
      ) {
        // if there's a mate eval, it'll look like wM3 or bM4 or something and the subArray will only be 1 in length
        let evalString = evalArray[moveNum][0]

        if (evalString.charAt(0) === "-") {
          setBlackForcedMate(true)
        } else {
          // must be a black forced mate in this case
          setWhiteForcedMate(true)
        }
      }

      if (evalArray && !evalArray[moveNum]) {
        // sometimes I mess up on input ... other times (and this is my fault) when
        // the last move is done by the opposite color, it goes onto the "next" movenum
        // but the eval array ends at the current one

        console.log(`Hmm.. there is no evaluation for move ${moveNum} ...`)
      } else {
        if (!evalArray) {
          return
        }
        if (moveNum === evalArray.length - 1) {
          if (evalArray[moveNum].length === 1) {
            subIndex = 0
          } else {
            subIndex = playerColor === "white" ? 0 : 1
          }
        } else {
          subIndex = playerColor === "white" ? 0 : 1
        }
      }

      if (evalArray && evalArray[moveNum] && evalArray[moveNum][subIndex]) {
        if (evalArray[moveNum][subIndex].indexOf("M") !== -1) {
          if (evalArray[moveNum][subIndex].charAt(0) !== "-") {
            setWhiteForcedMate(true)
            setBlackForcedMate(false)
          } else {
            setWhiteForcedMate(false)
            setBlackForcedMate(true)
          }

          setWhiteEval(evalArray[moveNum][subIndex])
        } else {
          setWhiteForcedMate(false)
          setBlackForcedMate(false)
          setWhiteEval(evalArray[moveNum][subIndex])
        }
      }
    } else {
      setWhiteForcedMate(false)
      setBlackForcedMate(false)
      setWhiteEval(null)
    }
  }, [selectedOpeningLine, moveNum, playerColor])

  return (
    <div className="eval-bar w-5 bg-gray-800 absolute left-0  rounded-md overflow-hidden">
      <div
        id="white-eval-bar"
        className="absolute bottom-0 w-full bg-stone-200"
        style={{
          height: getEvalBarHeight(whiteEval, whiteForcedMate, blackForcedMate)
        }}
      ></div>
      <div
        id="black-eval-num"
        className="w-full h-4 flex items-center justify-center text-gray-100 absolute top-0 left-0 pt-1"
      >
        {whiteEval && (
          <p className="eval-num">{getTheEvalString(whiteEval, "black")}</p>
        )}
      </div>
      <div
        id="white-eval-num"
        className="w-full h-4 flex items-center justify-center text-slate-700 absolute bottom-0 left-0 pb-1"
      >
        {whiteEval && (
          <p className="eval-num">{getTheEvalString(whiteEval, "white")}</p>
        )}
      </div>
    </div>
  )
}

export default EvalBar
