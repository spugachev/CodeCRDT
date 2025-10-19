import { useEffect, useState, useRef, memo } from "react";
import { Builder } from "../builder/builder";
import type { BuilderPreset } from "../presets/types";
import { BuilderCache } from "../builder/builder-cache";

export interface BuilderViewerProps {
  files: Record<string, string>;
  options?: Record<string, string | number | boolean>;
  preset: BuilderPreset;
}

const BuilderViewer = memo(function BuilderViewer(props: BuilderViewerProps) {
  const cacheRef = useRef<BuilderCache | null>(null);
  if (!cacheRef.current) {
    cacheRef.current = new BuilderCache();
  }

  const [errors, setErrors] = useState<string[]>([]);
  const [progress, setProgress] = useState<number>(0);
  const [html, setHtml] = useState<string | undefined>(undefined);
  const [htmlHash, setHtmlHash] = useState<string>("");
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    const currentAbortController = abortControllerRef.current;

    (async () => {
      try {
        setHtml(undefined);
        setErrors([]);
        setProgress(0);

        const session = await Builder.createSession({
          cache: cacheRef.current!,
          preset: props.preset,
          options: props.options,
          files: props.files,
          progress: setProgress,
        });

        if (currentAbortController.signal.aborted) return;

        const { errors } = await session.build();

        if (currentAbortController.signal.aborted) return;

        const { html, hash } = await session.generateHtml();

        if (currentAbortController.signal.aborted) return;

        setErrors(errors);
        setHtml(html);
        setHtmlHash(hash);
      } catch (error) {
        if (!currentAbortController.signal.aborted) {
          console.error("Build error:", error);
          setErrors([error instanceof Error ? error.message : "Build failed"]);
        }
      }
    })();

    return () => {
      currentAbortController.abort();
    };
  }, [props.files, props.options, props.preset]);

  if (errors.length > 0) {
    return (
      <div className="flex flex-col justify-center items-center w-full h-full gap-4 p-8">
        <div className="flex flex-col items-center gap-3">
          <div className="p-3 rounded-full bg-destructive/10 border border-destructive/20">
            <svg
              className="w-6 h-6 text-destructive"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-foreground">Build Error</h3>
        </div>
        <div className="max-w-md space-y-2">
          {errors.map((error, index) => (
            <div
              key={index}
              className="px-4 py-2 rounded-lg bg-destructive/5 border border-destructive/10 text-sm text-destructive/90"
            >
              {error}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      {!html ? (
        <div className="flex flex-col justify-center items-center w-full h-full gap-4 p-8">
          <div className="relative">
            <div className="text-4xl font-mono text-foreground/80 animate-pulse">
              &lt;loading /&gt;
            </div>
            <div className="absolute -inset-2 bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 blur-xl animate-pulse" />
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="text-sm text-muted-foreground font-medium">
              Processed {progress} {progress === 1 ? "file" : "files"}
            </div>
          </div>
        </div>
      ) : (
        <iframe
          key={htmlHash}
          style={{
            width: "100%",
            height: "100%",
            border: "none",
            margin: 0,
            padding: 0,
          }}
          sandbox="allow-scripts allow-modals allow-forms allow-modals allow-popups"
          srcDoc={html}
        />
      )}
    </>
  );
});

export default BuilderViewer;
