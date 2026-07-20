export interface Attachment {
  id: number;
  fileName: string;
  contentType: string;
  sizeBytes: number;
  /** ISO instant string. */
  createdAt: string;
}
