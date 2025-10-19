import { useState, useCallback, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import type { Route } from "./+types/code.$id";
import { cn } from "~/lib/utils";
import { useCollaboration } from "~/hooks/use-collaboration";
import Header from "./header";
import PromptInput from "./prompt-input";
import CodeEditor from "./code-editor";
import Preview from "./preview";
import HistorySheet from "./history-sheet";
import CodeQualityDialog from "~/components/code-quality-dialog";

export function meta({ params }: Route.MetaArgs) {
  return [
    { title: `CodeCRDT - ${params.id}` },
    { name: "description", content: "A platform for collaborative agents." },
  ];
}

export default function Code() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tab, setTab] = useState("code");
  const [code, setCode] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [codeQualityOpen, setCodeQualityOpen] = useState(false);
  const { connectionState, setupBinding, yText } = useCollaboration(id);

  const onTabChange = (newTab: string) => {
    setTab(newTab);

    if (newTab === "preview" && yText) {
      setCode(yText.toString());
    }
  };

  const handleRefresh = useCallback(() => {
    if (yText) {
      setCode(yText.toString());
    }

    setRefreshKey((prev) => prev + 1);
  }, [yText]);

  const handleHistory = () => {
    setHistoryOpen(true);
  };

  const handleNew = () => {
    const newRoomId = crypto.randomUUID();
    navigate(`/code/${newRoomId}`);
  };

  const handleSelectRoom = (roomId: string) => {
    navigate(`/code/${roomId}`);
  };

  const handleCodeQuality = () => {
    if (yText) {
      setCode(yText.toString());
    }
    setCodeQualityOpen(true);
  };

  useEffect(() => {
    setCode("");
    setRefreshKey(0);
    setTab("code");
  }, [id]);

  if (!id) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-gray-500">Room ID is required</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col">
      <Header
        value={tab}
        onValueChange={onTabChange}
        onRefresh={handleRefresh}
        onHistory={handleHistory}
        onNew={handleNew}
        onCodeQuality={handleCodeQuality}
      />
      <main id="main-content" className="flex-1 min-h-0 min-w-0">
        <div className={cn(tab == "code" ? "block" : "hidden", "h-full")}>
          <CodeEditor
            key={id}
            connectionState={connectionState}
            setupBinding={setupBinding}
            yText={yText}
          />
        </div>
        <div className={cn(tab == "preview" ? "block" : "hidden", "h-full")}>
          <Preview key={`${id}-${refreshKey}`} code={code} />
        </div>
      </main>
      {tab === "code" && (
        <PromptInput roomId={id} connectionState={connectionState} />
      )}
      <HistorySheet
        open={historyOpen}
        onOpenChange={setHistoryOpen}
        onSelectRoom={handleSelectRoom}
        currentRoomId={id}
      />
      <CodeQualityDialog
        open={codeQualityOpen}
        onOpenChange={setCodeQualityOpen}
        code={code}
      />
    </div>
  );
}
