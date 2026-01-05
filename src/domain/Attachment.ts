/**
 * AttachmentType represents the type of attachment.
 */
export type AttachmentType = 'document' | 'graphic' | 'bim' | 'other';

/**
 * Attachment represents external resources linked to concepts.
 *
 * It references documents, graphics, or BIM files and can resolve URLs using base paths.
 */
export class Attachment {
  /** Concept code this attachment belongs to (normalized) */
  readonly conceptCode: string;
  /** Attachment type */
  readonly type: AttachmentType;
  /** URL or file reference */
  readonly url: string;
  /** Resolved full URL (using baseUrl from metadata) */
  readonly resolvedUrl?: string;
  /** Optional metadata */
  readonly metadata?: Record<string, string>;

  constructor(args: {
    conceptCode: string;
    type: AttachmentType;
    url: string;
    resolvedUrl?: string;
    metadata?: Record<string, string>;
  }) {
    this.conceptCode = args.conceptCode;
    this.type = args.type;
    this.url = args.url;
    this.resolvedUrl = args.resolvedUrl;
    this.metadata = args.metadata;
  }
}
