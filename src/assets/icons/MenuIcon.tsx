import { Menu } from "lucide-react";

export default function MenuIcon({ className = "" }: { className?: string }) {
  return <Menu className={className} aria-hidden="true" />;
}
