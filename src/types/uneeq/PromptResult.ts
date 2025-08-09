export interface PromptResult {
  type: string;
  success: boolean;
  response: {
    text: string;
    metadata: any;
  };
  request: {
    requestId: string;
    prompt: string;
    metadata: any;
  };
}