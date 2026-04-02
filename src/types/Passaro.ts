export interface Vacina {
  nome: string;
  data: string; // ISO date string
}

export interface HistoricoEntry {
  data: string; // ISO date string
  descricao: string;
}

export interface Passaro {
  id: string; // same as anilha
  nome: string;
  tipo: "Curió" | "Canário";
  anilha: string;
  cor: string;
  pai: string; // anilha reference or free text
  mae: string;
  dataNascimento: string;
  vacinas: Vacina[];
  alimentacao: string;
  imagens: string[]; // base64 data URLs
  audio: string; // base64 data URL
  observacoes: string;
  historico: HistoricoEntry[];
  criadoEm: string;
  atualizadoEm: string;
}

export type PassaroFormData = Omit<Passaro, "id" | "criadoEm" | "atualizadoEm" | "historico">;
