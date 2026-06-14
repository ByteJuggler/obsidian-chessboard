import { describe, it, expect } from 'vitest'
import { createInteractivePGNBoard } from '../chessboardsvg/InteractivePGN'
import { ANNOTATION_COLORS } from '../Annotations'

const SIMPLE_PGN = '1.e4 e5 2.Nf3 Nc6'
const BOARD_OPTS = { drawCoordinates: false }

function bgAnnotations(container: HTMLElement) {
  return container.querySelector('[data-group="annotations-bg"]')!
}

function getNavButtons(container: HTMLElement) {
  const btns = container.querySelectorAll<HTMLButtonElement>('button.chess-pgn-btn')
  return {
    first: btns[0],
    prev: btns[1],
    next: btns[2],
    last: btns[3],
  }
}

describe('createInteractivePGNBoard', () => {
  it('renders a container element', () => {
    // Scenario: The interactive board is wrapped in an HTMLElement container
    // Given: a PGN string and board options
    // When: createInteractivePGNBoard is called
    // Then: an HTMLElement is returned
    const el = createInteractivePGNBoard(SIMPLE_PGN, BOARD_OPTS, undefined, 'none', 320)
    expect(el).toBeInstanceOf(HTMLElement)
  })

  it('has 4 navigation buttons', () => {
    // Scenario: The board renders first, previous, next, and last navigation controls
    // Given: a freshly created interactive board
    // When: the container is queried for nav buttons
    // Then: exactly 4 buttons with class chess-pgn-btn are present
    const el = createInteractivePGNBoard(SIMPLE_PGN, BOARD_OPTS, undefined, 'none', 320)
    const btns = el.querySelectorAll('button.chess-pgn-btn')
    expect(btns).toHaveLength(4)
  })

  it('first and prev buttons are disabled at start (ply 0 default)', () => {
    // Scenario: Navigation backwards is disabled when the board is at the starting position
    // Given: an interactive board initialised at ply 0
    // When: button disabled states are inspected
    // Then: first and prev are disabled; next and last are enabled
    const el = createInteractivePGNBoard(SIMPLE_PGN, BOARD_OPTS, 0, 'none', 320)
    const { first, prev, next, last } = getNavButtons(el)
    expect(first.disabled).toBe(true)
    expect(prev.disabled).toBe(true)
    expect(next.disabled).toBe(false)
    expect(last.disabled).toBe(false)
  })

  it('next and last buttons are disabled at final ply', () => {
    // Scenario: Navigation forwards is disabled when the board is at the final move
    // Given: an interactive board initialised at the last ply (ply 4 for a 4-half-move game)
    // When: button disabled states are inspected
    // Then: next and last are disabled; first and prev are enabled
    const el = createInteractivePGNBoard(SIMPLE_PGN, BOARD_OPTS, 4, 'none', 320)
    const { first, prev, next, last } = getNavButtons(el)
    expect(first.disabled).toBe(false)
    expect(prev.disabled).toBe(false)
    expect(next.disabled).toBe(true)
    expect(last.disabled).toBe(true)
  })

  it('clicking next advances move info text', () => {
    // Scenario: Clicking the next button advances the board by one half-move
    // Given: an interactive board at ply 0 showing "Starting position"
    // When: the next button is clicked
    // Then: the move info text updates to show the first move (e4)
    const el = createInteractivePGNBoard(SIMPLE_PGN, BOARD_OPTS, 0, 'none', 320)
    const moveInfo = el.querySelector<HTMLElement>('.chess-pgn-move-info')
    expect(moveInfo?.textContent).toContain('Starting position')

    const { next } = getNavButtons(el)
    next.click()
    expect(moveInfo?.textContent).toContain('e4')
  })

  it('clicking last then first returns to start', () => {
    // Scenario: The first button returns the board to the starting position from any ply
    // Given: an interactive board at ply 0
    // When: last is clicked (jumping to final move), then first is clicked
    // Then: the move info text returns to "Starting position"
    const el = createInteractivePGNBoard(SIMPLE_PGN, BOARD_OPTS, 0, 'none', 320)
    const moveInfo = el.querySelector<HTMLElement>('.chess-pgn-move-info')
    const { first, last } = getNavButtons(el)

    last.click()
    expect(moveInfo?.textContent).not.toContain('Starting position')

    first.click()
    expect(moveInfo?.textContent).toContain('Starting position')
  })

  it('ArrowRight key advances position', () => {
    // Scenario: The ArrowRight keyboard shortcut advances the board by one half-move
    // Given: an interactive board at ply 0
    // When: a keydown event with key='ArrowRight' is dispatched on the container
    // Then: the move info text updates to show the first move (e4)
    const el = createInteractivePGNBoard(SIMPLE_PGN, BOARD_OPTS, 0, 'none', 320)
    const moveInfo = el.querySelector<HTMLElement>('.chess-pgn-move-info')
    expect(moveInfo?.textContent).toContain('Starting position')

    el.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }))
    expect(moveInfo?.textContent).toContain('e4')
  })

  it('ArrowLeft key goes back', () => {
    // Scenario: The ArrowLeft keyboard shortcut steps the board back by one half-move
    // Given: an interactive board at ply 1 showing move 'e4'
    // When: a keydown event with key='ArrowLeft' is dispatched on the container
    // Then: the move info text returns to "Starting position"
    const el = createInteractivePGNBoard(SIMPLE_PGN, BOARD_OPTS, 1, 'none', 320)
    const moveInfo = el.querySelector<HTMLElement>('.chess-pgn-move-info')
    expect(moveInfo?.textContent).toContain('e4')

    el.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }))
    expect(moveInfo?.textContent).toContain('Starting position')
  })

  it('renders an SVG board inside the container', () => {
    // Scenario: The interactive board includes an SVG chess diagram
    // Given: a freshly created interactive board
    // When: the container is queried for SVG elements
    // Then: at least one SVG element is present
    const el = createInteractivePGNBoard(SIMPLE_PGN, BOARD_OPTS, undefined, 'none', 320)
    const svgs = el.querySelectorAll('svg')
    expect(svgs.length).toBeGreaterThan(0)
  })

  it('throws when initialPly exceeds game length', () => {
    // Scenario: A ply value beyond the end of the game is an authoring error that must be reported
    // Given: a PGN with 4 half-moves and an initial ply of 99
    // When: createInteractivePGNBoard is called
    // Then: an Error is thrown whose message names the invalid ply and the valid maximum
    expect(() => createInteractivePGNBoard(SIMPLE_PGN, BOARD_OPTS, 99, 'none', 320)).toThrow(/ply 99.*out of range/i)
    expect(() => createInteractivePGNBoard(SIMPLE_PGN, BOARD_OPTS, 99, 'none', 320)).toThrow(/4/)
  })

  describe('annotations', () => {
    const HIGHLIGHT_ANN = [{ type: 'highlight' as const, square: 'e5', color: ANNOTATION_COLORS.green }]

    it('renders annotation highlight at the target ply', () => {
      // Scenario: Annotations appear in the SVG only when the board is at the target ply
      // Given: an interactive board with a highlight on e5, target ply=2, starting at ply 2
      // When: the board is rendered at ply 2 (the target)
      // Then: the background annotations group has at least one child (the highlight rect)
      const el = createInteractivePGNBoard(SIMPLE_PGN, BOARD_OPTS, 2, 'none', 320, false, HIGHLIGHT_ANN)
      expect(bgAnnotations(el).children.length).toBeGreaterThan(0)
    })

    it('hides annotations when navigated away from the target ply', () => {
      // Scenario: Navigating away from the target ply removes annotations from the board
      // Given: an interactive board with a highlight, target ply=2, starting at ply 2
      // When: the previous button is clicked (navigating to ply 1)
      // Then: the background annotations group is empty (no show-move highlights either)
      const el = createInteractivePGNBoard(SIMPLE_PGN, BOARD_OPTS, 2, 'none', 320, false, HIGHLIGHT_ANN)
      const prev = el.querySelector<HTMLButtonElement>('button.chess-pgn-btn:nth-of-type(2)')!
      prev.click()
      expect(bgAnnotations(el).children.length).toBe(0)
    })
  })

  describe('move list panel', () => {
    it('renders .chess-move-list when showMoveList=true', () => {
      // Scenario: The optional move list panel is rendered when requested
      // Given: an interactive board created with showMoveList=true
      // When: the container is queried for the move list element
      // Then: an element with class chess-move-list is present
      const el = createInteractivePGNBoard(SIMPLE_PGN, BOARD_OPTS, 0, 'none', 320, true)
      const panel = el.querySelector('.chess-move-list')
      expect(panel).not.toBeNull()
    })

    it('move list has SAN buttons for each half-move', () => {
      // Scenario: The move list contains one clickable button per half-move in the game
      // Given: a PGN with 4 half-moves and showMoveList=true
      // When: the container is queried for data-ply buttons
      // Then: exactly 4 buttons are present
      const el = createInteractivePGNBoard(SIMPLE_PGN, BOARD_OPTS, 0, 'none', 320, true)
      const moveBtns = el.querySelectorAll('button[data-ply]')
      expect(moveBtns).toHaveLength(4)
    })

    it('clicking a move list button jumps to that ply', () => {
      // Scenario: Clicking a move list button navigates directly to the corresponding ply
      // Given: an interactive board at ply 0 with the move list visible
      // When: the button for ply 2 (1...e5) is clicked
      // Then: the move info text shows 'e5'
      const el = createInteractivePGNBoard(SIMPLE_PGN, BOARD_OPTS, 0, 'none', 320, true)
      const moveInfo = el.querySelector<HTMLElement>('.chess-pgn-move-info')
      const btn = el.querySelector<HTMLButtonElement>('button[data-ply="2"]')
      btn?.click()
      expect(moveInfo?.textContent).toContain('e5')
    })

    it('current move button gets chess-move-btn-current class', () => {
      // Scenario: The move list highlights the button corresponding to the current ply
      // Given: an interactive board initialised at ply 1
      // When: the button for ply 1 is inspected
      // Then: it carries the class chess-move-btn-current
      const el = createInteractivePGNBoard(SIMPLE_PGN, BOARD_OPTS, 1, 'none', 320, true)
      const currentBtn = el.querySelector<HTMLButtonElement>('button[data-ply="1"]')
      expect(currentBtn?.classList.contains('chess-move-btn-current')).toBe(true)
    })
  })
})
