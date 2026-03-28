import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { AutoFocusPlugin } from "@lexical/react/LexicalAutoFocusPlugin";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import {
  LexicalComposerContext,
  createLexicalComposerContext,
} from "@lexical/react/LexicalComposerContext";
import {
  type LexicalEditor,
  createEditor,
  $getRoot,
  $createParagraphNode,
  $createTextNode,
} from "lexical";
import { useEffect, useMemo, useRef, type ReactNode } from "react";
import { Toolbar } from "./toolbar";
import { theme } from "./theme";

export type { LexicalEditor };

export function useEditor(): LexicalEditor {
  return useMemo(
    () => createEditor({ namespace: "notebook-editor", theme, onError: console.error }),
    [],
  );
}

export function readEditorContent(editor: LexicalEditor): string {
  let content = "";
  editor.getEditorState().read(() => {
    const text = $getRoot().getTextContent();
    if (text.trim()) {
      content = JSON.stringify(editor.getEditorState().toJSON());
    }
  });
  return content;
}

function EditorProvider({ editor, children }: { editor: LexicalEditor; children: ReactNode }) {
  const composerContext = useMemo(
    (): [LexicalEditor, { getTheme: () => typeof theme }] => [
      editor,
      createLexicalComposerContext(null, theme),
    ],
    [editor],
  );

  useEffect(() => {
    editor.setEditable(true);
  }, [editor]);

  return <LexicalComposerContext value={composerContext}>{children}</LexicalComposerContext>;
}

function InitPlugin({
  editor,
  initialContent,
}: {
  editor: LexicalEditor;
  initialContent?: string;
}) {
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    if (initialContent) {
      try {
        const parsed = JSON.parse(initialContent);
        const editorState = editor.parseEditorState(parsed);
        editor.setEditorState(editorState);
      } catch {
        // Fallback for legacy plain text content
        editor.update(() => {
          const root = $getRoot();
          root.clear();
          for (const line of initialContent.split("\n")) {
            const p = $createParagraphNode();
            if (line) {
              p.append($createTextNode(line));
            }
            root.append(p);
          }
        });
      }
    } else {
      editor.update(() => {
        const root = $getRoot();
        if (root.isEmpty()) root.append($createParagraphNode());
      });
    }
  }, [editor, initialContent]);

  return null;
}

export function Editor({
  editor,
  initialContent,
  onEmptyChange,
  placeholder = "What's on your mind?",
}: {
  editor: LexicalEditor;
  initialContent?: string;
  onEmptyChange?: (isEmpty: boolean) => void;
  placeholder?: string;
}) {
  useEffect(() => {
    const handler = () => editor.focus();
    window.addEventListener("editor:refocus", handler);
    return () => window.removeEventListener("editor:refocus", handler);
  }, [editor]);

  useEffect(() => {
    if (!onEmptyChange) return;
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        onEmptyChange(!$getRoot().getTextContent().trim());
      });
    });
  }, [editor, onEmptyChange]);

  return (
    <EditorProvider editor={editor}>
      <Toolbar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="relative flex-1 overflow-y-auto">
          <RichTextPlugin
            contentEditable={
              <ContentEditable className="scrollbar-hide h-full w-full resize-none p-2 text-base focus:outline-none" />
            }
            placeholder={
              <div className="pointer-events-none absolute left-2 top-2 text-base text-cloud-medium">
                {placeholder}
              </div>
            }
            ErrorBoundary={LexicalErrorBoundary}
          />
        </div>
      </div>
      <HistoryPlugin />
      <AutoFocusPlugin />
      <InitPlugin editor={editor} initialContent={initialContent} />
    </EditorProvider>
  );
}
