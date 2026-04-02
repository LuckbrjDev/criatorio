import { Passaro, HistoricoEntry } from "@/types/Passaro";

const STORAGE_KEY = "criadouro_passaros";

function getAll(): Passaro[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveAll(passaros: Passaro[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(passaros));
}

function getById(id: string): Passaro | undefined {
  return getAll().find((p) => p.id === id);
}

function create(data: Omit<Passaro, "id" | "criadoEm" | "atualizadoEm" | "historico">): { success: boolean; error?: string } {
  const passaros = getAll();
  
  if (passaros.some((p) => p.anilha === data.anilha)) {
    return { success: false, error: "Anilha já cadastrada no sistema." };
  }

  const now = new Date().toISOString();
  const novo: Passaro = {
    ...data,
    id: data.anilha,
    historico: [{ data: now, descricao: "Pássaro cadastrado no sistema." }],
    criadoEm: now,
    atualizadoEm: now,
  };

  passaros.push(novo);
  saveAll(passaros);
  return { success: true };
}

function update(anilha: string, data: Partial<Passaro>, descricaoAlteracao?: string): { success: boolean; error?: string } {
  const passaros = getAll();
  const index = passaros.findIndex((p) => p.id === anilha);
  
  if (index === -1) {
    return { success: false, error: "Pássaro não encontrado." };
  }

  const now = new Date().toISOString();
  const historico: HistoricoEntry[] = [
    ...passaros[index].historico,
    { data: now, descricao: descricaoAlteracao || "Dados atualizados." },
  ];

  passaros[index] = {
    ...passaros[index],
    ...data,
    id: passaros[index].anilha, // keep id = anilha
    historico,
    atualizadoEm: now,
  };

  saveAll(passaros);
  return { success: true };
}

function remove(anilha: string): { success: boolean } {
  const passaros = getAll().filter((p) => p.id !== anilha);
  saveAll(passaros);
  return { success: true };
}

function search(query: string): Passaro[] {
  const q = query.toLowerCase().trim();
  if (!q) return getAll();
  return getAll().filter(
    (p) =>
      p.nome.toLowerCase().includes(q) ||
      p.anilha.toLowerCase().includes(q)
  );
}

function getStats() {
  const passaros = getAll();
  const anoAtual = new Date().getFullYear();
  return {
    total: passaros.length,
    curios: passaros.filter((p) => p.tipo === "Curió").length,
    canarios: passaros.filter((p) => p.tipo === "Canário").length,
    nascidosAnoAtual: passaros.filter((p) => {
      if (!p.dataNascimento) return false;
      return new Date(p.dataNascimento).getFullYear() === anoAtual;
    }).length,
  };
}

function getAlertas(): { tipo: "vacina" | "dados"; mensagem: string; passaroId: string }[] {
  const passaros = getAll();
  const alertas: { tipo: "vacina" | "dados"; mensagem: string; passaroId: string }[] = [];
  const hoje = new Date();

  for (const p of passaros) {
    // Vacinas vencidas (mais de 1 ano)
    for (const v of p.vacinas) {
      const dataVacina = new Date(v.data);
      const umAnoDepois = new Date(dataVacina);
      umAnoDepois.setFullYear(umAnoDepois.getFullYear() + 1);
      if (umAnoDepois < hoje) {
        alertas.push({
          tipo: "vacina",
          mensagem: `${p.nome} (${p.anilha}): Vacina "${v.nome}" pode estar vencida (aplicada em ${new Date(v.data).toLocaleDateString("pt-BR")}).`,
          passaroId: p.id,
        });
      }
    }
    
    // Dados incompletos
    const camposFaltantes: string[] = [];
    if (!p.cor) camposFaltantes.push("cor");
    if (!p.dataNascimento) camposFaltantes.push("data de nascimento");
    if (!p.alimentacao) camposFaltantes.push("alimentação");
    if (p.imagens.length === 0) camposFaltantes.push("imagem");
    
    if (camposFaltantes.length >= 2) {
      alertas.push({
        tipo: "dados",
        mensagem: `${p.nome} (${p.anilha}): Faltam dados: ${camposFaltantes.join(", ")}.`,
        passaroId: p.id,
      });
    }
  }

  return alertas;
}

function verificarCruzamento(anilha1: string, anilha2: string): { permitido: boolean; motivo?: string } {
  const p1 = getById(anilha1);
  const p2 = getById(anilha2);
  
  if (!p1 || !p2) return { permitido: true };

  // Check direct parent relationship
  if (p1.pai === p2.anilha || p1.mae === p2.anilha || p2.pai === p1.anilha || p2.mae === p1.anilha) {
    return { permitido: false, motivo: "São pai/mãe e filho(a)." };
  }

  // Check siblings
  if (p1.pai && p1.pai === p2.pai) return { permitido: false, motivo: "Possuem o mesmo pai." };
  if (p1.mae && p1.mae === p2.mae) return { permitido: false, motivo: "Possuem a mesma mãe." };

  return { permitido: true };
}

function exportarDados(): string {
  return JSON.stringify(getAll(), null, 2);
}

function importarDados(json: string): { success: boolean; error?: string } {
  try {
    const data = JSON.parse(json);
    if (!Array.isArray(data)) return { success: false, error: "Formato inválido." };
    saveAll(data);
    return { success: true };
  } catch {
    return { success: false, error: "Arquivo JSON inválido." };
  }
}

export const passaroService = {
  getAll,
  getById,
  create,
  update,
  remove,
  search,
  getStats,
  getAlertas,
  verificarCruzamento,
  exportarDados,
  importarDados,
};
