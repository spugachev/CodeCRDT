import type * as Y from "yjs";
import type * as Monaco from "monaco-editor";
import { Editor } from "@monaco-editor/react";
import { useCallback, useState } from "react";
import { useHighlights } from "~/hooks/use-highlights";
import type { ConnectionState } from "~/hooks/use-collaboration";

export interface CodeEditorProps {
  connectionState: ConnectionState;
  setupBinding: (editor: Monaco.editor.IStandaloneCodeEditor) => void;
  yText: Y.Text | null;
}

export default function CodeEditor(props: CodeEditorProps) {
  const { connectionState, setupBinding, yText } = props;
  const [editor, setEditor] =
    useState<Monaco.editor.IStandaloneCodeEditor | null>(null);

  useHighlights(editor, yText);

  const handleEditorWillMount = (monaco: typeof import("monaco-editor")) => {
    monaco.languages.typescript.typescriptDefaults.setEagerModelSync(true);
    monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
      jsx: monaco.languages.typescript.JsxEmit.ReactJSX,
      target: monaco.languages.typescript.ScriptTarget.Latest,
      module: monaco.languages.typescript.ModuleKind.ESNext,
      moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
      allowSyntheticDefaultImports: true,
      esModuleInterop: true,
      strict: true,
      noImplicitAny: false,
      skipLibCheck: true,
      forceConsistentCasingInFileNames: true,
      resolveJsonModule: true,
      allowJs: true,
      checkJs: false,
      typeRoots: ["node_modules/@types"],
    });

    monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
      noSemanticValidation: false,
      noSyntaxValidation: false,
      diagnosticCodesToIgnore: [
        2614, // No exported member
        2307, // Cannot find module
        2305, // Module has no exported member
        2694, // Namespace has no exported member
      ],
    });

    // Minimal React + JSX types to suppress missing module/type errors in Monaco
    const reactDts = `
declare namespace JSX {
  interface IntrinsicElements { [elemName: string]: any }
  interface Element {}
  interface IntrinsicAttributes { key?: any }
}
declare namespace React {
  type ReactNode = any;
  interface FC<P = {}> { (props: P & { children?: ReactNode }): any }
}
declare module 'react' {
  const React: any;
  export = React;
  export as namespace React;
}
declare module 'react/jsx-runtime' {
  export const jsx: any;
  export const jsxs: any;
  export const Fragment: any;
}
`;
    monaco.languages.typescript.typescriptDefaults.addExtraLib(
      reactDts,
      "file:///types/react/index.d.ts"
    );

    const uiAliasesDts = `
declare module "@/components/ui/*" {
  const mod: any;
  export default mod;
}
`;

    const atAnyDts = `declare module "@/*" { const mod: any; export default mod; }`;
    monaco.languages.typescript.typescriptDefaults.addExtraLib(
      atAnyDts,
      "file:///types/at-any.d.ts"
    );
  };

  const handleEditorDidMount = useCallback(
    (editorInstance: Monaco.editor.IStandaloneCodeEditor) => {
      setEditor(editorInstance);
      if (connectionState.status !== "error") {
        try {
          setupBinding(editorInstance);
        } catch (error) {
          console.error("Failed to setup binding:", error);
        }
      }
    },
    [connectionState, setupBinding]
  );

  return (
    <Editor
      width="100%"
      height="100%"
      language="typescript"
      path="file:///index.tsx"
      theme="vs-light"
      beforeMount={handleEditorWillMount}
      onMount={handleEditorDidMount}
      options={{
        fontSize: 16,
        fontFamily: "JetBrains Mono, Consolas, Monaco, monospace",
        lineHeight: 24,
        minimap: { enabled: true },
        wordWrap: "off",
        folding: true,
        lineNumbers: "on",
        glyphMargin: true,
        foldingHighlight: true,
        selectOnLineNumbers: true,
        roundedSelection: false,
        readOnly: false,
        cursorStyle: "line",
        contextmenu: true,
        mouseWheelZoom: true,
        smoothScrolling: true,
        scrollBeyondLastLine: false,
        automaticLayout: true,
        tabSize: 2,
        insertSpaces: true,
        detectIndentation: true,
        trimAutoWhitespace: true,
        largeFileOptimizations: true,
        suggestOnTriggerCharacters: true,
        acceptSuggestionOnCommitCharacter: true,
        snippetSuggestions: "top",
        parameterHints: {
          enabled: true,
          cycle: true,
        },
        hover: {
          enabled: true,
          delay: 300,
        },
        links: true,
        colorDecorators: true,
      }}
    />
  );
}
