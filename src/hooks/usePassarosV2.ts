import { useEffect, useMemo, useState } from "react";
import { AlertaPassaro, Passaro, PassaroStats } from "@/types/passaro";
import { emptyStats, passaroServiceV2 } from "@/services/passaroServiceV2";

export function usePassarosV2() {
  const [allPassaros, setAllPassaros] = useState<Passaro[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [stats, setStats] = useState<PassaroStats>(emptyStats);
  const [alertas, setAlertas] = useState<AlertaPassaro[]>([]);

  const refresh = async () => {
    const data = await passaroServiceV2.getAll();
    setAllPassaros(data);
    setStats(passaroServiceV2.buildStats(data));
    setAlertas(passaroServiceV2.buildAlertas(data));
  };

  useEffect(() => {
    void refresh();
  }, []);

  const passaros = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return allPassaros;

    return allPassaros.filter((passaro) => {
      return (
        passaro.nome.toLowerCase().includes(query) ||
        passaro.anilha.toLowerCase().includes(query)
      );
    });
  }, [allPassaros, searchQuery]);

  return {
    allPassaros,
    passaros,
    refresh,
    buscar: setSearchQuery,
    searchQuery,
    stats,
    alertas,
  };
}
