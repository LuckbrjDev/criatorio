import { useEffect, useState } from "react";
import { passaroService } from "@/services/passaroService";

export function usePassaros() {
  const [passaros, setPassaros] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [stats, setStats] = useState({
    total: 0,
    porTipo: {}
  });
  const [alertas, setAlertas] = useState<any[]>([]);

  const refresh = async () => {
    const data = await passaroService.getAll();
    setPassaros(data || []);

    const statsData = await passaroService.getStats();
    setStats(statsData);

    const alertasData = await passaroService.getAlertas();
    setAlertas(alertasData);
  };

  useEffect(() => {
    refresh();
  }, []);

  const buscar = (query: string) => {
    setSearchQuery(query);
  };

  const filtrados = passaros.filter((p) =>
    p.nome?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return {
    passaros: filtrados,
    refresh,
    buscar,
    searchQuery,
    stats,
    alertas,
  };
}