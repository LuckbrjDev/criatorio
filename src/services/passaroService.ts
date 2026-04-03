import { supabase } from "@/lib/supabase";
import { PassaroFormData } from "@/types/Passaro";

export const passaroService = {
  async getAll() {
    const { data, error } = await supabase
      .from("passaros")
      .select("*")
      .order("nome", { ascending: true });

    if (error) {
      console.error("Erro ao buscar:", error);
      return [];
    }

    return data || [];
  }, // ← AQUI FALTAVA A VÍRGULA

  async create(passaro: PassaroFormData) {
    const { error } = await supabase
      .from("passaros")
      .insert([passaro]);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  },

  async update(anilha: string, passaro: PassaroFormData) {
    const { error } = await supabase
      .from("passaros")
      .update(passaro)
      .eq("anilha", anilha);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  },

  async remove(anilha: string) {
    const { error } = await supabase
      .from("passaros")
      .delete()
      .eq("anilha", anilha);

    if (error) {
      console.error("Erro ao remover:", error);
    }
  },

  async getStats() {
    const { data, error } = await supabase
      .from("passaros")
      .select("tipo");

    if (error) {
      console.error("Erro ao buscar stats:", error);
      return {
        total: 0,
        porTipo: {}
      };
    }

    const total = data.length;
    const porTipo: Record<string, number> = {};

    data.forEach((p) => {
      if (!p.tipo) return;
      porTipo[p.tipo] = (porTipo[p.tipo] || 0) + 1;
    });

    return {
      total,
      porTipo
    };
  },

  async getAlertas() {
    const { data, error } = await supabase
      .from("passaros")
      .select("*");

    if (error) {
      console.error("Erro ao buscar alertas:", error);
      return [];
    }

    return data.filter((p) => {
      return (
        !p.nome ||
        !p.tipo ||
        !p.anilha ||
        !p.dataNascimento
      );
    });
  }
};