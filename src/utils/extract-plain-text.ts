import { $getRoot, createEditor } from "lexical";

export function extractPlainText(content: string): string {
  try {
    const editor = createEditor({ namespace: "search-meta", onError: () => {} });
    const state = editor.parseEditorState(JSON.parse(content));
    let text = "";
    state.read(() => {
      text = $getRoot().getTextContent();
    });
    return text;
  } catch {
    return content;
  }
}
