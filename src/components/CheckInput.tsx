import { FC, useState, useEffect } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faCheck, faTimes } from "@fortawesome/free-solid-svg-icons"

interface IProps {
  classes?: string
  value: boolean
  label: string
  cb?: (newVal: boolean) => void
}

const CheckInput: FC<IProps> = ({ label, classes, cb, value }) => {
  // const [checked, setChecked] = useState(value)

  return (
    <label
      className={`custom-checkbox relative cursor-pointer select-none flex items-center ${classes}`}
    >
      <span className="the-label block pl-6">{label}</span>
      <input
        className="absolute opacity-0 w-0 h-0 cursor-poitner"
        type="checkbox"
        checked={value}
        onChange={(e) => {
          cb && cb(e.target.checked)
        }}
      />
      <span
        className={`the-checkbox absolute left-0 rounded border-gray-100 flex items-center justify-center ${
          value ? "bg-stone-400" : ""
        }`}
      >
        {value ? (
          <FontAwesomeIcon className="relative" icon={faCheck} />
        ) : (
          <FontAwesomeIcon
            className="times-icon relative text-gray-300"
            icon={faTimes}
          />
        )}
      </span>
    </label>
  )
}

export default CheckInput
