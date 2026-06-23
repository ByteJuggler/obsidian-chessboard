import { describe, it, expect } from 'vitest'
import { parsePGNBlock } from '../PGNOptions'
import { ANNOTATION_COLORS, ARROW_DEFAULT } from '../Annotations'

describe('parsePGNBlock', () => {
  it('strips the annotations: line from pgnSource', () => {
    // Scenario: The annotations: option line must not reach chess.js (which would throw on the colon)
    // Given: a PGN block source with an annotations: line before the moves
    // When: parsePGNBlock is called
    // Then: the returned pgnSource contains no line starting with "annotations:"
    const source = 'ply: 2\nannotations: Hc5/g\n1.e4 e5'
    const { pgnSource } = parsePGNBlock(source)
    expect(pgnSource).not.toContain('annotations:')
    expect(pgnSource).toContain('1.e4 e5')
  })

  it('returns parsed annotations from the annotations: line', () => {
    // Scenario: Annotation tokens on the annotations: line are parsed into Annotation objects
    // Given: a PGN block with "annotations: Ac7-c5/r Hc7/g"
    // When: parsePGNBlock is called
    // Then: the returned annotations array contains one arrow and one highlight
    const source = 'annotations: Ac7-c5/r Hc7/g\n1.e4 e5'
    const { annotations } = parsePGNBlock(source)
    expect(annotations).toHaveLength(2)
    expect(annotations[0]).toMatchObject({ type: 'arrow', start: 'c7', end: 'c5', color: ANNOTATION_COLORS.red })
    expect(annotations[1]).toMatchObject({ type: 'highlight', square: 'c7', color: ANNOTATION_COLORS.green })
  })

  it('accumulates annotations from multiple annotations: lines', () => {
    // Scenario: Multiple annotations: lines are all accumulated, matching FEN mode behaviour
    // Given: a PGN block with two separate annotations: lines
    // When: parsePGNBlock is called
    // Then: the returned annotations array contains all tokens from both lines
    const source = 'annotations: Hc5/g\nannotations: Ag7-g6\n1.e4 e5'
    const { annotations } = parsePGNBlock(source)
    expect(annotations).toHaveLength(2)
  })

  it('parses ply: correctly', () => {
    // Scenario: The ply: option is still parsed when an annotations: line is also present
    // Given: a PGN block with both ply: and annotations: lines
    // When: parsePGNBlock is called
    // Then: the returned ply equals the specified value
    const source = 'ply: 17\nannotations: Hc5/g\n1.e4 e5'
    const { ply } = parsePGNBlock(source)
    expect(ply).toBe(17)
  })

  it('parses show-move: correctly', () => {
    // Scenario: The show-move: option is still parsed when an annotations: line is also present
    // Given: a PGN block with show-move: arrow and an annotations: line
    // When: parsePGNBlock is called
    // Then: showMove equals 'arrow'
    const source = 'show-move: arrow\nannotations: Hc5/g\n1.e4 e5'
    const { showMove } = parsePGNBlock(source)
    expect(showMove).toBe('arrow')
  })

  it('parses orientation: correctly', () => {
    // Scenario: The orientation: option is still parsed when an annotations: line is also present
    // Given: a PGN block with orientation: black and an annotations: line
    // When: parsePGNBlock is called
    // Then: orientation equals 'black'
    const source = 'orientation: black\nannotations: Hc5/g\n1.e4 e5'
    const { orientation } = parsePGNBlock(source)
    expect(orientation).toBe('black')
  })

  it('returns empty annotations when no annotations: line is present', () => {
    // Scenario: A PGN block with no annotations: line returns an empty annotations array
    // Given: a PGN block with only ply: and moves
    // When: parsePGNBlock is called
    // Then: annotations is an empty array
    const source = 'ply: 2\n1.e4 e5'
    const { annotations } = parsePGNBlock(source)
    expect(annotations).toHaveLength(0)
  })
})
