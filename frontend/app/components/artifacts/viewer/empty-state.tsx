import { memo } from "react";

interface EmptyStateProps {
  className?: string;
}

export const EmptyState = memo(function EmptyState({
  className,
}: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col justify-center items-center w-full h-full gap-4 p-8 ${className || ""}`}
    >
      <div className="relative">
        <div className="text-4xl font-mono text-foreground/80 animate-pulse">
          &lt;empty /&gt;
        </div>
        <div className="absolute -inset-2 bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 blur-xl animate-pulse" />
      </div>
    </div>
  );
});
