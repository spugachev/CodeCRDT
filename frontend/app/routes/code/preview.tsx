import { memo } from "react";
import { ArtifactViewer } from "~/components/artifacts";

export interface PreviewProps {
  code: string;
}

const Preview = memo(function Preview(props: PreviewProps) {
  const files = {
    "/app.tsx": props.code,
  };

  return <ArtifactViewer files={files} />;
});

export default Preview;
