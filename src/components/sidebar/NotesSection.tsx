import { useState, useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { RootState } from "../../store/store"
import { FC } from "react"

interface IProps {}

const NotesSection: FC<IProps> = () => {
  let [notes, setNotes] = useState<string[] | null>(null)

  const selectedOpeningLine = useSelector(
    ({ appStore }: RootState) => appStore.selectedOpeningLine
  )

  const showNotes = useSelector(({ appStore }: RootState) => appStore.showNotes)

  const selectedAlternateLineNotes = useSelector(
    ({ appStore }: RootState) => appStore.selectedAlternateLineNotes
  )

  const moveNum = useSelector(({ appStore }: RootState) => appStore.moveNum)

  useEffect(() => {
    let notes: string[]

    // if (!selectedAlternateLineNotes) {
    //   alert(selectedOpeningLine)
    // }

    if (selectedAlternateLineNotes.length) {
      setNotes(selectedAlternateLineNotes)
    } else if (
      selectedOpeningLine?.notes &&
      selectedOpeningLine?.notes.length
    ) {
      setNotes(selectedOpeningLine.notes)
    } else {
      setNotes(null)
    }
  }, [selectedOpeningLine, moveNum, selectedAlternateLineNotes])

  return (
    <>
      {showNotes && notes && (
        <div className="mt-2">
          {notes && notes[moveNum] && (
            <div>
              <p>Notes: </p>
              <p>{notes[moveNum]}</p>
            </div>
          )}
          {(!notes || !notes[moveNum]) && (
            <p className="text-sm text-gray-400">No Note</p>
          )}
        </div>
      )}
    </>
  )
}

export default NotesSection
