import { FC } from "react"
import OpeningMoves from "./OpeningMoves"
import ChoosableOpeningList from "./ChoosableOpeningList"
import { useSelector } from "react-redux"
import { SidebarDisplay } from "../../types"
import type { RootState } from "../../store/store"

import ControlSection from "./ControlSection"
import OpeningTitle from "./OpeningTitle"
import NotesSection from "./NotesSection"

interface IProps {}

const Sidebar: FC<IProps> = () => {
  const sidebarDisplay = useSelector(
    (state: RootState) => state.appStore.sidebarDisplay
  )

  const hints = useSelector(({ appStore }: RootState) => appStore.hints)

  return (
    <section id="sidebar" className="w-full">
      <ControlSection />
      <OpeningTitle />
      <ChoosableOpeningList />
      {sidebarDisplay === SidebarDisplay.LINE_IS_SELECTED &&
        (hints === "all" || hints === "moves") && <OpeningMoves />}
      <div id="sidebar-area">
        <NotesSection />
      </div>
    </section>
  )
}

export default Sidebar
