export declare type SquareString =
  | "a8"
  | "b8"
  | "c8"
  | "d8"
  | "e8"
  | "f8"
  | "g8"
  | "h8"
  | "a7"
  | "b7"
  | "c7"
  | "d7"
  | "e7"
  | "f7"
  | "g7"
  | "h7"
  | "a6"
  | "b6"
  | "c6"
  | "d6"
  | "e6"
  | "f6"
  | "g6"
  | "h6"
  | "a5"
  | "b5"
  | "c5"
  | "d5"
  | "e5"
  | "f5"
  | "g5"
  | "h5"
  | "a4"
  | "b4"
  | "c4"
  | "d4"
  | "e4"
  | "f4"
  | "g4"
  | "h4"
  | "a3"
  | "b3"
  | "c3"
  | "d3"
  | "e3"
  | "f3"
  | "g3"
  | "h3"
  | "a2"
  | "b2"
  | "c2"
  | "d2"
  | "e2"
  | "f2"
  | "g2"
  | "h2"
  | "a1"
  | "b1"
  | "c1"
  | "d1"
  | "e1"
  | "f1"
  | "g1"
  | "h1"

export type OpeningInfo = {
  level?: "Beginner" | "Intermediate" | "Advanced" | "Expert"
  classification?: "Basic" | "Tricky" | "Solid"
  type?: "Positional" | "Taticital"
  popularity?: "Low" | "Med" | "High"
  subLines?: number
  moves?: number
}

export type OpeningLineItem = {
  name: string
  id: string
  info?: OpeningInfo
  note: string
  subLines?: string[] // if this is a parent line, it will have an array of sublines
  moves?: number // if no sublines, there should be the number of moves calculated
  parent?: string // if this is a subline, this will be the id of the parent
}

export type OpeningListItem = {
  name: string
  file: string
  for?: "white" | "black"
  lines: OpeningLineItem[]
}

export type OpeningsList = OpeningListItem[]

export type Move = {
  to: SquareString
  from: SquareString
  promotion?: string
  lan?: string
}

export enum SidebarDisplay {
  OPENING_LIST,
  OPENING_LINES,
  LINE_IS_SELECTED
}

export type Sounds =
  | "null"
  | "start"
  | "success"
  | "error"
  | "move"
  | "capture"
  | "castle"
  | "check"
  | "checkmate"

export type SpecialSoundInstruction = "noMove"

export type ShortPieceName = "p" | "b" | "r" | "q" | "n"
