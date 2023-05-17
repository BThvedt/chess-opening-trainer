import { FC } from "react"

interface IProps {
  message: String
  button: String
  callback: () => void
}

const MessageModal: FC<IProps> = ({ message, button, callback }) => {
  return (
    <div className="absolute w-full h-full top-0 left-0 flex items-center justify-center">
      <div className="modal-box shadow w-56 flex flex-col items-center justify-center p-6 rounded bg-gray-100 text-slate-700 font-bold">
        <p className="mb-4">{message}</p>
        <p
          className="px-2 py-1 border-2 cursor-pointer border-stone-500 w-20 rounded pointer shadow text-center hover:text-gray-100 hover:bg-stone-400"
          onClick={() => {
            callback()
          }}
        >
          {button}
        </p>
      </div>
    </div>
  )
}

export default MessageModal
