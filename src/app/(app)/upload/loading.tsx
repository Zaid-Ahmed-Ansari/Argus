import { Skeleton } from "@/components/ui/skeleton";

export default function UploadLoading() {
  return (
    <div className="max-w-2xl animate-in fade-in duration-200">
      <Skeleton className="mb-2 h-9 w-40" />
      <Skeleton className="mb-8 h-5 w-full max-w-md" />
      <Skeleton className="h-80 w-full rounded-lg" />
    </div>
  );
}
