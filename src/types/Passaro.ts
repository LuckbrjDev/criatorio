export type PassaroTipo = "Curió" | "Canário";

export interface Vacina {
  nome: string;
  data: string;
}

export interface HistoricoEntry {
  data: string;
  descricao: string;
}

export interface Passaro {
  id: string;
  nome: string;
  tipo: PassaroTipo;
  anilha: string;
  cor: string;
  pai: string;
  mae: string;
  dataNascimento: string;
  vacinas: Vacina[];
  alimentacao: string;
  imagens: string[];
  audio: string;
  observacoes: string;
  historico: HistoricoEntry[];
  criadoEm: string;
  atualizadoEm: string;
}

export interface PassaroStats {
  total: number;
  curios: number;
  canarios: number;
  nascidosAnoAtual: number;
  porTipo: Record<string, number>;
}

export interface AlertaPassaro {
  tipo: "vacina" | "dados";
  mensagem: string;
  passaroId: string;
}

export type PassaroFormData = Omit<Passaro, "id" | "criadoEm" | "atualizadoEm" | "historico">;
