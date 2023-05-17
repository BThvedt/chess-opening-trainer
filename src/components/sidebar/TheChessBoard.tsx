import { FC, useState, useEffect } from "react"
import { Chess, Square } from "chess.js"
import { Chessboard } from "react-chessboard"
import { useDispatch, useSelector } from "react-redux"
import type { RootState } from "../../store/store"
import withAlternateMoves, {
  WithAlternateMovesProps
} from "../WithAlternateMoves"
import {
  addToGeneratedMoveString,
  setTurn,
  setMoveNum,
  setLegalSquares,
  setHintSquares,
  resetGeneratedMoveString,
  playSound,
  setErrorSquares,
  addToCapturedMaterial,
  resetMaterial,
  setGamePaused,
  removeFromCapturedMaterial,
  openModal,
  setShowConfetti,
  closeModal,
  addMoveForAlternateMoves,
  resetAlternateLineInfo,
  showSelectMoveMessage
} from "../../store/reducer"
import {
  Move,
  SquareString,
  SpecialSoundInstruction,
  Sounds
} from "../../types"
import CustomSquareRenderer from "../CustomSquare"
import CustomPieces from "../../helpers/CustomPieces"

// regex for later
const squareRegex = /[a|b|c|d|e|f|g|h][1|2|3|4|5|6|7|9]/g
const MOVE_DELAY = 350

interface IProps extends WithAlternateMovesProps {}

const TheChessBoard: FC<IProps> = ({ alternateMoves }) => {
  const dispatch = useDispatch()

  // I should have stored this in the reducer, but this is a quick project so ..
  // I can live with a little bit of sub-optimal design haha
  const [game, setGame] = useState(new Chess())
  const [error, setError] = useState(false)
  const [readableMoves, setReadableMoves] = useState<string[][]>([])
  const [dummyGameHistory, setDummyGameHistory] = useState<any | null>()
  const [goingBack, setGoingBack] = useState(false)

  const moveNum = useSelector(({ appStore }: RootState) => appStore.moveNum)

  const turn = useSelector(({ appStore }: RootState) => appStore.turn)

  const selectedOpeningLine = useSelector(
    ({ appStore }: RootState) => appStore.selectedOpeningLine
  )

  const forwardToggle = useSelector(
    ({ appStore }: RootState) => appStore.forwardToggle
  )
  const backwardToggle = useSelector(
    ({ appStore }: RootState) => appStore.backwardToggle
  )
  const resetToggle = useSelector(
    ({ appStore }: RootState) => appStore.resetToggle
  )
  const boardOrientation = useSelector(
    ({ appStore }: RootState) => appStore.orientation
  )

  const possibleRemainingOpeningLines = useSelector(
    ({ appStore }: RootState) => appStore.possibleRemainingOpeningLines
  )

  const alternatesOn = useSelector(
    ({ appStore }: RootState) => appStore.alternateMoves === "on"
  )

  // const waitingForNextMoveToBeSelected = useSelector(
  //   ({ appStore }: RootState) => appStore.waitForNextMoveToBeSelected
  // ) // the move needs to be paused in generate move mode

  const playerColor = useSelector(({ appStore }: RootState) => appStore.playAs)

  const generateMoveMode = useSelector(
    (state: RootState) => state.appStore.generateMoveMode
  )

  const selectedAlternateMove = useSelector(
    (state: RootState) => state.appStore.selectedAlternateMove
  )

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

  const [
    waitForAlternateMovesToBeChecked,
    setWaitForALternateMovesToBeChecked
  ] = useState(false)

  useEffect(() => {
    // playing sounds depends on the move made.. however, since the game is getting replaced
    // every move, it's tough to know if it's a caputre, check, etc.
    // might as well make a full copy of "readable" moves with that information. Luckily game.pgn() can supply this
    if (!selectedOpeningLine) {
      return
    }

    // if (selectedAlternateLineMoveString !== "") {
    //   console.log("ALTERNATE LINE MOVES ARE")
    //   console.log(selectedAlternateLineMoves)
    // }

    let moveArray = selectedAlternateLineMoves.length
      ? selectedAlternateLineMoves
      : selectedOpeningLine.moves
    let dummyGame = new Chess()

    moveArray?.forEach((moveArr) => {
      moveArr.forEach((move) => {
        dummyGame.move(move)
      })
    })

    // the moves of game.pgn() are numbered.. for convienence I want to lose the number, and
    // split it into an array of individual move arrays
    let readableMoveArray = dummyGame
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

    // finally, because of course, I need to use the dummyGame elsewhere, so..
    setDummyGameHistory(dummyGame.history({ verbose: true }))

    // do some things when selecting the opening line, but don't do others when switching lines
    if (!selectedAlternateLineMoveString) {
      // we've selected the opening line. Play the start sound

      dispatch(setErrorSquares(null))
      setError(false)
      dispatch(resetMaterial())

      setTimeout(() => {
        dispatch(playSound("start"))
      }, MOVE_DELAY)
    }

    setGoingBack(false)
    dispatch(showSelectMoveMessage(false)) // just in case
  }, [selectedOpeningLine, selectedAlternateLineMoveString])

  const getTheMove: (
    color: "white" | "black",
    differentMoveNum?: number
  ) => Move | null = (color, differentMoveNum) => {
    let theMoveNumber =
      differentMoveNum !== undefined ? differentMoveNum : moveNum

    // console.log("THe alternate line mvoes are")
    // console.log(selectedAlternateLineMoves)
    // console.log("The selected line moves are")
    // console.log(selectedOpeningLine?.moves)

    let moveArray = selectedAlternateLineMoves.length
      ? selectedAlternateLineMoves
      : selectedOpeningLine?.moves

    // console.log("movearray is")
    // console.log(moveArray)

    if (!moveArray || !moveArray.length) {
      return null
    }

    if (theMoveNumber > moveArray.length - 1) {
      return null
    }

    let move

    switch (color) {
      case "white":
        move = moveArray[theMoveNumber][0]
        break
      case "black":
        move = moveArray[theMoveNumber][1]
        break
    }

    if (!move) {
      return null
    }

    return {
      from: move.slice(0, 2) as SquareString,
      to: move.slice(2, 4) as SquareString
    }
  }

  // this function contains the stuff that has to happen when the user or computer makes a move
  const makeAMove: (game: Chess, move: Move) => string = (game, move) => {
    let { from, to } = move
    let onLastMove = false

    if (!generateMoveMode) {
      let index = 0
      if (turn === "b") {
        index = 1
      }

      if (!selectedOpeningLine) {
        return "error"
      }

      let moveArray = selectedAlternateLineMoves.length
        ? selectedAlternateLineMoves
        : selectedOpeningLine?.moves

      // is this the end move? It has a * if so
      let currMove = moveArray[moveNum][index]

      if (currMove.indexOf("*") !== -1) {
        currMove = currMove.replace("*", "")
        onLastMove = true
      }

      if (currMove !== `${from}${to}`) {
        // this is an error!
        setError(true)

        const correctFromSquare = moveArray[moveNum][index].slice(
          0,
          2
        ) as SquareString
        const correctToSquare = moveArray[moveNum][index].slice(
          2,
          4
        ) as SquareString
        dispatch(setErrorSquares([correctFromSquare, correctToSquare]))
        // dispatch(playSound("error"))
        dispatch(openModal("Try again!"))
        return "error"
      }

      // is this move a capture? Add to material
      // first we need the index of the dummy gam history
      // let { captured } = dummyGameHistory[moveNum]

      // to get the index in history, take the move num, multiply by two, and add 1 if black
      // there's a chance there's no dummyGameHistory yet so ..
      if (dummyGameHistory) {
        let hisotryIndex = moveNum * 2
        if (game.turn() === "b") {
          hisotryIndex += 1
        }

        let { captured } = dummyGameHistory[hisotryIndex]

        if (captured) {
          let color = (game.turn() === "w" ? "black" : "white") as
            | "white"
            | "black"
          dispatch(addToCapturedMaterial({ color, piece: captured }))
        }
      }

      // ok for the sake of the feature of getting alternates gotta send the move to the reducer
      // so that the next moves component can decide whatever the next move is

      dispatch(
        addMoveForAlternateMoves({ lan: `${from}${to}`, turn: game.turn() })
      )

      safeGameMutate((game: Chess) => {
        move = game.move(move!)

        if (turn === "b") {
          dispatch(setMoveNum(moveNum + 1))
        }

        // edge case .. there are alternate lines but the alternate moves
        // come later..
        if (!onLastMove) {
          dispatch(setTurn(game.turn()))
        } else {
          // alert("Success - should play a sound")
          // it'll play the sound of a move unless something stops it

          // there might be alternate lines with more moves. If there is, then dispatching the modal
          // is handeled from the alternate moves componentpossibleRemainingOpeningLines
          // alert("success")
          if (
            !alternatesOn ||
            Object.keys(possibleRemainingOpeningLines).length <= 1
          ) {
            dispatch(openModal("Success!!"))
            dispatch(setShowConfetti(true))
            dispatch(playSound("success"))
          } else {
            // console.log("WE ARE HERE")
            // console.log(moveNum)
            // console.log(game.turn())
            // console.log(alternateMoves)
            // console.log(playerColor)
            // if (
            //   (playerColor === "white" && game.turn() === "w") ||
            //   (playerColor === "black" && game.turn() === "b")
            // ) {
            //   // if we are here ... then .. maybe we should do success??
            //   alert("success")
            // } else {
            dispatch(setTurn(game.turn()))
            // }
          }
        }
      })
    } else {
      safeGameMutate((game: Chess) => {
        move = game.move(move!)

        dispatch(
          addToGeneratedMoveString({ lan: move.lan!, turn: game.turn() })
        )
      })
    }

    if (onLastMove) {
      if (
        !alternatesOn ||
        Object.keys(possibleRemainingOpeningLines).length <= 1
      ) {
        return "success"
      }
    }

    return "moveMade"
  }

  // generate move moved is toggled
  useEffect(() => {
    let newGame = new Chess()

    setGame(newGame)
    dispatch(setMoveNum(0))
    dispatch(setTurn("w"))
    dispatch(setHintSquares(null))
    dispatch(showSelectMoveMessage(false)) // just in case

    if (!generateMoveMode) {
      dispatch(resetGeneratedMoveString())
    }
  }, [generateMoveMode])

  // for going forward, backward, and resetting
  // should probalby be done in the store but .. meh, just a quick project
  useEffect(() => {
    if (!selectedOpeningLine) {
      return
    }

    if (error) {
      return
    }

    let moveArray = selectedOpeningLine.moves
    let nextMove = moveNum
    let newGame = new Chess()

    // if turn is black, add +1 to the subarray
    // might have to rewrite some of the logic
    // anyway.. start here. Gonna want to go a half step forward
    // and abackward.. and have the game resume when unpaused
    for (var i = 0; i <= moveNum; i++) {
      // do all the moves up until the current move
      let theMoves = moveArray[i]
      if (i != moveNum) {
        theMoves.forEach((move) => {
          newGame.move(move)
        })
      } else {
        // depending on who we're playing as..
        // basically I'm gonna assume the turn() is the same as the player's chosen color
        newGame.move(theMoves[0])
        if (game.turn() == "b") {
          newGame.move(theMoves[1])
          nextMove = moveNum + 1
        }
      }
    }

    // before doing anything else, let's see if any pieces were captured, and put into the captured array
    if (dummyGameHistory) {
      console.log(dummyGameHistory)
      let historyIndex = nextMove * 2
      if (game.turn() === "b") {
        historyIndex -= 1
      }

      let { captured } = dummyGameHistory[historyIndex]
      if (captured) {
        let color = (game.turn() === "w" ? "black" : "white") as
          | "white"
          | "black"
        console.log({ color, piece: captured })
        dispatch(addToCapturedMaterial({ color, piece: captured }))
      }
    }

    dispatch(setMoveNum(nextMove))

    setGame(newGame)
    setGoingBack(false)
    dispatch(setTurn(newGame.turn()))
    dispatch(showSelectMoveMessage(false)) // just in case
  }, [forwardToggle])

  useEffect(() => {
    if (!selectedOpeningLine) {
      return
    }

    if (error) {
      return
    }

    // logic for this is kinda weird at first, but hey it works
    let moveForhintSquares: Move | null

    setGoingBack(true) // don't want to auto move if going back

    let dummyGame = new Chess()
    let newDummyGame = new Chess() // the reason for this will become clear later

    let moveArray = selectedOpeningLine.moves

    let currMove = moveNum

    for (var i = 0; i < currMove; i++) {
      let theMoves = moveArray[i]
      theMoves.forEach((move) => {
        dummyGame.move(move)
        newDummyGame.move(move)
      })
    }

    newDummyGame.undo()
    if (game.turn() === "w") {
      dummyGame.undo()
      newDummyGame.undo()
    }

    setGame(dummyGame)

    setTimeout(() => {
      setGame(newDummyGame)
      dispatch(setTurn(newDummyGame.turn()))
      dispatch(setMoveNum(currMove - 1))

      // setTimeout runs on the next update so this should be right

      if (newDummyGame.turn() === "w") {
        moveForhintSquares = getTheMove("white", currMove - 1) as Move
      } else {
        moveForhintSquares = getTheMove("black", currMove - 1) as Move
      }

      if (moveForhintSquares) {
        dispatch(
          setHintSquares([moveForhintSquares.from, moveForhintSquares.to])
        )
      }

      // reminder - once a line is selected, a mock "history" of the entire line is shown called "dummyGameHistory"
      // we have to fix the material so .. look if the move back had any captures in it
      if (dummyGameHistory) {
        console.log(dummyGameHistory)
        // console.log(currMove)
        let hisotryIndex1 = currMove * 2 - 1
        let hisotryIndex2 = (currMove - 1) * 2
        if (game.turn() === "b") {
          hisotryIndex1 += 1
          hisotryIndex2 += 1
        }

        let { captured: captured1 } = dummyGameHistory[hisotryIndex1]
        let { captured: captured2 } = dummyGameHistory[hisotryIndex2]

        if (captured1) {
          let color = (game.turn() === "w" ? "white" : "black") as
            | "white"
            | "black"
          dispatch(removeFromCapturedMaterial({ color, piece: captured1 }))
        }

        if (captured2) {
          let color = (game.turn() === "w" ? "black" : "white") as
            | "white"
            | "black"
          dispatch(removeFromCapturedMaterial({ color, piece: captured2 }))
        }
      }
    }, MOVE_DELAY)

    dispatch(showSelectMoveMessage(false)) // just in case
  }, [backwardToggle])

  // resetting the line
  useEffect(() => {
    // if (!selectedOpeningLine) {
    //   return
    // }

    let newGame = new Chess()

    setGame(newGame)
    dispatch(setMoveNum(0))
    dispatch(setTurn("w"))
    setTimeout(() => {
      dispatch(playSound("start"))
    }, MOVE_DELAY)

    dispatch(setErrorSquares(null))
    dispatch(setGamePaused(false))
    dispatch(resetMaterial())
    setError(false)
    setGoingBack(false)
    dispatch(setShowConfetti(false))
    dispatch(closeModal())
    dispatch(resetAlternateLineInfo())
    dispatch(showSelectMoveMessage(false))
  }, [resetToggle])

  useEffect(() => {
    // first of all, reset everything if we're on a lnie
    if (!selectedOpeningLine) {
      return
    }

    let newGame = new Chess()
    setGame(newGame)
    dispatch(setMoveNum(0))
    dispatch(setTurn(newGame.turn()))
    dispatch(resetMaterial())
    dispatch(setErrorSquares(null))
    dispatch(resetAlternateLineInfo())
  }, [playerColor])

  // useEffect(() => {
  //   alert("reset hint squares")
  // }, [boardOrientation])

  useEffect(() => {
    if (alternateMoves.length && alternatesOn) {
      // console.log(
      //   "this should show there's alternate moves before the black piece moves"
      // )
      if (waitForAlternateMovesToBeChecked) {
        dispatch(showSelectMoveMessage(true))
      }
    } else {
      setWaitForALternateMovesToBeChecked(false)
      dispatch(showSelectMoveMessage(false))
    }
  }, [alternateMoves, alternatesOn])

  useEffect(() => {
    // ok we have waited for alternate moves to be checked
    // time ot setWaitforAlternate moves to be false. This should trigger the next move
    // I admit this is really convoluted and not immediately easy to understand..
    // note to self, get better at code! Or forseeing complications at least
    setWaitForALternateMovesToBeChecked(false)
    dispatch(showSelectMoveMessage(false)) // just in case
  }, [selectedAlternateMove])

  // this is the part where the other side's automatic moves are made.
  // There are important times when the auto move isn't made like when the back arrow is toggeled,
  // or when it's generate move mode, or when there's possible alternate moves
  useEffect(() => {
    // if playing as white, move the black piece then increment the move number
    // if playing as black, the white piece should have moved, so don't increment
    // the move number unless the black piece moved

    // start out assuming we're playing as white. So we've just moved here
    // also don't autmoatically move if going back
    // when unpaused, the next move happens ...

    if (!generateMoveMode && !goingBack) {
      if (game && selectedOpeningLine) {
        let move: Move | null

        if (playerColor === "white") {
          if (game.turn() === "b") {
            move = getTheMove("black")

            if (!move) {
              return
            }

            if (!waitForAlternateMovesToBeChecked) {
              setTimeout(() => {
                makeAMove(game, move!)
                playSoundIfNecessary("noMove")
              }, MOVE_DELAY)
            }
          } else if (game.turn() === "w") {
            // if user has hints turned on ...
            const move = getTheMove("white") as Move
            if (move) {
              dispatch(setHintSquares([move.from, move.to]))
            }
          }
        } else if (playerColor === "black") {
          if (game.turn() === "w") {
            move = getTheMove("white")

            if (!move) {
              return
            }

            if (!waitForAlternateMovesToBeChecked) {
              setTimeout(() => {
                makeAMove(game, move!)
                playSoundIfNecessary("noMove")
              }, MOVE_DELAY)
            }
          } else if (game.turn() === "b") {
            const move = getTheMove("black") as Move
            if (move) {
              dispatch(setHintSquares([move.from, move.to]))
            }
          }
        }
      }
    }
  }, [
    game,
    waitForAlternateMovesToBeChecked,
    selectedOpeningLine,
    generateMoveMode
  ])

  function safeGameMutate(modify: (g: Chess) => void) {
    // @ts-ignore
    setGame((game: Chess) => {
      const update = new Chess(game.fen())
      try {
        modify(update)
      } catch (e) {
        console.log("ERROR- ILLEGAL MOVE")
      }
      return update
    })
  }

  function playSoundIfNecessary(specialInstructions?: SpecialSoundInstruction) {
    if (!readableMoves.length) {
      return
    }

    // this can change depending on when this is called haha
    // sloppy code I know. But I'm nearly done ....
    let moveIndex = 0
    if (game.turn() === "b") {
      moveIndex = 1
    }

    let lastMove = readableMoves[moveNum][moveIndex]

    // first of all, error overrides all

    // what kind of move was it? A capture? A check? A castle? or a Move?
    let moveType: Sounds = "move"
    if (lastMove.indexOf("!!") !== -1) {
      moveType = "checkmate"
    } else if (lastMove.indexOf("!") !== -1) {
      moveType = "check"
    } else if (lastMove.indexOf("O-O") !== -1) {
      moveType = "castle" // should work for both types of castling
    } else if (lastMove.indexOf("x") !== -1) {
      moveType = "capture"
    }

    if (moveType === "move" && specialInstructions !== "noMove") {
      dispatch(playSound("move"))
    } else if (moveType !== "move") {
      dispatch(playSound(moveType))
    }

    // ok play the sound depending on the last move
  }

  function onDrop(source: Square, target: Square) {
    if (goingBack) {
      setGoingBack(false)
    }

    // setWaitAndSeeIfTheresAlternates(true)

    if (!error) {
      let result = makeAMove(game, {
        to: target,
        from: source
      })

      setWaitForALternateMovesToBeChecked(true)
      // dispatch(showSelectMoveMessage(true))

      if (result === "moveMade") {
        playSoundIfNecessary()
      } else if (result === "success") {
        dispatch(playSound("success"))
      } else if (result === "error") {
        console.log("Error here")
        dispatch(playSound("error"))
      }
    } else {
      // if there was an error and we're still trying to drang and drop stuff..
      // although now the modal should stop even that. Still, I'm leaving this in for now.. (and probably ever haha)
      dispatch(playSound("error"))
    }

    return true
  }

  return (
    <>
      <Chessboard
        position={game.fen()}
        onPieceDrop={onDrop}
        customSquare={CustomSquareRenderer}
        customDarkSquareStyle={{ backgroundColor: "rgb(168 162 158)" }}
        customLightSquareStyle={{ backgroundColor: "rgb(214 211 209)" }}
        customPieces={CustomPieces()}
        boardOrientation={boardOrientation}
        onMouseOverSquare={(square) => {
          // highlight the possible moves. Send legal moves to the reducer and then the squares use that information
          // in the custom square renderer
          // console.log(`Just entered ${square}`)
          // console.log(game.moves({ square }))
          const legalMoves = game.moves({ square })
          // these are move strings, gotta convert 'em into squares. I think this should do it ...
          const squares = legalMoves
            .map((move) => {
              // gotta account or castling
              // just let the customSquare deal with this edge case

              if (move === "O-O-O") {
                return "c1"
              } else if (move === "O-O") {
                return "g1"
              }

              let match = move.match(squareRegex)
              return match && match[0]
            })
            .filter((entry) => entry) // filter out the nulls

          dispatch(setLegalSquares(squares as SquareString[]))
        }}
      />
    </>
  )
}

export default withAlternateMoves(TheChessBoard)
