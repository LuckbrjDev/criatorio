import { supabase } from "@/lib/supabase";
import { AlertaPassaro, Passaro, PassaroFormData, PassaroStats } from "@/types/passaro";

export const emptyStats: PassaroStats = {
  total: 0,
  curios: 0,
  canarios: 0,
  nascidosAnoAtual: 0,
  porTipo: {},
};

const currentYear = new Date().getFullYear();

function normalizePassaro(raw: Partial<Passaro>): Passaro {
  const tipo = raw.tipo === "Canário" ? "Canário" : "Curió";

  return {
    id: raw.id ?? raw.anilha ?? "",
    nome: raw.nome ?? "",
    tipo,
    anilha: raw.anilha ?? "",
    cor: raw.cor ?? "",
    pai: raw.pai ?? "",
    mae: raw.mae ?? "",
    dataNascimento: raw.dataNascimento ?? "",
    vacinas: Array.isArray(raw.vacinas) ? raw.vacinas : [],
    alimentacao: raw.alimentacao ?? "",
    imagens: Array.isArray(raw.imagens) ? raw.imagens : [],
    audio: raw.audio ?? "",
    observacoes: raw.observacoes ?? "",
    historico: Array.isArray(raw.historico) ? raw.historico : [],
    criadoEm: raw.criadoEm ?? "",
    atualizadoEm: raw.atualizadoEm ?? "",
  };
}

function buildStats(passaros: Passaro[]): PassaroStats {
  const porTipo: Record<string, number> = {};
  let curios = 0;
  let canarios = 0;
  let nascidosAnoAtual = 0;

  for (const passaro of passaros) {
    porTipo[passaro.tipo] = (porTipo[passaro.tipo] || 0) + 1;

    if (passaro.tipo === "Curió") curios += 1;
    if (passaro.tipo === "Canário") canarios += 1;

    if (passaro.dataNascimento) {
      const anoNascimento = new Date(passaro.dataNascimento).getFullYear();
      if (anoNascimento === currentYear) nascidosAnoAtual += 1;
    }
  }

  return {
    total: passaros.length,
    curios,
    canarios,
    nascidosAnoAtual,
    porTipo,
  };
}

function buildAlertas(passaros: Passaro[]): AlertaPassaro[] {
  return passaros.flatMap((passaro) => {
    const alertas: AlertaPassaro[] = [];
    const missingFields: string[] = [];

    if (!passaro.nome.trim()) missingFields.push("nome");
    if (!passaro.anilha.trim()) missingFields.push("anilha");
    if (!passaro.dataNascimento.trim()) missingFields.push("data de nascimento");

    if (missingFields.length > 0) {
      alertas.push({
        tipo: "dados",
        mensagem: `${passaro.nome || passaro.anilha || "Pássaro sem identificação"} com dados incompletos: ${missingFields.join(", ")}.`,
        passaroId: passaro.id || passaro.anilha,
      });
    }

    const vacinasInvalidas = passaro.vacinas.filter((vacina) => !vacina.nome.trim() || !vacina.data.trim());
    if (vacinasInvalidas.length > 0) {
      alertas.push({
        tipo: "vacina",
        mensagem: `${passaro.nome || passaro.anilha || "Pássaro sem identificação"} possui vacina com dados incompletos.`,
        passaroId: passaro.id || passaro.anilha,
      });
    }

    return alertas;
  });
}

export const passaroServiceV2 = {
  async getAll(): Promise<Passaro[]> {
    const { data, error } = await supabase.from("passaros").select("*").order("nome", { ascending: true });

    if (error) {
      console.error("Erro ao buscar pássaros:", error);
      return [];
    }

    return Array.isArray(data) ? data.map((item) => normalizePassaro(item as Partial<Passaro>)) : [];
  },

  async create(passaro: PassaroFormData) {
    const { error } = await supabase.from("passaros").insert([passaro]);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  },

  async update(anilha: string, passaro: PassaroFormData) {
    const { error } = await supabase.from("passaros").update(passaro).eq("anilha", anilha);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  },

  async remove(anilha: string) {
    const { error } = await supabase.from("passaros").delete().eq("anilha", anilha);

    if (error) {
      console.error("Erro ao remover pássaro:", error);
    }
  },

  async getStats() {
    const passaros = await this.getAll();
    return buildStats(passaros);
  },

  async getAlertas() {
    const passaros = await this.getAll();
    return buildAlertas(passaros);
  },

  async exportarDados() {
    const passaros = await this.getAll();
    return JSON.stringify(passaros, null, 2);
  },

  async importarDados(data: string) {
    try {
      const parsed = JSON.parse(data);
      if (!Array.isArray(parsed)) {
        return { success: false, error: "O arquivo de backup deve conter uma lista de pássaros." };
      }

      const passaros = parsed.map((item) => normalizePassaro(item as Partial<Passaro>));
      const payload = passaros.map(({ historico, criadoEm, atualizadoEm, ...passaro }) => ({
        ...passaro,
        historico,
        criadoEm,
        atualizadoEm,
      }));

      const { error } = await supabase.from("passaros").upsert(payload, { onConflict: "anilha" });
      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch {
      return { success: false, error: "Arquivo JSON inválido." };
    }
  },

  buildStats,
  buildAlertas,
};
