"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useRef, useState } from "react";
import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LEAD_STATUSES, LEAD_STATUS_LABELS, type WorkspaceMember } from "@/types/lead";

const ALL_STATUSES = "todos";
const ALL_OWNERS = "todos";

interface LeadFiltersProps {
  members: WorkspaceMember[];
}

export function LeadFilters({ members }: LeadFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") ?? "");
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== ALL_STATUSES && value !== ALL_OWNERS) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`/leads?${params.toString()}`);
  }

  function handleSearchChange(value: string) {
    setSearch(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => updateParam("search", value), 400);
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="relative flex-1 sm:max-w-xs">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar por nome, e-mail ou empresa..."
          value={search}
          onChange={(event) => handleSearchChange(event.target.value)}
          className="pl-9"
        />
      </div>

      <Select
        defaultValue={searchParams.get("status") ?? ALL_STATUSES}
        onValueChange={(value) => updateParam("status", value)}
      >
        <SelectTrigger className="sm:w-48">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL_STATUSES}>Todos os status</SelectItem>
          {LEAD_STATUSES.map((status) => (
            <SelectItem key={status} value={status}>
              {LEAD_STATUS_LABELS[status]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        defaultValue={searchParams.get("ownerId") ?? ALL_OWNERS}
        onValueChange={(value) => updateParam("ownerId", value)}
      >
        <SelectTrigger className="sm:w-48">
          <SelectValue placeholder="Responsável" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL_OWNERS}>Todos os responsáveis</SelectItem>
          {members.map((member) => (
            <SelectItem key={member.userId} value={member.userId}>
              {member.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="flex items-center gap-2">
        <Input
          type="date"
          aria-label="Data inicial"
          defaultValue={searchParams.get("dateFrom") ?? ""}
          onChange={(event) => updateParam("dateFrom", event.target.value)}
          className="sm:w-40"
        />
        <span className="text-sm text-muted-foreground">até</span>
        <Input
          type="date"
          aria-label="Data final"
          defaultValue={searchParams.get("dateTo") ?? ""}
          onChange={(event) => updateParam("dateTo", event.target.value)}
          className="sm:w-40"
        />
      </div>
    </div>
  );
}
