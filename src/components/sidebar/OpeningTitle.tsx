import { FC } from "react"
import { useDispatch, useSelector } from "react-redux"
import { goBack } from "../../store/reducer"
import type { RootState } from "../../store/store"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons"

interface IProps {}

const OpeningTitle: FC<IProps> = () => {
  const dispatch = useDispatch()

  const openingTitleParts = useSelector(
    ({ appStore }: RootState) => appStore.openingTitleParts
  )

  return (
    <h2 className="mb-1 block font-bold">
      {openingTitleParts ? (
        <span>
          <FontAwesomeIcon
            className="cursor-pointer hover:text-teal-600"
            icon={faArrowLeft}
            onClick={() => {
              dispatch(goBack())
            }}
          />
          &nbsp;&nbsp;
          {openingTitleParts.map((part, i) => {
            return (
              <span key={i}>
                {`${part} ${
                  i === 0 && openingTitleParts.length > 1 ? "- " : ""
                }`}
                {i === 1 && openingTitleParts.length > 2 ? (
                  <>
                    <br />
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                  </>
                ) : (
                  <></>
                )}
              </span>
            )
          })}
        </span>
      ) : (
        "Choose an Opening Line"
      )}
    </h2>
  )
}

export default OpeningTitle
