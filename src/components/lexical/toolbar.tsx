import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { FORMAT_TEXT_COMMAND, type TextFormatType } from "lexical";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { $getSelection, $isRangeSelection } from "lexical";
import { cx } from "cva";
import { motion } from "motion/react";

const BOLD = 1;
const ITALIC = 2;
const STRIKETHROUGH = 4;

export function Toolbar() {
  const [editor] = useLexicalComposerContext();
  const [formats, setFormats] = useState(0);
  const formatsRef = useRef(formats);
  formatsRef.current = formats;

  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        const selection = $getSelection();
        let next = 0;
        if ($isRangeSelection(selection)) {
          if (selection.hasFormat("bold")) next |= BOLD;
          if (selection.hasFormat("italic")) next |= ITALIC;
          if (selection.hasFormat("strikethrough")) next |= STRIKETHROUGH;
        }
        if (next !== formatsRef.current) setFormats(next);
      });
    });
  }, [editor]);

  function handleFormat(format: TextFormatType) {
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, format);
  }

  return createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed left-2 z-50 flex items-center gap-1 border rounded-lg bg-slate-medium px-2 py-1"
      style={{ bottom: "calc(max(var(--keyboard-height), env(safe-area-inset-bottom, 0px)) + var(--spacing)*3)" }}
      onMouseDown={(e) => e.preventDefault()}
    >
      <FormatButton active={!!(formats & BOLD)} onClick={() => handleFormat("bold")}>
        <strong>B</strong>
      </FormatButton>
      <FormatButton active={!!(formats & ITALIC)} onClick={() => handleFormat("italic")}>
        <em>I</em>
      </FormatButton>
      <FormatButton
        active={!!(formats & STRIKETHROUGH)}
        onClick={() => handleFormat("strikethrough")}
      >
        <del>S</del>
      </FormatButton>
    </motion.div>,
    document.body,
  );
}

function FormatButton({
  children,
  active,
  onClick,
}: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cx(
        "flex size-8 items-center justify-center rounded-md transition-colors",
        active ? "bg-slate-light text-ivory-light" : "text-cloud-medium hover:text-ivory-light",
      )}
    >
      {children}
    </button>
  );
}
