import { FC, useState, useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { setSubLineInfo, selectOpeningLine } from "../../store/reducer"
import { LoadTheOpening } from "../../helpers/LoadJson"
import type { RootState } from "../../store/store"
import { SidebarDisplay } from "../../types"
import PerfectScrollbar from "react-perfect-scrollbar"

interface IProps {}

const ChoosableOpeningList: FC<IProps> = () => {
  const dispatch = useDispatch()

  let [notes, setNotes] = useState<string | undefined>(undefined)

  const openingList = useSelector(
    (state: RootState) => state.appStore.openingList
  )

  const sidebarDisplay = useSelector(
    (state: RootState) => state.appStore.sidebarDisplay
  )

  const openingLines = useSelector(
    (state: RootState) => state.appStore.openingLines
  )

  useEffect(() => {}, [sidebarDisplay, openingList, openingLines])

  return (
    <>
      <div className="max-h-80 overflow-y-hidden">
        <PerfectScrollbar>
          <div className="pr-5">
            {sidebarDisplay === SidebarDisplay.OPENING_LIST &&
              openingList.map((opening, i) => {
                let { name, file, lines } = opening
                return (
                  <div
                    className="bg-gray-100 px-2 py-1 text-slate-700 rounded-sm mt-2 cursor-pointer hover:bg-teal-600 hover:text-gray-100 flex justify-between"
                    key={name}
                    onClick={async () => {
                      // actually on second thought this should have been done in a thunk. Oh well
                      await LoadTheOpening(name, file, dispatch)
                    }}
                  >
                    <p>{name}</p>
                    <p>{lines.length}</p>
                  </div>
                )
              })}
            {sidebarDisplay === SidebarDisplay.OPENING_LINES &&
              openingLines?.map((openingLine, i) => {
                let { id, name, info, subLines, moves } = openingLine

                // choices with sub lines have a different background color and display the number of sidelines
                // and display sublines number. Choices without sublines display the number of moves in the line
                // clicking on choice with sublines brings up the sublines, clicking on choice without sublines should
                // bring up a list of moves

                const hasSubLines = subLines?.length

                return (
                  <div
                    className={`${
                      hasSubLines
                        ? "bg-sky-500 text-gray-100"
                        : "bg-gray-100 text-slate-700"
                    } px-2 py-1 rounded-sm mt-2 cursor-pointer hover:bg-teal-600 hover:text-gray-100 flex justify-between`}
                    key={id}
                    onClick={() => {
                      setNotes(undefined)
                      if (hasSubLines) {
                        // incase there's still notes set

                        // load sublines
                        dispatch(
                          setSubLineInfo({
                            groupName: openingLine.name,
                            subLineIds: subLines!
                          })
                        )
                      } else {
                        // load moves. The json should already be in memory so should be easy
                        // step 1: have an array in the reducer
                        // step 2: I guess display the moves as a readable list on the front end
                        dispatch(selectOpeningLine({ id, name }))
                      }
                    }}
                    onMouseEnter={() => {
                      console.log(openingLine.note)
                      setNotes(openingLine.note)
                    }}
                    onMouseLeave={() => {
                      setNotes(undefined)
                    }}
                  >
                    <p>{name}</p>
                    <p>{subLines?.length ? subLines.length : moves}</p>
                  </div>
                )
              })}
          </div>
        </PerfectScrollbar>
      </div>
      <div className="mt-4">
        {notes && (
          <div>
            <p>Notes:</p>
            <p>{notes}</p>
          </div>
        )}
      </div>
    </>
  )
}

export default ChoosableOpeningList
