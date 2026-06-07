import { toast as sonner } from "sonner";
import { getErrorMessage } from "@/lib/errors";

export const toast = {
  success(message: string) {
    sonner.success(message);
  },
  error(error: unknown, fallback = "Something went wrong") {
    sonner.error(getErrorMessage(error, fallback));
  },
  info(message: string) {
    sonner.info(message);
  },
};
