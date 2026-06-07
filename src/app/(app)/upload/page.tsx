import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UploadWorkspace } from "@/app/(app)/upload/upload-workspace";
import { getRetrieverModeLabel } from "@/services/rag/retriever-factory";

export default function UploadPage() {
  return (
    <div className="max-w-2xl">
      <PageHeader
        title="Upload logs"
        description="Upload a file or paste log lines for incident analysis."
      />

      <Card>
        <CardHeader>
          <CardTitle>Log input</CardTitle>
          <p className="text-base text-muted-foreground">
            Upload a file or paste log lines directly. Maximum file size is 1 MB.
            Uploaded content is saved to your account for analysis and search.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <UploadWorkspace ragModeLabel={getRetrieverModeLabel().toLowerCase()} />
        </CardContent>
      </Card>
    </div>
  );
}
