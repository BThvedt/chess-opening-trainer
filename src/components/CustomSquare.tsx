import {
  forwardRef,
  useRef,
  useState,
  CSSProperties,
  ReactNode,
  Ref,
  useEffect
} from "react"
import { useDispatch, useSelector } from "react-redux"
import type { RootState } from "../store/store"
import { SquareString } from "../types"

interface IProps {
  children: ReactNode
  // Allow user to specify their outer element
  // Opting not to use generics for simplicity
  ref: Ref<any>
  square: SquareString
  squareColor: "white" | "black"
  style: CSSProperties
}

// backgroundColor: squareColor === "black" ? "#064e3b" : "#312e81",

const CustomSquareRenderer = forwardRef<HTMLDivElement, IProps>(
  (props, ref) => {
    const { children, square, squareColor, style } = props

    const legalSquares = useSelector(
      ({ appStore }: RootState) => appStore.legalSquares
    )

    const hintSquares = useSelector(
      ({ appStore }: RootState) => appStore.hintSquares
    )

    const showLegalSquares = useSelector(
      ({ appStore }: RootState) => appStore.showLegalSquares
    )

    const errorSquares = useSelector(
      ({ appStore }: RootState) => appStore.errorSquares
    )

    const boardOrientation = useSelector(
      ({ appStore }: RootState) => appStore.orientation
    )

    const selectedOpeningLine = useSelector(
      ({ appStore }: RootState) => appStore.selectedOpeningLine
    )

    const [isLegalMove, setIsLegalMove] = useState(false)
    const [isHintSquare, setIsHintSquare] = useState(false)
    const [isErrorSquare, setIsErrorSquare] = useState(false)

    const hints = useSelector(({ appStore }: RootState) => appStore.hints)

    useEffect(() => {
      if (showLegalSquares && !errorSquares) {
        if (legalSquares && legalSquares.includes(square)) {
          setIsLegalMove(true)
        } else {
          setIsLegalMove(false)
        }
      } else {
        setIsLegalMove(false)
      }
    }, [legalSquares, showLegalSquares, boardOrientation])

    useEffect(() => {
      if ((hints === "all" || hints === "spaces") && !errorSquares) {
        if (hintSquares && hintSquares.includes(square)) {
          setIsHintSquare(true)
        } else {
          setIsHintSquare(false)
        }
      } else {
        setIsHintSquare(false)
      }
    }, [hintSquares, hints, boardOrientation])

    useEffect(() => {
      if (errorSquares && errorSquares.includes(square)) {
        setIsErrorSquare(true)
      } else {
        setIsErrorSquare(false)
      }
    }, [errorSquares, boardOrientation])

    useEffect(() => {
      if (!selectedOpeningLine) {
        setIsErrorSquare(false)
        setIsHintSquare(false)
      }
    }, [selectedOpeningLine])

    return (
      <div
        ref={ref}
        style={{
          ...style,
          position: "relative",
          backgroundColor:
            !isErrorSquare && isHintSquare
              ? "rgba(251, 191, 36, 0.5)"
              : isErrorSquare
              ? "rgba(239,68,68,0.5)"
              : ""
        }}
        className={`${isLegalMove ? "legal-square" : ""}`}
      >
        {children}
      </div>
    )
  }
)

export default CustomSquareRenderer
