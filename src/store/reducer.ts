import {
  SquareString,
  OpeningsList,
  Move,
  SidebarDisplay,
  OpeningInfo,
  OpeningLineItem,
  Sounds,
  ShortPieceName
} from "../types"
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import type { PayloadAction } from "@reduxjs/toolkit"
import { Chess, Square } from "chess.js"
import { getAllJSDocTagsOfKind } from "typescript"

export interface AppState {
  bodyClickToggle: boolean // used to close controls
  // controlClickToggle: boolean // used to close other controls
  sidebarDisplay: SidebarDisplay // enum used for the state of the sidebar
  openingList: OpeningsList // the top level list of openings
  currentOpening: string | null // the curent 'top level' opening i.e. caro-kann, bishop, itailian, etc
  openingTitleParts: string[] | null // can have 1, 2, or 3 parts to display the name. Also used backward navigation logic
  openingLines:
    | {
        id: string
        name: string
        for?: "white" | "black"
        info?: OpeningInfo
        subLines?: string[]
        moves?: number
        note?: string
      }[]
    | null
  openingJson: Record<string, string> | Record<string, string[]> | null // the json of all the lines of the top-level opening, stored in seperate files
  selectedOpeningLine: {
    id: string
    name: string
    moves: string[][]
    eval?: string[][]
    notes?: string[]
    lineString?: string // for comparing to opening lines
    for?: "white" | "black"
  } | null
  openingIsFor: "white" | "black" | null
  playAs: "white" | "black"
  line: string | null
  orientation: "white" | "black"
  alternateMoves: "off" | "on"
  hints: "all" | "moves" | "spaces" | "off"
  // moves: [SquareString, SquareString][]
  generateMoveMode: boolean // remove for production ... a checkbox where if activated, moves on the chessboard generate strings that can be copied/pasted into json
  generatedMoveString: string
  turn: "w" | "b"
  moveNum: number
  forwardToggle: boolean
  backwardToggle: boolean
  resetToggle: boolean
  showLegalSquares: boolean
  legalSquares: SquareString[] | null
  hintSquares: SquareString[] | null
  soundPlaying: string | null
  errorSquares: SquareString[] | null
  material: {
    white: ShortPieceName[]
    black: ShortPieceName[]
  }
  showNotes: boolean
  gamePaused: boolean
  modalMessage: string
  showConfetti: boolean
  possibleRemainingOpeningLines: Record<string, string> // all the lines in the main opening category. Used in Alternate Moves
  mostRecentMoveLan: string // turns out the store needs to know this for alternate moves at least the way I do it
  selectedAlternateMove: string
  selectedAlternateLineMoveString: string
  currentAlternateLineId: string
  selectedAlternateLineEval?: string[][]
  selectedAlternateLineNotes: string[]
  showSelectMoveMessage: boolean
  alternateButtonClickToggle: boolean // runs a usestate if an alternate line button is clicked
}

const initialState: AppState = {
  openingList: [],
  bodyClickToggle: false,
  sidebarDisplay: SidebarDisplay.OPENING_LIST,
  currentOpening: null,
  openingTitleParts: null,
  selectedOpeningLine: null,
  openingIsFor: null,
  openingLines: null,
  openingJson: null,
  playAs: "white",
  line: null,
  orientation: "white",
  alternateMoves: "off",
  hints: "all",
  //moves: [],
  generateMoveMode: false,
  generatedMoveString: "",
  turn: "w",
  moveNum: 0,
  forwardToggle: false,
  backwardToggle: false,
  showLegalSquares: true,
  resetToggle: false,
  legalSquares: null,
  hintSquares: null,
  soundPlaying: null,
  errorSquares: null,
  material: {
    white: [],
    black: []
  },
  showNotes: false,
  gamePaused: false,
  modalMessage: "",
  showConfetti: false,
  possibleRemainingOpeningLines: {},
  mostRecentMoveLan: "",
  selectedAlternateMove: "",
  selectedAlternateLineMoveString: "",
  currentAlternateLineId: "",
  selectedAlternateLineEval: [],
  selectedAlternateLineNotes: [],
  showSelectMoveMessage: false, // I probably should have done this differently. Oh well. Last thing almost I want to put in
  alternateButtonClickToggle: false
}

// https://redux-toolkit.js.org/tutorials/quick-start
export const appStore = createSlice({
  name: "appStore",
  initialState,
  reducers: {
    alternateButtonClickToggle(state) {
      console.log("alternateButtonClickToggle")
      state.alternateButtonClickToggle = !state.alternateButtonClickToggle
    },
    showSelectMoveMessage(state, action: PayloadAction<boolean>) {
      // console.log("ACTION PAYLOAD IS")
      // console.log(action.payload)
      state.showSelectMoveMessage = action.payload
    },
    resetAlternateLineInfo(state) {
      state.possibleRemainingOpeningLines = {}
      state.mostRecentMoveLan = ""
      state.selectedAlternateMove = ""
      state.selectedAlternateLineMoveString = ""
      state.currentAlternateLineId = ""
      state.selectedAlternateLineEval = []
      state.selectedAlternateLineNotes = []

      console.log("RESETTTING ALTERNATE LINE INFO")

      // have to reset the approperate Remaining opening lines
      // get the opening Json keys
      if (state.openingJson) {
        let openingJsonKeys = Object.keys(state.openingJson!)
        // all the keys
        let theRightKeys = openingJsonKeys.filter((key) => {
          return !key.endsWith("eval") && !key.endsWith("notes")
        })

        // possibleRemainingOpeningLines is for the alternate moves functionality
        let possibleRemainingOpeningLines: Record<string, string> = {}
        theRightKeys.forEach((key) => {
          possibleRemainingOpeningLines[key] = state.openingJson![key] as string // the right keys will have strng values
        })

        state.possibleRemainingOpeningLines = possibleRemainingOpeningLines
      }
    },
    setSelectedAlternateLineMoves(state, action: PayloadAction<string>) {
      let lineId = action.payload
      state.currentAlternateLineId = lineId
      state.selectedAlternateLineMoveString =
        state.possibleRemainingOpeningLines[lineId]

      // now notes and eval
      // gotta find it in the openingJson
      let evalString = state.openingJson![`${lineId}eval`]

      let evalArray = (evalString as string).split("|")
      let noteArray = state.openingJson![`${lineId}notes`]

      state.selectedAlternateLineEval =
        evalArray && evalArray.length
          ? evalArray.map((item: string) => {
              return item.split(":")
            })
          : undefined

      state.selectedAlternateLineNotes = noteArray as string[]
    },
    setAlternateMove(state, action: PayloadAction<string>) {
      state.selectedAlternateMove = action.payload
    },
    addMoveForAlternateMoves(
      state,
      action: PayloadAction<{ lan: string; turn: "w" | "b" }>
    ) {
      // should the payload be type move??
      // anyway so add the move to the gameForAlternate moves
      // and eliminate opening lines

      // check the on drop function to send the right variables
      let { lan, turn } = action.payload
      let { moveNum, possibleRemainingOpeningLines } = state

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

      // ok so that's how you extract the right string to compare
      // next step is to loop through possible remaining opening lines and eliminate every one that doesn't match the
      // substring at those indexes to the lan
      let newPossibleRemainingLines: Record<string, string> = {}
      let idKeys = Object.keys(state.possibleRemainingOpeningLines)

      idKeys.forEach((key) => {
        let lineString = possibleRemainingOpeningLines[key]
        try {
          if (lineString.substring(startIndex, endIndex) === lan) {
            newPossibleRemainingLines[key] = lineString
          }
        } catch (e) {
          console.log({
            key,
            lineString,
            possibilities: state.possibleRemainingOpeningLines
          })
        }
      })

      state.mostRecentMoveLan = lan

      state.possibleRemainingOpeningLines = newPossibleRemainingLines
    },
    closeModal(state) {
      state.modalMessage = ""
    },
    setShowConfetti(state, action: PayloadAction<boolean>) {
      state.showConfetti = action.payload
    },
    openModal(state, action: PayloadAction<string>) {
      state.modalMessage = action.payload
    },
    setGamePaused(state, action: PayloadAction<boolean>) {
      state.gamePaused = action.payload
    },
    setShowNotes(state, action: PayloadAction<boolean>) {
      state.showNotes = action.payload
      localStorage.setItem("showNotes", action.payload ? "true" : "") // empty string is falsey)
    },
    removeFromCapturedMaterial(
      state,
      action: PayloadAction<{ color: "white" | "black"; piece: ShortPieceName }>
    ) {
      let { color, piece } = action.payload
      // console.log("Removing from catured material")
      // console.log({ color, piece })

      let newCaptures = [...state.material[color]]
      let indexToRemove = newCaptures.findIndex((entry) => entry == piece)
      newCaptures.splice(indexToRemove, 1)

      let newMaterial = { ...state.material }
      newMaterial[color] = newCaptures
      state.material = newMaterial
    },
    addToCapturedMaterial(
      state,
      action: PayloadAction<{ color: "white" | "black"; piece: ShortPieceName }>
    ) {
      let { color, piece } = action.payload

      state.material[color].push(piece)
    },
    resetMaterial(state) {
      state.material = {
        white: [],
        black: []
      }
    },
    setErrorSquares(state, action: PayloadAction<SquareString[] | null>) {
      let squareString = action.payload

      if (squareString && squareString.length === 2) {
        state.errorSquares = squareString
      } else if (squareString === null) {
        state.errorSquares = squareString
      }
    },

    playSound(state, action: PayloadAction<Sounds>) {
      // let sound = (state.sounds as Record<Sounds, HTMLAudioElement>)[
      //   action.payload
      // ]

      // sound.play()
      state.soundPlaying = action.payload
    },
    setPreferences(state) {
      const showLegalSquares = localStorage.getItem("showLegalSquares")
      const showNotes = localStorage.getItem("showNotes")

      const playAs = localStorage.getItem("playAs") as "white" | "black"
      const hints = localStorage.getItem("hints") as
        | "all"
        | "moves"
        | "spaces"
        | "off"
      const alternateMoves = localStorage.getItem("alternateMoves") as
        | "off"
        | "on"
      const orientation = localStorage.getItem("orientation") as
        | "white"
        | "black"

      state.orientation = orientation ? orientation : "white"
      state.playAs = playAs ? playAs : "white"
      state.hints = hints ? hints : "all"
      state.alternateMoves = alternateMoves ? alternateMoves : "off"
      state.showLegalSquares = showLegalSquares
        ? !!state.showLegalSquares
        : false
      state.showNotes = showNotes ? true : false

      // console.log("IN SET PREFERENCES")
      // console.log(state.showLegalSquares)
    },
    setHintSquares(state, action: PayloadAction<SquareString[] | null>) {
      state.hintSquares = action.payload
    },
    setLegalSquares(state, action: PayloadAction<SquareString[] | null>) {
      state.legalSquares = action.payload
    },
    setShowLegalSquares: (state, action: PayloadAction<boolean>) => {
      state.showLegalSquares = action.payload
      localStorage.setItem(
        "showLegalSquares",
        action.payload ? "true" : "" // empty string is falsey
      )
    },
    forwardToggle: (state) => {
      state.forwardToggle = !state.forwardToggle
    },
    backwardToggle(state) {
      state.backwardToggle = !state.backwardToggle
    },
    resetToggle(state) {
      state.resetToggle = !state.resetToggle
    },
    setMoveNum(state, action: PayloadAction<number>) {
      state.moveNum = action.payload
    },
    setTurn(state, action: PayloadAction<"w" | "b">) {
      state.turn = action.payload
    },
    // this loads the top level of the opening list
    setOpeningList: (state, action: PayloadAction<OpeningsList>) => {
      state.openingList = action.payload

      // reset openingTitleParts
      state.openingTitleParts = null
    },
    // this when the user selects a particular opening
    // it sets the lines (as well as lines with sublines)
    setOpeningInfo: (
      state,
      action: PayloadAction<{
        openingName: string
        json: Record<string, string>
      }>
    ) => {
      state.currentOpening = action.payload.openingName
      state.openingJson = action.payload.json

      // opening Title Parts is what is displayed as the name to the user
      state.openingTitleParts = [action.payload.openingName]

      // now set the opening lines, including info, and sublines
      state.sidebarDisplay = SidebarDisplay.OPENING_LINES

      // first find the opening list item
      let theOpening = state.openingList.find((opening) => {
        return opening.name === action.payload.openingName
      })!

      theOpening?.for
        ? (state.openingIsFor = theOpening.for)
        : (state.openingIsFor = null)

      if (theOpening.for === "black") {
        state.orientation = "black"
        state.playAs = "black"
      } else {
        state.orientation = "white"
        state.playAs = "white"
      }

      // this tells compoennts to reset stuff
      state.resetToggle = !state.resetToggle

      // get the main opening lines, exclude the chlidren lines
      let theOpeningLines = theOpening?.lines.filter((line) => !line.parent)

      // get the sublines and moves
      theOpeningLines = theOpeningLines?.map((line) => {
        // dont' mutatate state directly
        let stateVersionOfLine = { ...line }

        const theOpeiningLineId = line.id
        let subLines: string[] = []
        theOpening.lines.forEach((theOpeningLine) => {
          if (theOpeiningLineId === theOpeningLine.parent)
            subLines.push(theOpeningLine.id)
        })
        stateVersionOfLine.subLines = subLines

        // if no sublines ...
        if (subLines.length === 0) {
          // moves are split by '|'

          try {
            stateVersionOfLine.moves = (
              state.openingJson![line.id] as string
            ).split("|").length
          } catch (e) {
            console.log(e)
            alert(line.id)
          }
        } else {
          // don't forget the main line
          stateVersionOfLine.subLines.push(line.id)
        }

        return stateVersionOfLine
      })

      state.openingLines = theOpeningLines
    },
    goBack: (state) => {
      // if top level opening is set, go back to opening list
      // if sub opening is set, go back to opening lines
      // how do we know if sub opening is set?? by looking at the opening title parts

      // pop off the opening title part
      state.openingTitleParts?.pop()

      // hint squares should be off
      state.hintSquares = null

      // send message to components to reset everything

      state.resetToggle = !state.resetToggle

      // get some useful info. In all three cases this is defined
      let topLevelOpening = state.openingList.find((opening) => {
        return opening.name === state.currentOpening
      })!

      switch (state.openingTitleParts?.length) {
        case 2:
          // alert("go back to sublines")
          // pop off the last opening title part get current line, find the parent, and set sublineInfo
          let { id } = state.selectedOpeningLine!

          // this will have a parent if we're here. So find it and select all the sublines of the parent
          // and set sublines with the name of the parent and an array of subline id's

          let lines = topLevelOpening.lines
          let currentLine = lines.find((line) => line.id === id)!
          let parentId = currentLine.parent!

          let siblingLines: OpeningLineItem[] = []

          // this eitehr has a parent ID, or it IS the parent
          if (parentId) {
            siblingLines = lines.filter((line) => line.parent === parentId)
          } else {
            siblingLines = lines.filter((line) => line.parent === id)
          }

          lines.filter((line) => line.parent === parentId)

          state.openingLines = siblingLines.map((subline) => {
            let moves = (state.openingJson![subline.id] as string).split(
              "|"
            ).length
            return {
              id: subline.id,
              name: subline.name,
              moves
            }
          })

          // don't forget to push the base line too, at the start. If current line has a parentId, then
          // find the parent. else, it IS the parent ..
          if (parentId) {
            let baseLine = lines.find((line) => line.id === parentId)!

            state.openingLines.unshift({
              id: parentId,
              name: baseLine.name,
              moves: (state.openingJson![parentId] as string).split("|").length
            })
          } else {
            state.openingLines.unshift({
              id,
              name: currentLine.name,
              moves: (state.openingJson![id] as string).split("|").length
            })
          }

          state.selectedOpeningLine = null
          state.sidebarDisplay = SidebarDisplay.OPENING_LINES

          // finally fix the title .. there's an ":" at the end
          // it is only occuring to me now that that character should have been added in the template instead
          // of the string logic haha
          let newOpeningParts = [...state.openingTitleParts]
          newOpeningParts[1] = newOpeningParts[1].slice(0, -1)
          state.openingTitleParts = newOpeningParts

          break
        case 1:
          // thankfully this should be easeier
          // go back to the 'main lines' list of the opening ...
          const theOpening = state.openingList!.find(
            (topLevelOpening) => topLevelOpening.name === state.currentOpening
          )!

          const theOpeningLines = theOpening.lines.filter(
            (line) => !line.parent
          )

          state.openingLines = theOpeningLines.map((line) => {
            let stateVersionOfLine = { ...line }

            const theOpeiningLineId = line.id
            let subLines: string[] = []
            theOpening.lines.forEach((theOpeningLine) => {
              if (theOpeiningLineId === theOpeningLine.parent)
                subLines.push(theOpeningLine.id)
            })
            stateVersionOfLine.subLines = subLines

            // if no sublines ...
            if (subLines.length === 0) {
              // moves are split by '|'
              stateVersionOfLine.moves = (
                state.openingJson![line.id] as string
              ).split("|").length
            } else {
              // don't forget the main line
              stateVersionOfLine.subLines.push(line.id)
            }

            return stateVersionOfLine
          })

          state.selectedOpeningLine = null
          state.sidebarDisplay = SidebarDisplay.OPENING_LINES

          break
        case 0:
          // finally this should be the easiest case. Maybe it should have main/base line count as well
          // but I"ll deal with that later
          state.openingTitleParts = null
          state.selectedOpeningLine = null
          state.sidebarDisplay = SidebarDisplay.OPENING_LIST
          break
        default:
          alert("how did you get here")
          break
      }
    },
    // this is when the user selects an opening line that goes to the moves. If the line
    // has sublines, 'setSublineInfo' is used instead
    selectOpeningLine: (
      state,
      action: PayloadAction<{ id: string; name: string }>
    ) => {
      const { id, name } = action.payload

      // if it's the Base Line of a bunch of sublines, the name might be the same
      if (
        state.openingTitleParts!.length > 1 &&
        action.payload.name === state.openingTitleParts![1]
      ) {
        let newTitleParts = state.openingTitleParts!
        newTitleParts[1] = newTitleParts[1] + ":"

        state.openingTitleParts?.push("Base Line")
      } else if (state.openingTitleParts!.length > 1) {
        // the name usually has the parent name in it.. which is redunant so breek it off
        // and add 'variation' to the end. Also add a colon to the end of the first one
        let newTitleParts = [...state.openingTitleParts!]

        // add a colon at the end then push onto array
        newTitleParts[1] = newTitleParts[1] + ":"

        // in the Json it'll usually have a redudant name part and a dash, just get rid of that part and add variation
        let displayName =
          name.replace(`${state.openingTitleParts![1]} -`, "") + " variation"

        newTitleParts.push(displayName)

        state.openingTitleParts = newTitleParts
      } else {
        // we aren't in a 'sub line', we're on a 2nd level base line
        let newTitleParts = [...state.openingTitleParts!]
        newTitleParts.push(name)
        state.openingTitleParts = newTitleParts
      }

      let moveString = state.openingJson![id]
      let evalString = state.openingJson![`${id}eval`]
      let noteArray = state.openingJson![`${id}notes`]

      // moves is an array of the white move, then the black
      let moveArray = (moveString as string).split("|")
      let evalArray = (evalString as string).split("|")

      state.selectedOpeningLine = {
        id,
        name,

        moves: moveArray.map((item: string) => {
          return item.split(":")
        }),
        eval:
          evalArray && evalArray.length
            ? evalArray.map((item: string) => {
                return item.split(":")
              })
            : undefined,
        notes:
          noteArray && noteArray.length ? (noteArray as string[]) : undefined,
        lineString: moveString as string
      }

      state.sidebarDisplay = SidebarDisplay.LINE_IS_SELECTED

      // and finally, set the game and possible opening lines

      // get the opening Json keys
      let openingJsonKeys = Object.keys(state.openingJson!)
      // all the keys
      let theRightKeys = openingJsonKeys.filter((key) => {
        return !key.endsWith("eval") && !key.endsWith("notes")
      })

      // possibleRemainingOpeningLines is for the alternate moves functionality
      let possibleRemainingOpeningLines: Record<string, string> = {}
      theRightKeys.forEach((key) => {
        possibleRemainingOpeningLines[key] = state.openingJson![key] as string // the right keys will have strng values
      })

      state.possibleRemainingOpeningLines = possibleRemainingOpeningLines
    },
    // this is when the user clicks on a line that has sublines
    // it sets the line choices to the sublines
    setSubLineInfo: (
      state,
      action: PayloadAction<{
        groupName: string
        subLineIds: string[]
      }>
    ) => {
      // push the groupname of the opening line onto the opening title parts
      state.openingTitleParts?.push(action.payload.groupName)

      let theOpening = state.openingList.find((listItem) => {
        return listItem.name === state.currentOpening!
      })

      let theOpeningSublines = theOpening!.lines.filter((line) =>
        action.payload.subLineIds.includes(line.id)
      )

      state.openingLines = theOpeningSublines.map((subline) => {
        let moves

        try {
          moves = (state.openingJson![subline.id] as string).split("|").length
        } catch (e) {
          alert("error")
          console.log(JSON.stringify(subline, null, 2))
          alert(subline.id)
        }

        return {
          id: subline.id,
          name: subline.name,
          note: subline.note,
          moves
        }
      })
    },

    setPlayAs: (state, action: PayloadAction<"white" | "black">) => {
      state.playAs = action.payload
      localStorage.setItem("playAs", action.payload)
    },
    setOrientation: (state, action: PayloadAction<"white" | "black">) => {
      state.orientation = action.payload
      localStorage.setItem("orientation", action.payload)
    },
    setAlternateMoves: (state, action: PayloadAction<"off" | "on">) => {
      state.alternateMoves = action.payload
      localStorage.setItem("alternateMoves", action.payload)
    },
    setHints: (
      state,
      action: PayloadAction<"all" | "moves" | "spaces" | "off">
    ) => {
      state.hints = action.payload
      localStorage.setItem("hints", action.payload)
    },
    bodyClicked: (state) => {
      state.bodyClickToggle = !state.bodyClickToggle
    },
    setGenerateMoveMode: (state, action: PayloadAction<boolean>) => {
      state.generateMoveMode = action.payload
    },
    addToGeneratedMoveString: (
      state,
      action: PayloadAction<{ lan: string; turn: "w" | "b" }>
    ) => {
      let { lan, turn } = action.payload

      // the move string looks like:
      // e2e4:c7c5|g1f3:d7d6|d3d4:c5d4*
      if (state.generatedMoveString.length === 0) {
        state.generatedMoveString += `${lan}*`
      } else {
        // in this case there is always a * at the end, let's get rid of it and add it back in
        let newString = state.generatedMoveString.slice(0, -1)

        if (turn === "b") {
          newString += `|${lan}`
        } else if (turn === "w") {
          newString += `:${lan}`
        }

        newString = newString + "*"

        state.generatedMoveString = newString
      }
    },
    resetGeneratedMoveString: (state) => {
      state.generatedMoveString = ""
    }
  }
})

// Action creators are generated for each case reducer function
export const {
  setOpeningList,
  goBack,
  bodyClicked,
  setPlayAs,
  setOrientation,
  setAlternateMoves,
  setGenerateMoveMode,
  setHints,
  addToGeneratedMoveString,
  resetGeneratedMoveString,
  setOpeningInfo,
  setSubLineInfo,
  selectOpeningLine,
  setMoveNum,
  setTurn,
  setLegalSquares,
  setHintSquares,
  forwardToggle,
  backwardToggle,
  setShowLegalSquares,
  resetToggle,
  setPreferences,
  playSound,
  setErrorSquares,
  addToCapturedMaterial,
  resetMaterial,
  setShowNotes,
  setGamePaused,
  removeFromCapturedMaterial,
  openModal,
  setShowConfetti,
  closeModal,
  addMoveForAlternateMoves,
  setAlternateMove,
  setSelectedAlternateLineMoves,
  resetAlternateLineInfo,
  showSelectMoveMessage,
  alternateButtonClickToggle
} = appStore.actions

export default appStore.reducer
