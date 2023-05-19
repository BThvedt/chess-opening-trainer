import { useState, useEffect, useRef } from "react"
import Sidebar from "./components/sidebar/Sidebar"
import TheChessBoard from "./components/sidebar/TheChessBoard"
import {
  bodyClicked,
  setGenerateMoveMode,
  selectOpeningLine,
  setPreferences,
  openModal,
  closeModal,
  resetToggle,
  setShowConfetti
} from "./store/reducer"
import { useDispatch, useSelector } from "react-redux"
import { LoadOpenings, LoadTheOpening } from "./helpers/LoadJson"
import type { RootState } from "./store/store"
import Material from "./components/Material"
import MessageModal from "./components/MessageModal"
import ConfettiExplosion from "react-confetti-explosion"
import EvalBar from "./components/EvalBar"
import useWindowDimensions from "./hooks/UseWindowDimensions"

// testing stuff

interface ShortHeightClasses {
  appWrapper: string
  chessBoardWrapper: string
  sideBar: string
}

// https://redux-toolkit.js.org/tutorials/quick-start
function App() {
  const [jsonLoaded, setJsonLoaded] = useState(false)
  const [needPassword, setNeedPassword] = useState(false)
  const [passWord, setPassword] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [shortHeightClasses, setShortHeightClasses] =
    useState<ShortHeightClasses>({
      appWrapper: "",
      chessBoardWrapper: "",
      sideBar: "" // currently unused I guess
    })

  const { height: winHeight } = useWindowDimensions()

  const dispatch = useDispatch()

  const generateMoveMode = useSelector(
    (state: RootState) => state.appStore.generateMoveMode
  )

  const generatedMoveString = useSelector(
    (state: RootState) => state.appStore.generatedMoveString
  )

  const selectedOpeningLine = useSelector(
    ({ appStore }: RootState) => appStore.selectedOpeningLine
  )

  const modalMessage = useSelector(
    ({ appStore }: RootState) => appStore.modalMessage
  )

  const showConfetti = useSelector(
    ({ appStore }: RootState) => appStore.showConfetti
  )

  const paused = useSelector(({ appStore }: RootState) => appStore.gamePaused)

  const showSelectMoveMessage = useSelector(
    ({ appStore }: RootState) => appStore.showSelectMoveMessage
  )

  const playerColor = useSelector(({ appStore }: RootState) => appStore.playAs)

  const modalRef = useRef(null)

  // the size of the chessboard can get easily get awkward on short window heights like on laptops.
  useEffect(() => {
    let classes = {
      appWrapper: "max-w-screen-2xl",
      chessBoardWrapper: "",
      sideBar: ""
    }

    if (winHeight < 750) {
      classes = {
        ...classes,
        chessBoardWrapper: "pl-16 pr-8",
        appWrapper: "max-w-screen-lg"
      }
    }
    if (winHeight < 800) {
      classes = {
        ...classes,
        appWrapper: "max-w-screen-lg"
      }
    } else if (winHeight < 1000) {
      classes = {
        ...classes,
        appWrapper: "max-w-screen-xl"
      }
    }

    setShortHeightClasses(classes)
  }, [winHeight])

  // sets the defaults except for the highlight mvoe option which is in OpeningMoves.tsx
  useEffect(() => {
    dispatch(setPreferences())
  }, [])

  useEffect(() => {
    if (process.env.NODE_ENV !== "development") {
      setNeedPassword(true)
    }
  }, [])

  // OPENING lets set the opening and set the line here ------------------------------------------------
  // useEffect(() => {
  //   ;(async () => {
  //     // console.log("Auto Load the Bishop Opening")
  //     await LoadTheOpening("Scotch Gambit", "scotch", dispatch)
  //     dispatch(
  //       selectOpeningLine({
  //         id: "nVANeQkm",
  //         name: "Main Line"
  //       })
  //     )
  //   })()
  // }, [])

  // to test deploy script

  useEffect(() => {
    if (!jsonLoaded) {
      LoadOpenings(dispatch)
      setJsonLoaded(true)
    }
  }, [])

  return (
    <div
      id="app-wrapper"
      className={`w-full px-8 py-4 flex flex-col items-center justify-center ${shortHeightClasses.appWrapper} m-auto`}
      onClick={() => {
        dispatch(bodyClicked())
      }}
    >
      {needPassword && (
        <div className="absolute top-0 left-0 w-full h-full flex flex-col items-center justify-center">
          {!submitting && (
            <div className="relative bottom-8">
              <h2 className="text-xl">Password:</h2>
              <div className="mt-2">
                <input
                  type="password"
                  onChange={(e) => {
                    setPassword(e.target.value)
                  }}
                />
                <button
                  onClick={() => {
                    setSubmitting(true)
                    let randTime = Math.floor(Math.random() * 1500) + 500
                    setTimeout(() => {
                      setSubmitting(false)
                      if (passWord === "GimmeAllYourPawns") {
                        setNeedPassword(false)
                      }
                    }, randTime)
                  }}
                  className="px-4 py-1 bg-sky-500 ml-2 hover:bg-teal-600 cursor-pointer rounded-sm"
                >
                  Submit
                </button>
              </div>
            </div>
          )}
          {submitting && (
            <div className="relative bottom-8 w-full flex flex-col justify-center items-center">
              <h2 className="text-xl">Submitting</h2>
              <div role="status" className="mt-2">
                <svg
                  aria-hidden="true"
                  className="inline w-8 h-8 mr-2 text-gray-400 animate-spin  fill-gray-100"
                  viewBox="0 0 100 101"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                    fill="currentColor"
                  />
                  <path
                    d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                    fill="currentFill"
                  />
                </svg>
                <span className="sr-only">Loading...</span>
              </div>
            </div>
          )}
        </div>
      )}
      {!needPassword && (
        <>
          <header
            id="app-header"
            className="w-full flex justify-between items-center py-4"
          >
            <h1 id="app-title" className="text-2xl font-extrabold">
              Chess Openings Trainer
            </h1>
          </header>
          <main id="app-body" className="flex w-full p-2 max-md:flex-col">
            {/* max-xl:w-3/5 */}
            <section id="board" className="w-2/3  max-md:w-full">
              <div className="relative mb-1">
                <EvalBar />
                {/* max-2xl:pl-16 max-2xl:pr-8 */}
                <div
                  className={`pl-7 py-1 relative max-md:w-full  ${
                    paused || !selectedOpeningLine || showSelectMoveMessage
                      ? "opacity-75 select-none pointer-events-none"
                      : ""
                  } ${shortHeightClasses.chessBoardWrapper}`}
                >
                  <TheChessBoard />
                  {paused && (
                    <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
                      <p className="text-white text-2xl font-bold drop-shadow">
                        Paused
                      </p>
                    </div>
                  )}
                  {!selectedOpeningLine && !generateMoveMode && (
                    <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
                      <p className="text-white text-2xl font-bold drop-shadow">
                        Select Opening Line
                      </p>
                    </div>
                  )}
                  {!generateMoveMode && showSelectMoveMessage && (
                    <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
                      <p className="text-white text-2xl font-bold drop-shadow">
                        Select Move for{" "}
                        {playerColor === "black" ? "White" : "Black"}{" "}
                      </p>
                    </div>
                  )}
                  {modalMessage && (
                    <MessageModal
                      message={modalMessage}
                      button="Ok"
                      callback={() => {
                        dispatch(closeModal())
                        dispatch(resetToggle())
                        dispatch(setShowConfetti(false))
                      }}
                    />
                  )}
                  {showConfetti && (
                    <div className="absolute w-full h-full top-0 left-0 flex justify-center pt-24">
                      {/* Toned down slightly from default */}
                      <ConfettiExplosion
                        particleCount={50}
                        duration={1600}
                        force={0.4}
                      />
                    </div>
                  )}
                </div>
              </div>

              <Material />

              {(!process.env.NODE_ENV ||
                process.env.NODE_ENV === "development") && (
                <>
                  <div>
                    <input
                      id="generate-move-mode"
                      type="checkbox"
                      checked={generateMoveMode}
                      onChange={(event) => {
                        event.target.checked
                          ? dispatch(setGenerateMoveMode(true))
                          : dispatch(setGenerateMoveMode(false))
                      }}
                    />{" "}
                    <label htmlFor="generate-move-mode">
                      Generate Move mode
                    </label>
                  </div>
                  <div>{generatedMoveString}</div>
                </>
              )}
            </section>
            <div className="w-1/3 px-4 max-md:w-full max-md:pt-4">
              <Sidebar />
            </div>
          </main>
          <footer id="app-footer"></footer>
        </>
      )}
    </div>
  )
}

export default App
