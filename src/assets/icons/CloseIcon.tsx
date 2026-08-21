import { X } from "lucide-react";

export default function CloseIcon({ className = "" }: { className?: string }) {
  return <X className={className} aria-hidden="true" />;
}
