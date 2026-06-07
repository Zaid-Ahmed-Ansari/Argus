import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { countLogLines } from "@/utils/format";

type LogPreviewProps = {
  content: string;
  maxLines?: number;
};

export function LogPreview({ content, maxLines = 12 }: LogPreviewProps) {
  const lines = content.split("\n");
  const preview = lines.slice(0, maxLines).join("\n");
  const truncated = lines.length > maxLines;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">
          Log preview · {countLogLines(content)} lines
        </CardTitle>
      </CardHeader>
      <CardContent>
        <pre className="max-h-48 overflow-auto rounded-md bg-muted p-3 font-mono text-xs">
          {preview}
          {truncated ? "\n..." : ""}
        </pre>
      </CardContent>
    </Card>
  );
}
