import { describe, it, expect } from 'vitest'
import { SVGChessboard } from '../chessboardsvg/index'

const STARTING_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR'
const NO_COORDS = { drawCoordinates: false }

function board(g: SVGElement) {
  return g.querySelector<SVGElement>('[data-group="board"]')!
}
function pieces(g: SVGElement) {
  return g.querySelector<SVGElement>('[data-group="pieces"]')!
}
function bgAnnotations(g: SVGElement) {
  return g.querySelector<SVGElement>('[data-group="annotations-bg"]')!
}
function fgAnnotations(g: SVGElement) {
  return g.querySelector<SVGElement>('[data-group="annotations-fg"]')!
}

describe('SVGChessboard.fromFEN', () => {
  it('draw() returns an SVG g element', () => {
    // Scenario: The rendered board is rooted in an SVG group element
    // Given: a board loaded from the starting-position FEN
    // When: draw() is called
    // Then: the root element is an SVG <g> in the SVG namespace
    const g = SVGChessboard.fromFEN(STARTING_FEN, NO_COORDS).draw()
    expect(g.tagName).toBe('g')
    expect(g.namespaceURI).toBe('http://www.w3.org/2000/svg')
  })

  it('board group has exactly 64 squares', () => {
    // Scenario: The board layer contains one rect per square
    // Given: a board loaded from FEN with coordinates disabled
    // When: draw() is called
    // Then: the board group contains exactly 64 rect children
    const g = SVGChessboard.fromFEN(STARTING_FEN, NO_COORDS).draw()
    expect(board(g).children).toHaveLength(64)
    expect(board(g).children[0].tagName).toBe('rect')
  })

  it('starting position has 32 pieces', () => {
    // Scenario: All 32 pieces in the starting position are rendered
    // Given: a board loaded from the standard starting FEN
    // When: draw() is called
    // Then: the pieces group contains exactly 32 child elements
    const g = SVGChessboard.fromFEN(STARTING_FEN, NO_COORDS).draw()
    expect(pieces(g).children).toHaveLength(32)
  })

  it('empty board has 0 pieces', () => {
    // Scenario: A FEN with no pieces produces an empty pieces group
    // Given: a FEN representing an empty board ("8/8/8/8/8/8/8/8"), loaded with skipValidation
    // When: draw() is called
    // Then: the pieces group has no children
    const g = SVGChessboard.fromFEN('8/8/8/8/8/8/8/8', NO_COORDS, true).draw()
    expect(pieces(g).children).toHaveLength(0)
  })

  it('highlight() adds a rect to the background annotations group', () => {
    // Scenario: Highlighting a square adds a coloured overlay behind the pieces
    // Given: a board in starting position
    // When: highlight('e4') is called and the board is drawn
    // Then: the background annotations group contains one rect element
    const sv = SVGChessboard.fromFEN(STARTING_FEN, NO_COORDS)
    sv.highlight('e4')
    const g = sv.draw()
    expect(bgAnnotations(g).children).toHaveLength(1)
    expect(bgAnnotations(g).children[0].tagName).toBe('rect')
  })

  it('highlight() uses the specified color', () => {
    // Scenario: The highlight color passed to highlight() is applied to the rendered rect
    // Given: a board where highlight('e4', '#ff0000') is called
    // When: draw() is called
    // Then: the highlight rect's fill attribute is '#ff0000'
    const sv = SVGChessboard.fromFEN(STARTING_FEN, NO_COORDS)
    sv.highlight('e4', '#ff0000')
    const g = sv.draw()
    expect(bgAnnotations(g).children[0].getAttribute('fill')).toBe('#ff0000')
  })

  it('multiple highlights accumulate', () => {
    // Scenario: Each call to highlight() adds an independent overlay rect
    // Given: three separate highlight() calls on different squares
    // When: draw() is called
    // Then: the background annotations group contains three rect children
    const sv = SVGChessboard.fromFEN(STARTING_FEN, NO_COORDS)
    sv.highlight('e4')
    sv.highlight('d4')
    sv.highlight('e5')
    const g = sv.draw()
    expect(bgAnnotations(g).children).toHaveLength(3)
  })

  it('addArrow() adds a path to the foreground annotations group', () => {
    // Scenario: An arrow annotation is rendered as a path above the pieces
    // Given: a board where addArrow('e2', 'e4') is called
    // When: draw() is called
    // Then: the foreground annotations group contains one path element
    const sv = SVGChessboard.fromFEN(STARTING_FEN, NO_COORDS)
    sv.addArrow('e2', 'e4')
    const g = sv.draw()
    expect(fgAnnotations(g).children).toHaveLength(1)
    expect(fgAnnotations(g).children[0].tagName).toBe('path')
  })

  it('square colors propagate to board rects', () => {
    // Scenario: Custom square colors are reflected in the rendered SVG fill attributes
    // Given: a board constructed with custom white and black square colors
    // When: draw() is called
    // Then: both custom colors appear among the fill attributes of the board rects
    const sv = SVGChessboard.fromFEN(STARTING_FEN, {
      ...NO_COORDS,
      whiteSquareColor: '#aabbcc',
      blackSquareColor: '#112233',
    })
    const fills = Array.from(board(sv.draw()).children).map((r) => r.getAttribute('fill'))
    expect(fills).toContain('#aabbcc')
    expect(fills).toContain('#112233')
  })

  it('addShape(circle) adds a circle to the foreground annotations group', () => {
    // Scenario: A circle shape annotation is rendered as an SVG circle above the pieces
    // Given: a board where addShape('e4', 'circle') is called
    // When: draw() is called
    // Then: the foreground annotations group contains one circle element
    const sv = SVGChessboard.fromFEN(STARTING_FEN, NO_COORDS)
    sv.addShape('e4', 'circle')
    const g = sv.draw()
    expect(fgAnnotations(g).children).toHaveLength(1)
    expect(fgAnnotations(g).children[0].tagName).toBe('circle')
  })

  it('addShape(square) adds a rect to the foreground annotations group', () => {
    // Scenario: A square shape annotation is rendered as an SVG rect above the pieces
    // Given: a board where addShape('e4', 'square') is called
    // When: draw() is called
    // Then: the foreground annotations group contains one rect element
    const sv = SVGChessboard.fromFEN(STARTING_FEN, NO_COORDS)
    sv.addShape('e4', 'square')
    expect(fgAnnotations(sv.draw()).children[0].tagName).toBe('rect')
  })

  it('addShape(squircle) adds a path to the foreground annotations group', () => {
    // Scenario: A squircle shape annotation is rendered as an SVG path above the pieces
    // Given: a board where addShape('e4', 'squircle') is called
    // When: draw() is called
    // Then: the foreground annotations group contains one path element
    const sv = SVGChessboard.fromFEN(STARTING_FEN, NO_COORDS)
    sv.addShape('e4', 'squircle')
    expect(fgAnnotations(sv.draw()).children[0].tagName).toBe('path')
  })

  it('addIcon() adds a g element to the foreground annotations group', () => {
    // Scenario: A move-quality icon is rendered as an SVG group above the pieces
    // Given: a board where addIcon('e4', 'brilliant') is called
    // When: draw() is called
    // Then: the foreground annotations group contains one g element
    const sv = SVGChessboard.fromFEN(STARTING_FEN, NO_COORDS)
    sv.addIcon('e4', 'brilliant')
    const g = sv.draw()
    expect(fgAnnotations(g).children).toHaveLength(1)
    expect(fgAnnotations(g).children[0].tagName).toBe('g')
  })

  it('multiple foreground annotations stack', () => {
    // Scenario: Mixed foreground annotations all render into the same group
    // Given: an arrow, a circle shape, and a blunder icon added to the board
    // When: draw() is called
    // Then: the foreground annotations group contains three children
    const sv = SVGChessboard.fromFEN(STARTING_FEN, NO_COORDS)
    sv.addArrow('e2', 'e4')
    sv.addShape('d4', 'circle')
    sv.addIcon('f6', 'blunder')
    expect(fgAnnotations(sv.draw()).children).toHaveLength(3)
  })

  it('drawCoordinates: true adds a coordinate group', () => {
    // Scenario: Enabling coordinates adds rank/file labels alongside the board groups
    // Given: a board constructed with drawCoordinates=true
    // When: draw() is called
    // Then: the root g has 5 children (board, coords, annotations-bg, pieces, annotations-fg)
    //       and text elements are present for the labels
    const g = SVGChessboard.fromFEN(STARTING_FEN, { drawCoordinates: true }).draw()
    expect(g.children).toHaveLength(5)
    expect(g.querySelectorAll('text').length).toBeGreaterThan(0)
  })
})

describe('SVGChessboard.fromPGN', () => {
  const PGN = '1.e4 e5'

  it('renders from PGN at ply 1', () => {
    // Scenario: A PGN board renders the correct number of pieces at a given ply
    // Given: a PGN with two moves, loaded at ply 1
    // When: draw() is called
    // Then: all 32 pieces are present (no captures yet)
    const g = SVGChessboard.fromPGN(PGN, NO_COORDS, 1, 'none').draw()
    expect(pieces(g).children).toHaveLength(32)
  })

  it('show-move: squares adds 2 highlights', () => {
    // Scenario: The "squares" show-move option highlights the from- and to-squares of the last move
    // Given: a PGN board at ply 1 with show-move='squares'
    // When: draw() is called
    // Then: two highlight rects appear in the background annotations group
    const g = SVGChessboard.fromPGN(PGN, NO_COORDS, 1, 'squares').draw()
    expect(bgAnnotations(g).children).toHaveLength(2)
  })

  it('show-move: arrow adds 2 highlights + 1 arrow', () => {
    // Scenario: The "arrow" show-move option highlights both squares and draws an arrow
    // Given: a PGN board at ply 1 with show-move='arrow'
    // When: draw() is called
    // Then: two highlight rects in the background group and one arrow path in the foreground group
    const g = SVGChessboard.fromPGN(PGN, NO_COORDS, 1, 'arrow').draw()
    expect(bgAnnotations(g).children).toHaveLength(2)
    expect(fgAnnotations(g).children).toHaveLength(1)
  })
})
