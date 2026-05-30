import { describe, it, expect } from 'vitest'
import {
  parseCodeBlock,
  ANNOTATION_COLORS,
  HIGHLIGHT_DEFAULT,
  ARROW_DEFAULT,
  SHAPE_DEFAULT,
} from '../Annotations'

const STARTING_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR'

describe('parseCodeBlock', () => {
  it('parses bare FEN with no annotations', () => {
    // Scenario: A code block containing only a FEN string produces default parsed output
    // Given: a code block with a FEN string and no annotation lines
    // When: parseCodeBlock is called
    // Then: fen is set, annotations is empty, orientation defaults to 'white', strict defaults to true
    const result = parseCodeBlock(STARTING_FEN)
    expect(result.fen).toBe(STARTING_FEN)
    expect(result.annotations).toHaveLength(0)
    expect(result.orientation).toBe('white')
    expect(result.strict).toBe(true)
  })

  it('parses fen: prefix', () => {
    // Scenario: FEN lines may carry a "fen: " prefix for authoring readability
    // Given: a code block whose FEN line starts with "fen: "
    // When: parseCodeBlock is called
    // Then: the prefix is stripped and the raw FEN string is returned
    const result = parseCodeBlock(`fen: ${STARTING_FEN}`)
    expect(result.fen).toBe(STARTING_FEN)
  })

  it('parses orientation: black', () => {
    // Scenario: Authors can flip the board to show from Black's perspective
    // Given: a code block with "orientation: black"
    // When: parseCodeBlock is called
    // Then: orientation is 'black'
    const result = parseCodeBlock(`${STARTING_FEN}\norientation: black`)
    expect(result.orientation).toBe('black')
  })

  it('parses strict: false', () => {
    // Scenario: Non-standard or illegal positions require strict validation to be disabled
    // Given: a code block with "strict: false"
    // When: parseCodeBlock is called
    // Then: the strict flag is false
    const result = parseCodeBlock(`${STARTING_FEN}\nstrict: false`)
    expect(result.strict).toBe(false)
  })

  describe('arrow annotations', () => {
    it('parses arrow with default color', () => {
      // Scenario: An arrow token with no color modifier uses the default arrow color
      // Given: annotation token "Ae2-e4" with no color suffix
      // When: parseCodeBlock is called
      // Then: one arrow annotation is produced with correct squares and the default arrow color
      const result = parseCodeBlock(`${STARTING_FEN}\nannotations: Ae2-e4`)
      expect(result.annotations).toHaveLength(1)
      const ann = result.annotations[0]
      expect(ann.type).toBe('arrow')
      if (ann.type === 'arrow') {
        expect(ann.start).toBe('e2')
        expect(ann.end).toBe('e4')
        expect(ann.color).toBe(ARROW_DEFAULT)
      }
    })

    it('parses arrow /r color', () => {
      // Scenario: The /r suffix overrides the arrow color to red
      // Given: annotation token "Ae2-e4/r"
      // When: parseCodeBlock is called
      // Then: the arrow annotation color is red
      const result = parseCodeBlock(`${STARTING_FEN}\nannotations: Ae2-e4/r`)
      const ann = result.annotations[0]
      if (ann.type === 'arrow') expect(ann.color).toBe(ANNOTATION_COLORS.red)
    })

    it('parses arrow /g color', () => {
      // Scenario: The /g suffix overrides the arrow color to green
      // Given: annotation token "Ae2-e4/g"
      // When: parseCodeBlock is called
      // Then: the arrow annotation color is green
      const result = parseCodeBlock(`${STARTING_FEN}\nannotations: Ae2-e4/g`)
      const ann = result.annotations[0]
      if (ann.type === 'arrow') expect(ann.color).toBe(ANNOTATION_COLORS.green)
    })

    it('parses arrow /b color', () => {
      // Scenario: The /b suffix overrides the arrow color to blue
      // Given: annotation token "Ae2-e4/b"
      // When: parseCodeBlock is called
      // Then: the arrow annotation color is blue
      const result = parseCodeBlock(`${STARTING_FEN}\nannotations: Ae2-e4/b`)
      const ann = result.annotations[0]
      if (ann.type === 'arrow') expect(ann.color).toBe(ANNOTATION_COLORS.blue)
    })
  })

  describe('highlight annotations', () => {
    it('parses highlight with default color', () => {
      // Scenario: A highlight token with no color modifier uses the default highlight color
      // Given: annotation token "He4" with no color suffix
      // When: parseCodeBlock is called
      // Then: one highlight annotation is produced on e4 with the default highlight color
      const result = parseCodeBlock(`${STARTING_FEN}\nannotations: He4`)
      expect(result.annotations).toHaveLength(1)
      const ann = result.annotations[0]
      expect(ann.type).toBe('highlight')
      if (ann.type === 'highlight') {
        expect(ann.square).toBe('e4')
        expect(ann.color).toBe(HIGHLIGHT_DEFAULT)
      }
    })

    it('parses highlight /y color', () => {
      // Scenario: The /y suffix overrides the highlight color to yellow
      // Given: annotation token "He4/y"
      // When: parseCodeBlock is called
      // Then: the highlight annotation color is yellow
      const result = parseCodeBlock(`${STARTING_FEN}\nannotations: He4/y`)
      const ann = result.annotations[0]
      if (ann.type === 'highlight') expect(ann.color).toBe(ANNOTATION_COLORS.yellow)
    })

    it('parses highlight /g color', () => {
      // Scenario: The /g suffix overrides the highlight color to green
      // Given: annotation token "He4/g"
      // When: parseCodeBlock is called
      // Then: the highlight annotation color is green
      const result = parseCodeBlock(`${STARTING_FEN}\nannotations: He4/g`)
      const ann = result.annotations[0]
      if (ann.type === 'highlight') expect(ann.color).toBe(ANNOTATION_COLORS.green)
    })
  })

  describe('icon annotations', () => {
    const cases: [string, string, string][] = [
      ['!!e4', 'e4', 'brilliant'],
      ['!?e4', 'e4', 'good'],
      ['!e4', 'e4', 'excellent'],
      ['??e4', 'e4', 'blunder'],
      ['?e4', 'e4', 'mistake'],
      ['Fe4', 'e4', 'forced'],
    ]

    for (const [token, square, icon] of cases) {
      it(`parses ${token}`, () => {
        // Scenario: Move-quality token "${token}" maps to the "${icon}" icon on square ${square}
        // Given: annotation token "${token}"
        // When: parseCodeBlock is called
        // Then: one icon annotation is produced with type "${icon}" on square "${square}"
        const result = parseCodeBlock(`${STARTING_FEN}\nannotations: ${token}`)
        expect(result.annotations).toHaveLength(1)
        const ann = result.annotations[0]
        expect(ann.type).toBe('icon')
        if (ann.type === 'icon') {
          expect(ann.square).toBe(square)
          expect(ann.icon).toBe(icon)
        }
      })
    }
  })

  describe('shape annotations', () => {
    it('parses C (circle)', () => {
      // Scenario: The C prefix produces a circle shape annotation
      // Given: annotation token "Ce4"
      // When: parseCodeBlock is called
      // Then: a shape annotation of type 'circle' on square e4 is produced
      const result = parseCodeBlock(`${STARTING_FEN}\nannotations: Ce4`)
      const ann = result.annotations[0]
      expect(ann.type).toBe('shape')
      if (ann.type === 'shape') {
        expect(ann.shape).toBe('circle')
        expect(ann.square).toBe('e4')
      }
    })

    it('parses S (square)', () => {
      // Scenario: The S prefix produces a square shape annotation
      // Given: annotation token "Se4"
      // When: parseCodeBlock is called
      // Then: a shape annotation of type 'square' is produced
      const result = parseCodeBlock(`${STARTING_FEN}\nannotations: Se4`)
      const ann = result.annotations[0]
      if (ann.type === 'shape') expect(ann.shape).toBe('square')
    })

    it('parses Q (squircle)', () => {
      // Scenario: The Q prefix produces a squircle shape annotation
      // Given: annotation token "Qe4"
      // When: parseCodeBlock is called
      // Then: a shape annotation of type 'squircle' is produced
      const result = parseCodeBlock(`${STARTING_FEN}\nannotations: Qe4`)
      const ann = result.annotations[0]
      if (ann.type === 'shape') expect(ann.shape).toBe('squircle')
    })

    it('parses shape with /r color', () => {
      // Scenario: The /r suffix overrides the shape color to red
      // Given: annotation token "Ce4/r"
      // When: parseCodeBlock is called
      // Then: the shape annotation color is red
      const result = parseCodeBlock(`${STARTING_FEN}\nannotations: Ce4/r`)
      const ann = result.annotations[0]
      if (ann.type === 'shape') expect(ann.color).toBe(ANNOTATION_COLORS.red)
    })

    it('parses shape with default color', () => {
      // Scenario: A shape token with no color modifier uses the default shape color
      // Given: annotation token "Ce4" with no color suffix
      // When: parseCodeBlock is called
      // Then: the shape annotation uses the default shape color
      const result = parseCodeBlock(`${STARTING_FEN}\nannotations: Ce4`)
      const ann = result.annotations[0]
      if (ann.type === 'shape') expect(ann.color).toBe(SHAPE_DEFAULT)
    })
  })

  it('parses multiple annotations across multiple lines', () => {
    // Scenario: Multiple annotation lines accumulate into a single annotations array
    // Given: a code block with two separate "annotations:" lines containing three tokens
    // When: parseCodeBlock is called
    // Then: all three annotations are present in the result
    const input = `${STARTING_FEN}\nannotations: He4 Hd4\nannotations: Ae2-e4`
    const result = parseCodeBlock(input)
    expect(result.annotations).toHaveLength(3)
  })
})
