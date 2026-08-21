import { Palette } from "lucide-react";

export default function CultureIcon({ className = "" }: { className?: string }) {
  return <Palette className={className} aria-hidden="true" />;
}
