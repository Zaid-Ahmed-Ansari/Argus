import type { TimelineEvent } from "@/types/api";
import { formatDate } from "@/utils/format";

type TimelineViewProps = {
  events: TimelineEvent[];
};

export function TimelineView({ events }: TimelineViewProps) {
  if (events.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">No timeline events.</p>
    );
  }

  return (
    <ol className="space-y-4">
      {events.map((event, index) => (
        <li
          key={`${event.timestamp}-${index}`}
          className="grid gap-1 border-l-2 border-border pl-4"
        >
          <time className="font-mono text-xs text-muted-foreground">
            {formatDate(event.timestamp)}
          </time>
          <p className="text-sm">{event.event}</p>
          {event.source ? (
            <p className="text-xs text-muted-foreground">{event.source}</p>
          ) : null}
        </li>
      ))}
    </ol>
  );
}
