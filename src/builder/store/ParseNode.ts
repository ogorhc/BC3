import { ConceptInput } from '../../parsing/dispatch/parsers/types/Parsers';

/**
 * ParseNode represents a node in the parsing store hierarchy.
 * It's an intermediate representation before building the domain model.
 */
export interface ParseNode {
  /** The concept code (normalized, without #/## prefixes) */
  code: string;
  /** The raw concept input from parsing */
  concept: ConceptInput;
  /** Parent code (if this node is a child) */
  parentCode: string | null;
  /** Child codes (from decompositions) */
  childCodes: string[];
  /** Text associated with this concept */
  text?: string;
}
