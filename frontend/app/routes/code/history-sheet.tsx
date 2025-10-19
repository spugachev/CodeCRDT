import { useState, useEffect } from "react";
import {
  History,
  Clock,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "~/components/ui/sheet";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { cn } from "~/lib/utils";
import { getApi } from "~/api";
import type { RoomSummary, PaginatedResult } from "~/api";

interface HistorySheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectRoom?: (roomId: string) => void;
  currentRoomId?: string;
}

export default function HistorySheet({
  open,
  onOpenChange,
  onSelectRoom,
  currentRoomId,
}: HistorySheetProps) {
  const [rooms, setRooms] = useState<PaginatedResult<RoomSummary> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (open) {
      loadRooms();
    }
  }, [open, page]);

  const loadRooms = async () => {
    setLoading(true);
    setError(null);
    try {
      const api = getApi();
      const result = await api.rooms.getRooms({
        page,
        pageSize: 10,
      });
      setRooms(result);
    } catch (err) {
      setError("Failed to load history");
      console.error("Failed to load rooms:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectRoom = (roomId: string) => {
    if (onSelectRoom) {
      onSelectRoom(roomId);
      onOpenChange(false);
    }
  };

  const handlePreviousPage = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };

  const handleNextPage = () => {
    if (rooms && page < rooms.totalPages) {
      setPage(page + 1);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-md h-full overflow-hidden grid grid-rows-[auto_1fr_auto] gap-0"
      >
        <SheetHeader className="border-b pb-4">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <History className="h-5 w-5 text-primary" />
            </div>
            <div>
              <SheetTitle className="text-xl">History</SheetTitle>
              <SheetDescription>
                {rooms
                  ? `${rooms.total} conversations`
                  : "Loading conversations..."}
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className="min-h-0 flex flex-col">
          {loading && !rooms ? (
            <div className="flex flex-col items-center justify-center h-64 gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Loading history...
              </p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-64 gap-3">
              <div className="rounded-full bg-destructive/10 p-3">
                <History className="h-6 w-6 text-destructive" />
              </div>
              <p className="text-sm text-muted-foreground">{error}</p>
              <Button variant="outline" size="sm" onClick={loadRooms}>
                Try Again
              </Button>
            </div>
          ) : rooms && rooms.items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 gap-3">
              <div className="rounded-full bg-muted p-3">
                <History className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">
                No conversations yet
              </p>
              <p className="text-xs text-muted-foreground">
                Start a new conversation to see it here
              </p>
            </div>
          ) : rooms ? (
            <div
              className="flex-1 overflow-y-auto py-4"
              style={{ scrollbarGutter: "stable" }}
            >
              <div className="space-y-2 px-4">
                {rooms.items.map((room) => (
                  <button
                    key={room.roomId}
                    onClick={() => handleSelectRoom(room.roomId)}
                    className={cn(
                      "w-full group rounded-lg border p-4 text-left transition-all hover:bg-accent/50",
                      currentRoomId === room.roomId
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate mb-1">
                          {room.firstMessage.length > 60
                            ? room.firstMessage.substring(0, 60) + "..."
                            : room.firstMessage}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>
                            {formatDistanceToNow(
                              new Date(room.firstMessageTimestamp),
                              { addSuffix: true }
                            )}
                          </span>
                          <span className="text-muted-foreground/60">•</span>
                          <span>{room.messageCount} messages</span>
                        </div>
                      </div>
                      {currentRoomId === room.roomId && (
                        <Badge variant="secondary" className="shrink-0">
                          Current
                        </Badge>
                      )}
                    </div>
                    <div className="mt-2 pt-2 border-t border-border/50">
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(room.firstMessageTimestamp), "PPp")}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : null}
        </div>

        {rooms && rooms.totalPages > 1 && (
          <div className="border-t px-4 py-3">
            <div className="flex items-center justify-between h-8">
              <p className="text-sm leading-none text-muted-foreground whitespace-nowrap">
                Page {page} of {rooms.totalPages}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handlePreviousPage}
                  disabled={page === 1 || loading}
                  className="h-8 w-8"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleNextPage}
                  disabled={page === rooms.totalPages || loading}
                  className="h-8 w-8"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
