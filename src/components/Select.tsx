import { useState, useEffect, FC } from "react"
import type { RootState } from "../store/store"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faCaretDown } from "@fortawesome/free-solid-svg-icons"
import { useSelector } from "react-redux"

interface IProps {
  label: string
  value: string
  options: { name: string; value: string }[]
  onChange: (value: any) => void
  className: string
}

const Select: FC<IProps> = ({ label, value, options, onChange, className }) => {
  const [thisWasClicked, setThisWasClicked] = useState(false)
  const [active, setActive] = useState(false)

  const bodyClickeToggle = useSelector(
    (state: RootState) => state.appStore.bodyClickToggle
  )

  useEffect(() => {
    if (!thisWasClicked) {
      setActive(false)
    } else {
      setThisWasClicked(false)
    }
  }, [bodyClickeToggle])

  function toggleActivate() {
    if (active) {
      setActive(false)
    } else {
      setActive(true)
    }
  }

  return (
    <div
      className={`relative select-none ${className}`}
      onClick={(e) => {
        // e.stopPropagation()
        setThisWasClicked(true)
      }}
    >
      <label
        className="mb-1 block font-bold cursor-pointer"
        onClick={toggleActivate}
      >
        {label}
      </label>
      <div
        className="bg-gray-100 rounded-sm px-2 py-1 flex items-center justify-between text-slate-700 cursor-pointer"
        onClick={toggleActivate}
      >
        <p>
          {(() => options.find((option) => option.value === value)?.name)()}
        </p>{" "}
        <FontAwesomeIcon icon={faCaretDown} />
      </div>
      {active && (
        <div className="bg-gray-100 mt-2 rounded-sm  text-slate-700 cursor-pointer overflow-hidden shadow-lg absolute w-full z-99">
          {options.map((option, i) => {
            return (
              <div
                onClick={() => {
                  setActive(false)
                  onChange(options[i].value)
                }}
                className={`px-2 py-1 hover:bg-stone-400 hover:text-gray-100 ${
                  value == options[i].value ? "bg-stone-400 text-gray-100" : ""
                }`}
                key={option.value}
              >
                <p>{option.name}</p>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default Select
