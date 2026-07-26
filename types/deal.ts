export type DealStage =
  | "novo_lead"
  | "contato_realizado"
  | "proposta_enviada"
  | "negociacao"
  | "fechado_ganho"
  | "fechado_perdido";

export const DEAL_STAGES: DealStage[] = [
  "novo_lead",
  "contato_realizado",
  "proposta_enviada",
  "negociacao",
  "fechado_ganho",
  "fechado_perdido",
];

export const DEAL_STAGE_LABELS: Record<DealStage, string> = {
  novo_lead: "Novo Lead",
  contato_realizado: "Contato Realizado",
  proposta_enviada: "Proposta Enviada",
  negociacao: "Negociação",
  fechado_ganho: "Fechado Ganho",
  fechado_perdido: "Fechado Perdido",
};

export interface Deal {
  id: string;
  workspaceId: string;
  title: string;
  value: number;
  leadId: string;
  ownerId: string | null;
  stage: DealStage;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DealInput {
  title: string;
  value: number;
  leadId: string;
  ownerId?: string;
  stage: DealStage;
  dueDate?: string;
}
