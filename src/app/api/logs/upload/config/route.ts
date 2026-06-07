import { getUploadProvider } from "@/lib/upload-config";
import { jsonSuccess } from "@/lib/api-response";

export const runtime = "nodejs";

export async function GET() {
  return jsonSuccess({
    provider: getUploadProvider(),
  });
}
