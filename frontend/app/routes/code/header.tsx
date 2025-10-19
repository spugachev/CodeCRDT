import { RefreshCw, History, Plus, Menu, Code2 } from "lucide-react";
import { Link } from "react-router";
import { cn } from "~/lib/utils";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";

export interface HeaderProps {
  value?: string;
  onValueChange?: (tab: string) => void;
  onRefresh?: () => void;
  onHistory?: () => void;
  onNew?: () => void;
  onCodeQuality?: () => void;
}

export default function Header(props: HeaderProps) {
  const { value = "code" } = props;

  const onValueChange = (tab: string) => {
    if (props.onValueChange) {
      props.onValueChange(tab);
    }
  };

  return (
    <header className="flex h-16 items-center justify-between border-b px-4 md:px-6 sticky top-0 z-20 bg-background">
      <Link
        to="/"
        className="flex items-center gap-3 hover:opacity-80 transition-opacity"
      >
        <svg
          className="w-5 h-5 text-primary"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 2L2 7l10 5 10-5-10-5z" />
          <path d="M2 17l10 5 10-5" />
          <path d="M2 12l10 5 10-5" />
        </svg>
        <h1 className="text-lg font-semibold">CodeCRDT</h1>
      </Link>

      <div className="flex items-center gap-3">
        {/* New Button */}
        <button
          onClick={props.onNew}
          title="New Conversation"
          className="flex items-center justify-center w-9 h-9 rounded-lg border border-border bg-background hover:bg-accent text-foreground cursor-pointer transition-all"
        >
          <Plus className="h-4 w-4" />
        </button>

        {/* History Button */}
        <button
          onClick={props.onHistory}
          title="View History"
          className="flex items-center justify-center w-9 h-9 rounded-lg border border-border bg-background hover:bg-accent text-foreground cursor-pointer transition-all"
        >
          <History className="h-4 w-4" />
        </button>

        {/* Tabs Group */}
        <div className="flex bg-muted rounded-lg p-1">
          <button
            onClick={() => onValueChange("code")}
            className={cn(
              "px-4 py-1.5 min-w-32 text-sm font-medium rounded-md transition-all cursor-pointer",
              value === "code"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Code
          </button>
          <button
            onClick={() => onValueChange("preview")}
            className={cn(
              "px-4 py-1.5 min-w-32 text-sm font-medium rounded-md transition-all cursor-pointer",
              value === "preview"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Preview
          </button>
        </div>

        {/* Refresh Button */}
        <button
          onClick={props.onRefresh}
          disabled={value !== "preview"}
          title="Refresh Preview"
          className={cn(
            "flex items-center justify-center w-9 h-9 rounded-lg border transition-all",
            value === "preview"
              ? "border-border bg-background hover:bg-accent text-foreground cursor-pointer"
              : "border-border/50 bg-muted/30 text-muted-foreground/50 cursor-not-allowed"
          )}
        >
          <RefreshCw className="h-4 w-4" />
        </button>

        {/* Menu Button */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              title="More Options"
              className="flex items-center justify-center w-9 h-9 rounded-lg border border-border bg-background hover:bg-accent text-foreground cursor-pointer transition-all"
            >
              <Menu className="h-4 w-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem
              onClick={props.onCodeQuality}
              className="flex items-center gap-2 cursor-pointer"
            >
              <Code2 className="h-4 w-4" />
              <span>Code Quality</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
