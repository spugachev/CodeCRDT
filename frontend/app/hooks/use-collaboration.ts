import * as Y from "yjs";
import { useCallback, useEffect, useRef, useState } from "react";
import { MonacoBinding } from "y-monaco";
import { HocuspocusProvider } from "@hocuspocus/provider";
import type * as Monaco from "monaco-editor";
import type { Awareness } from "y-protocols/awareness";
import { isBrowser } from "~/api";

const TEXT_ID = "index";
const API_URL = import.meta.env.VITE_API_URL;

interface UseCollaborationReturn {
  connectionState: ConnectionState;
  setupBinding: (editor: Monaco.editor.IStandaloneCodeEditor) => void;
  yText: Y.Text | null;
  awareness: Awareness | null;
}

export interface ConnectionState {
  status: ConnectionStatus;
  isSynced: boolean;
  users: number;
}

export type ConnectionStatus =
  | "connecting"
  | "connected"
  | "disconnected"
  | "error"
  | "reconnecting";

export function useCollaboration(roomId?: string): UseCollaborationReturn {
  const [connectionState, setConnectionState] = useState<ConnectionState>({
    status: "connecting",
    isSynced: false,
    users: 0,
  });
  const [yText, setYText] = useState<Y.Text | null>(null);
  const [awareness, setAwareness] = useState<Awareness | null>(null);

  const docRef = useRef<Y.Doc | null>(null);
  const providerRef = useRef<HocuspocusProvider | null>(null);
  const bindingRef = useRef<MonacoBinding | null>(null);
  const isInitializedRef = useRef(false);

  const cleanup = useCallback(() => {
    if (bindingRef.current) {
      bindingRef.current.destroy();
      bindingRef.current = null;
    }

    if (providerRef.current) {
      try {
        providerRef.current.disconnect();
      } catch {}
      try {
        providerRef.current.destroy();
      } catch {}
      providerRef.current = null;
    }

    if (docRef.current) {
      docRef.current.destroy();
      docRef.current = null;
    }

    setYText(null);
    setAwareness(null);
    setConnectionState((prev) => ({
      ...prev,
      status: "disconnected",
      users: 0,
    }));
  }, []);

  const connect = useCallback(
    (roomId: string) => {
      cleanup();

      setConnectionState((prev) => ({ ...prev, status: "connecting" }));

      const doc = new Y.Doc();
      docRef.current = doc;

      const origin = API_URL
        ? API_URL.replace(/^http(s?)/, "ws$1")
        : isBrowser
          ? window.location.origin.replace(/^http(s?)/, "ws$1")
          : "ws://localhost:3001";

      const provider = new HocuspocusProvider({
        url: `${origin}/crdt`,
        name: roomId,
        document: doc,
      });

      const userId = crypto.randomUUID();
      const randomColor = `#${Math.floor(Math.random() * 0xffffff)
        .toString(16)
        .padStart(6, "0")}`;

      if (provider.awareness) {
        provider.awareness.setLocalStateField("user", {
          id: userId,
          name: userId,
          color: randomColor,
        });
      }

      provider.on(
        "status",
        ({ status }: { status: ConnectionStatus | string }) => {
          if (status === "connected") {
            const users = provider.awareness?.getStates().size ?? 0;
            setConnectionState((prev) => ({
              ...prev,
              status: "connected",
              users,
            }));
          } else if (status === "connecting") {
            setConnectionState((prev) => ({ ...prev, status: "connecting" }));
          } else if (status === "disconnected") {
            setConnectionState((prev) => ({
              ...prev,
              status: "disconnected",
              users: 0,
            }));
          }
        }
      );

      provider.on("connect", () => {
        const users = provider.awareness?.getStates().size ?? 0;
        setConnectionState((prev) => ({ ...prev, status: "connected", users }));
      });

      provider.on("synced", () => {
        const users = provider.awareness?.getStates().size ?? 0;
        setConnectionState((prev) => ({ ...prev, isSynced: true, users }));
      });

      provider.on(
        "unsyncedChanges",
        (arg: boolean | { hasUnsyncedChanges: boolean } | undefined) => {
          const has =
            typeof arg === "boolean"
              ? arg
              : typeof arg?.hasUnsyncedChanges === "boolean"
                ? arg.hasUnsyncedChanges
                : (provider.hasUnsyncedChanges ?? false);

          setConnectionState((prev) => ({ ...prev, isSynced: !has }));
        }
      );

      provider.on("authenticationFailed", () => {
        setConnectionState((prev) => ({ ...prev, status: "error" }));
      });

      provider.on("disconnect", () => {
        setConnectionState((prev) => ({ ...prev, status: "disconnected" }));
      });

      provider.on("close", () => {
        setConnectionState((prev) => ({ ...prev, status: "disconnected" }));
      });

      provider.awareness?.on("update", () => {
        const users = provider.awareness?.getStates().size ?? 0;
        setConnectionState((prev) => ({ ...prev, users }));
      });

      providerRef.current = provider;
      isInitializedRef.current = true;
    },
    [cleanup]
  );

  const disconnect = useCallback(() => {
    isInitializedRef.current = false;
    cleanup();
  }, [cleanup]);

  const setupBinding = useCallback(
    (editor: Monaco.editor.IStandaloneCodeEditor) => {
      if (!docRef.current || !providerRef.current) {
        throw new Error("Failed to setup binding");
      }
      const model = editor.getModel();
      if (!model) throw new Error("Editor model is not available");

      if (bindingRef.current) {
        bindingRef.current.destroy();
        bindingRef.current = null;
      }

      const text = docRef.current.getText(TEXT_ID);
      if (!providerRef.current.awareness) {
        throw new Error("Provider awareness is not available");
      }

      const binding = new MonacoBinding(
        text,
        model,
        new Set([editor]),
        providerRef.current.awareness
      );

      bindingRef.current = binding;
      setYText(text);
      setAwareness(providerRef.current.awareness);
    },
    []
  );

  useEffect(() => {
    if (roomId) {
      // Disconnect from previous room if connected
      if (isInitializedRef.current) {
        disconnect();
      }
      // Connect to new room
      connect(roomId);
    }

    return () => {
      if (isInitializedRef.current) {
        disconnect();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId]);

  return { connectionState, setupBinding, yText, awareness };
}
