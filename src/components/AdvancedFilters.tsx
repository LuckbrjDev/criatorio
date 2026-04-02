import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Filter, X } from "lucide-react";

export interface Filters {
  tipo: string;
  cor: string;
  anoNascimento: string;
}

interface AdvancedFiltersProps {
  filters: Filters;
  onChange: (filters: Filters) => void;
  cores: string[];
}

export function AdvancedFilters({ filters, onChange, cores }: AdvancedFiltersProps) {
  const [open, setOpen] = useState(false);
  const hasFilters = filters.tipo || filters.cor || filters.anoNascimento;

  const clear = () => onChange({ tipo: "", cor: "", anoNascimento: "" });

  return (
    <div className="space-y-2">
      <Button variant="outline" size="sm" onClick={() => setOpen(!open)} className="gap-1.5">
        <Filter className="w-4 h-4" /> Filtros
        {hasFilters && <span className="w-2 h-2 rounded-full bg-primary" />}
      </Button>

      {open && (
        <div className="flex flex-wrap gap-3 p-3 rounded-lg border bg-card animate-fade-in">
          <div className="w-36">
            <Select value={filters.tipo} onValueChange={(v) => onChange({ ...filters, tipo: v === "all" ? "" : v })}>
              <SelectTrigger className="h-9 text-xs">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os tipos</SelectItem>
                <SelectItem value="Curió">Curió</SelectItem>
                <SelectItem value="Canário">Canário</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="w-36">
            <Select value={filters.cor} onValueChange={(v) => onChange({ ...filters, cor: v === "all" ? "" : v })}>
              <SelectTrigger className="h-9 text-xs">
                <SelectValue placeholder="Cor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as cores</SelectItem>
                {cores.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="w-28">
            <Input
              type="number"
              placeholder="Ano nasc."
              value={filters.anoNascimento}
              onChange={(e) => onChange({ ...filters, anoNascimento: e.target.value })}
              className="h-9 text-xs"
              min={1900}
              max={new Date().getFullYear()}
            />
          </div>
          {hasFilters && (
            <Button variant="ghost" size="sm" onClick={clear} className="h-9 text-xs gap-1">
              <X className="w-3 h-3" /> Limpar
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
