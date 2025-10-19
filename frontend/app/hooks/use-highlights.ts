import { useEffect, useRef, useState } from "react";
import * as Monaco from "monaco-editor";
import type * as Y from "yjs";

export const SLOT_ATTR = "x-slot";

const COLOR_CLASS_BASE = "yjs-slot-highlight";
const COLOR_MAX_INDEX = 24;

export function useHighlights(
  editor: Monaco.editor.IStandaloneCodeEditor | null,
  yText: Y.Text | null,
) {
  const [ids, setIds] = useState<Map<string, number>>(new Map());
  const decoRef = useRef<Monaco.editor.IEditorDecorationsCollection | null>(
    null,
  );

  useEffect(() => {
    if (!editor || !yText) return;
    setIds(new Map());

    const model = editor.getModel();
    if (!model) return;

    if (!decoRef.current) {
      decoRef.current = editor.createDecorationsCollection([]);
    }

    const recompute = () => {
      if (!decoRef.current) return;

      const delta = yText.toDelta();

      const decos: Monaco.editor.IModelDeltaDecoration[] = [];
      let offset = 0;

      for (const op of delta) {
        const text = typeof op.insert === "string" ? op.insert : "";
        const len = text.length;

        if (len > 0) {
          const slotOwner = op.attributes?.[SLOT_ATTR] as
            | string
            | null
            | undefined;

          if (slotOwner != null) {
            const start = model.getPositionAt(offset);
            const end = model.getPositionAt(offset + len);

            let idx = ids.get(slotOwner);
            if (idx === undefined) {
              idx = ids.size % COLOR_MAX_INDEX;
              ids.set(slotOwner, idx);
            }
            const cls = `${COLOR_CLASS_BASE}-${idx}`;

            decos.push({
              range: new Monaco.Range(
                start.lineNumber,
                start.column,
                end.lineNumber,
                end.column,
              ),
              options: {
                inlineClassName: cls,
                inlineClassNameAffectsLetterSpacing: true,
                stickiness:
                  Monaco.editor.TrackedRangeStickiness
                    .NeverGrowsWhenTypingAtEdges,
              },
            });
          }
        }

        offset += len;
      }

      decoRef.current.set(decos);
    };

    recompute();

    const onY = () => recompute();
    yText.observe(onY);

    const subContent = model.onDidChangeContent(recompute);
    const subModel = editor.onDidChangeModel(recompute);

    return () => {
      yText.unobserve(onY);
      subContent.dispose();
      subModel.dispose();
      decoRef.current?.clear();
    };
  }, [editor, yText]);
}
