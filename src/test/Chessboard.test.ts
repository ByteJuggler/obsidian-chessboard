import { describe, it, expect } from 'vitest'
import { Chessboard } from '../chessboardsvg/Chessboard'

const STARTING_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'

describe('Chessboard.algebraicToCoord', () => {
  it('converts a1 to [0, 7]', () => {
    // Scenario: a1 (bottom-left corner) maps to grid origin column 0, row 7
    // Given: square name 'a1'
    // When: algebraicToCoord is called
    // Then: returns [0, 7] — column 0, row 7 (grid origin is top-left)
    expect(Chessboard.algebraicToCoord('a1')).toEqual([0, 7])
  })

  it('converts h8 to [7, 0]', () => {
    // Scenario: h8 (top-right corner) maps to column 7, row 0
    // Given: square name 'h8'
    // When: algebraicToCoord is called
    // Then: returns [7, 0]
    expect(Chessboard.algebraicToCoord('h8')).toEqual([7, 0])
  })

  it('converts e4 correctly', () => {
    // Scenario: A mid-board square maps to the expected column and row
    // Given: square name 'e4'
    // When: algebraicToCoord is called
    // Then: returns [4, 4]
    expect(Chessboard.algebraicToCoord('e4')).toEqual([4, 4])
  })
})

describe('Chessboard.coordToAlgebraic', () => {
  it('converts [0, 7] to a1', () => {
    // Scenario: Grid coordinate [0, 7] round-trips back to algebraic 'a1'
    // Given: coordinate [0, 7]
    // When: coordToAlgebraic is called
    // Then: returns 'a1'
    expect(Chessboard.coordToAlgebraic([0, 7])).toBe('a1')
  })

  it('converts [7, 0] to h8', () => {
    // Scenario: Grid coordinate [7, 0] round-trips back to algebraic 'h8'
    // Given: coordinate [7, 0]
    // When: coordToAlgebraic is called
    // Then: returns 'h8'
    expect(Chessboard.coordToAlgebraic([7, 0])).toBe('h8')
  })

  it('round-trips all 64 squares', () => {
    // Scenario: algebraicToCoord and coordToAlgebraic are exact inverses for every square
    // Given: all 64 grid coordinates [c, r] where c and r are 0–7
    // When: coordToAlgebraic then algebraicToCoord is applied
    // Then: the original coordinate is recovered for every square
    for (let c = 0; c < 8; c++) {
      for (let r = 0; r < 8; r++) {
        const algebraic = Chessboard.coordToAlgebraic([c, r])
        expect(Chessboard.algebraicToCoord(algebraic)).toEqual([c, r])
      }
    }
  })
})

describe('Chessboard.fromFEN', () => {
  it('loads starting position', () => {
    // Scenario: Loading the standard starting FEN places pieces on correct squares
    // Given: the standard starting FEN string
    // When: fromFEN is called
    // Then: the white king is present at e1 ([4, 7])
    const board = Chessboard.fromFEN(STARTING_FEN)
    const piece = board.get(4, 7)
    expect(piece).toBeDefined()
    expect(piece?.type).toBe('k')
    expect(piece?.color).toBe('w')
  })

  it('loads FEN without move color (tolerant format)', () => {
    // Scenario: FEN strings without the move-color and castling fields are accepted
    // Given: a FEN string containing only the piece placement field
    // When: fromFEN is called
    // Then: the board is populated correctly (white king at e1)
    const board = Chessboard.fromFEN('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR')
    const piece = board.get(4, 7)
    expect(piece?.type).toBe('k')
  })

  it('accepts non-standard positions with skipValidation', () => {
    // Scenario: Illegal positions (e.g. for puzzles or diagrams) load without throwing
    // Given: a FEN with eight white kings on the first rank (illegal but intentional)
    // When: fromFEN is called with skipValidation=true
    // Then: the position loads and pieces are accessible
    const board = Chessboard.fromFEN('8/8/8/8/8/8/8/KKKKKKKK', true)
    expect(board.get(0, 7)?.type).toBe('k')
  })

  it('has no piece on empty square', () => {
    // Scenario: Squares not occupied in the FEN return undefined
    // Given: the standard starting position where e4 is empty
    // When: get(4, 4) is called for square e4
    // Then: undefined is returned
    const board = Chessboard.fromFEN(STARTING_FEN)
    expect(board.get(4, 4)).toBeUndefined()
  })

  it('throws on a malformed FEN string when skipValidation is false', () => {
    // Scenario: Garbage input is rejected immediately in strict mode
    // Given: a string that is not a valid FEN
    // When: fromFEN is called with the default skipValidation=false
    // Then: chess.js throws an error
    expect(() => Chessboard.fromFEN('not-a-valid-fen')).toThrow()
  })

  it('throws on an illegal position when skipValidation is false', () => {
    // Scenario: Structurally parseable but illegal positions are rejected in strict mode
    // Given: a FEN with eight white kings on the back rank (no black king — illegal)
    // When: fromFEN is called with the default skipValidation=false
    // Then: chess.js throws an error; pass skipValidation=true to load such positions
    expect(() => Chessboard.fromFEN('8/8/8/8/8/8/8/KKKKKKKK')).toThrow()
  })
})

describe('Chessboard.fromPGN', () => {
  const PGN = '1.e4 e5 2.Nf3 Nc6'

  it('loads to end of game by default (lastMove not tracked without ply)', () => {
    // Scenario: Loading a PGN without a ply argument replays all moves but does not track lastMove
    // Given: a PGN string loaded without specifying a ply
    // When: getLastMove() is called
    // Then: undefined is returned because ply-navigation tracking was not activated
    const board = Chessboard.fromPGN(PGN)
    expect(board.getLastMove()).toBeUndefined()
  })

  it('ply: 0 returns starting position', () => {
    // Scenario: Requesting ply 0 produces an unmodified starting position
    // Given: a PGN loaded with ply=0
    // When: the board state is inspected
    // Then: the e2 pawn is still on e2 and no last move is recorded
    const board = Chessboard.fromPGN(PGN, 0)
    expect(board.get(4, 6)?.type).toBe('p')
    expect(board.getLastMove()).toBeUndefined()
  })

  it('ply: 1 plays 1.e4', () => {
    // Scenario: Requesting ply 1 replays the first half-move (1.e4)
    // Given: a PGN loaded with ply=1
    // When: the board state and last move are inspected
    // Then: the e2 pawn has moved to e4 and lastMove.san is 'e4'
    const board = Chessboard.fromPGN(PGN, 1)
    const lastMove = board.getLastMove()
    expect(lastMove?.san).toBe('e4')
    expect(board.get(4, 6)).toBeUndefined()
    expect(board.get(4, 4)?.type).toBe('p')
  })

  it('clamps to last move when ply exceeds game length', () => {
    // Scenario: A ply beyond the end of the game renders the final position
    // Given: a PGN with 4 half-moves and a requested ply of 999
    // When: fromPGN is called
    // Then: the board reflects the position after the last move (Nc6 on c6)
    const board = Chessboard.fromPGN(PGN, 999)
    expect(board.getLastMove()?.san).toBe('Nc6')
  })
})
