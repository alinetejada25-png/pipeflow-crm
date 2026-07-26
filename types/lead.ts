export type LeadStatus = "novo" | "contatado" | "qualificado" | "desqualificado" | "convertido";

export const LEAD_STATUSES: LeadStatus[] = [
  "novo",
  "contatado",
  "qualificado",
  "desqualificado",
  "convertido",
];

export const LEAD_STATUS_LABELS: Record<LeadStatus, string> = {
  novo: "Novo",
  contatado: "Contatado",
  qualificado: "Qualificado",
  desqualificado: "Desqualificado",
  convertido: "Convertido",
};

export type LeadSource = "manual" | "whatsapp";

export interface Lead {
  id: string;
  workspaceId: string;
  name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  jobTitle: string | null;
  status: LeadStatus;
  ownerId: string | null;
  source: LeadSource;
  createdAt: string;
  updatedAt: string;
}

export interface LeadInput {
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  jobTitle?: string;
  status: LeadStatus;
  ownerId?: string;
}

export interface LeadFilters {
  search?: string;
  status?: LeadStatus;
  ownerId?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface WorkspaceMember {
  userId: string;
  name: string;
}

export type ActivityType = "ligacao" | "email" | "reuniao" | "nota";

export const ACTIVITY_TYPE_LABELS: Record<ActivityType, string> = {
  ligacao: "Ligação",
  email: "E-mail",
  reuniao: "Reunião",
  nota: "Nota",
};

export interface Activity {
  id: string;
  workspaceId: string;
  leadId: string;
  authorId: string | null;
  type: ActivityType;
  description: string;
  occurredAt: string;
  createdAt: string;
}
