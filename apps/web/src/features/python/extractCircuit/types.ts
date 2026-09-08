import type { Circuit } from "../../../content/schema";

export interface ExtractIssue {
  message: string;
  line?: number;
}

export interface ExtractResult {
  circuit: Circuit | null;
  issues: ExtractIssue[];
}
