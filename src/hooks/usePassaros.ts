import { useState, useCallback } from "react";
import { Passaro } from "@/types/Passaro";
import { passaroService } from "@/services/passaroService";

export function usePassaros() {
  const [passaros, setPassaros] = useState<Passaro[]>(passaroService.getAll());
  const [searchQuery, setSearchQuery] = useState("");

  const refresh = useCallback(() => {
    setPassaros(searchQuery ? passaroService.search(searchQuery) : passaroService.getAll());
  }, [searchQuery]);

  const buscar = useCallback((query: string) => {
    setSearchQuery(query);
    setPassaros(query ? passaroService.search(query) : passaroService.getAll());
  }, []);

  const stats = passaroService.getStats();
  const alertas = passaroService.getAlertas();

  return { passaros, refresh, buscar, searchQuery, stats, alertas };
}
