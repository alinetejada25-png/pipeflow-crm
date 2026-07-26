import Link from "next/link";
import { Workflow } from "lucide-react";

import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <Link href="/" className={cn("flex items-center gap-2 font-semibold", className)}>
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white">
        <Workflow className="h-4 w-4" />
      </span>
      <span className="text-lg tracking-tight text-foreground">PipeFlow</span>
    </Link>
  );
}
