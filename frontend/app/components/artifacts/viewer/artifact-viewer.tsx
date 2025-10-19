import { memo } from "react";
import type { Preset } from "../presets/types";
import { Presets } from "../presets/presets";
import HtmlViewer from "./html-viewer";
import BuilderViewer from "./builder-viewer";
import { EmptyState } from "./empty-state";

export interface ArtifactViewerProps {
  preset?: Preset;
  options?: Record<string, string | number | boolean>;
  files: Record<string, string>;
}

export const ArtifactViewer = memo(function ArtifactViewer(props: ArtifactViewerProps) {
  const preset = props.preset ?? Presets.autoDetect(props.files);
  
  const isEmptyOrWhitespace = () => {
    if (!props.files || Object.keys(props.files).length === 0) {
      return true;
    }
    
    return Object.values(props.files).every(content => 
      !content || content.trim().length === 0
    );
  };

  if (isEmptyOrWhitespace()) {
    return <EmptyState />;
  }

  return (
    <div
      style={{ width: "100%", height: "100%", boxSizing: "border-box" }}
      className="artifact_container"
    >
      {preset.kind === "html" && (
        <HtmlViewer
          preset={preset}
          options={props.options}
          files={props.files}
        />
      )}
      {preset.kind === "builder" && (
        <BuilderViewer
          preset={preset}
          options={props.options}
          files={props.files}
        />
      )}
    </div>
  );
});
