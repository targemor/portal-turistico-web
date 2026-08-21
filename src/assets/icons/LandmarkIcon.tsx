import { Landmark } from "lucide-react";

export default function LandmarkIcon({ className = "" }: { className?: string }) {
  return <Landmark className={className} aria-hidden="true" />;
}
