const pieces = [
  "wP",
  "wN",
  "wB",
  "wR",
  "wQ",
  "wK",
  "bP",
  "bN",
  "bB",
  "bR",
  "bQ",
  "bK"
]

const CustomPieces = () => {
  const returnPieces: Record<string, any> = {}
  pieces.map((p) => {
    returnPieces[p] = ({ squareWidth }: any) => (
      <div
        style={{
          width: squareWidth,
          height: squareWidth,
          backgroundImage: `url(pieces/${p}.png)`,
          backgroundSize: "100%"
        }}
      />
    )
    return null
  })
  return returnPieces
}

export default CustomPieces
