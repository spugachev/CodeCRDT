import type {
  ConnectionState,
  ConnectionStatus as ConnectionStatusType,
} from "~/hooks/use-collaboration";

export interface ConnectionStatusProps {
  connectionState: ConnectionState;
}

export default function ConnectionStatus(props: ConnectionStatusProps) {
  const {
    connectionState: { status, isSynced, users },
  } = props;

  const statusConfig = {
    connecting: {
      text: "Connecting",
      className: "text-amber-500/80",
      icon: (
        <svg
          className="w-3 h-3 animate-spin"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      ),
    },
    connected: {
      text: "Connected",
      className: "text-emerald-500/80",
      icon: (
        <svg
          className="w-3 h-3"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="m9 12 2 2 4-4" />
        </svg>
      ),
    },
    disconnected: {
      text: "Disconnected",
      className: "text-rose-500/80",
      icon: (
        <svg
          className="w-3 h-3"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="m15 9-6 6" />
          <path d="m9 9 6 6" />
        </svg>
      ),
    },
    error: {
      text: "Connection error",
      className: "text-rose-500/80",
      icon: (
        <svg
          className="w-3 h-3"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" />
          <path d="M12 9v4" />
          <path d="M12 17h.01" />
        </svg>
      ),
    },
    reconnecting: {
      text: "Reconnecting",
      className: "text-amber-500/80",
      icon: (
        <svg
          className="w-3 h-3 animate-pulse"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
          <path d="M3 3v5h5" />
          <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
          <path d="M16 16h5v5" />
        </svg>
      ),
    },
  };

  const config = statusConfig[status];

  // Show sync status when connected
  const getSyncStatus = () => {
    if (status !== "connected") return null;

    if (isSynced) {
      return {
        icon: (
          <svg
            className="w-3 h-3"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
            <path d="m9 12 2 2 4-4" />
          </svg>
        ),
        text: "Synced",
        className: "text-blue-500/80",
        bgClassName: "bg-blue-500/10 border-blue-500/20",
      };
    } else {
      return {
        icon: (
          <svg
            className="w-3 h-3 animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
          </svg>
        ),
        text: "Syncing",
        className: "text-amber-500/80",
        bgClassName: "bg-amber-500/10 border-amber-500/20",
      };
    }
  };

  const syncInfo = getSyncStatus();

  return (
    <div className="inline-flex items-center gap-2">
      <div
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full ${
          status === "connected"
            ? "bg-emerald-500/10 border border-emerald-500/20"
            : status === "disconnected" || status === "error"
              ? "bg-rose-500/10 border border-rose-500/20"
              : "bg-amber-500/10 border border-amber-500/20"
        } backdrop-blur-sm transition-all duration-500 ease-in-out`}
      >
        <span className={`inline-flex ${config.className}`}>{config.icon}</span>
        <span
          className={`text-[10px] font-semibold tracking-wider uppercase ${config.className}`}
        >
          {config.text}
        </span>
      </div>
      {syncInfo && (
        <div
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border ${syncInfo.bgClassName} backdrop-blur-sm transition-all duration-500 ease-in-out`}
        >
          <span className={`inline-flex ${syncInfo.className}`}>
            {syncInfo.icon}
          </span>
          <span
            className={`text-[10px] font-semibold tracking-wider uppercase ${syncInfo.className}`}
          >
            {syncInfo.text}
          </span>
        </div>
      )}
      {status === "connected" && users > 0 && (
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 backdrop-blur-sm transition-all duration-500 ease-in-out">
          <svg
            className="w-3 h-3 text-purple-500/80"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
          <span className="text-[10px] font-semibold tracking-wider uppercase text-purple-500/80">
            {users} {users === 1 ? "Client" : "Clients"}
          </span>
        </div>
      )}
    </div>
  );
}
