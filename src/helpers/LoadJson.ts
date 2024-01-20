import { AppDispatch } from "../store/store"
import { setOpeningList, setOpeningInfo } from "../store/reducer"

export const LoadOpenings: (dispatch: AppDispatch) => Promise<boolean> = async (
  dispatch
) => {
  try {
    let response = await fetch("json/openings.json", {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json"
      }
    })

    let json = await response.json() // remember the .json() function is async as well

    dispatch(setOpeningList(json))
  } catch (e) {
    console.log("there was an error loading the openings")
    console.log(e)
    return false
  }

  return true
}

// .. oh yeah. I shoudl have created a thunk. Oh well. Remember, you can create thunks and do this in the store!
export const LoadTheOpening: (
  openingName: string,
  file: string,
  dispatch: AppDispatch
) => Promise<boolean> = async (openingName, file, dispatch) => {
  try {
    let response = await fetch(`/json/${file}.json`, {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json"
      }
    })

    let json = await response.json()

    dispatch(setOpeningInfo({ openingName, json }))
  } catch (e) {
    console.log(`There was an error loading the opening: ${openingName}`)
    console.log(e)
    return false
  }

  return true
}
