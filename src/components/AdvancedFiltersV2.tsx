import { useState } from "react";
import { Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export interface FiltersV2 {
  tipo: string;
  cor: string;
  anoNascimento: string;
}

interface AdvancedFiltersV2Props {
  filters: FiltersV2;
  onChange: (filters: FiltersV2) => void;
  cores: string[];
}

export function AdvancedFiltersV2({ filters, onChange, cores }: AdvancedFiltersV2Props) {
  const [open, setOpen] = useState(false);
  const hasFilters = filters.tipo || filters.cor || filters.anoNascimento;

  return (
    <div className="space-y-2">
      <Button variant="outline" size="sm" onClick={() => setOpen((value) => !value)} className="gap-1.5">
        <Filter className="w-4 h-4" /> Filtros
        {hasFilters && <span className="w-2 h-2 rounded-full bg-primary" />}
      </Button>

      {open && (
        <div className="flex flex-wrap gap-3 p-3 rounded-lg border bg-card animate-fade-in">
          <div className="w-36">
            <Select value={filters.tipo || "all"} onValueChange={(value) => onChange({ ...filters, tipo: value === "all" ? "" : value })}>
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
            <Select value={filters.cor || "all"} onValueChange={(value) => onChange({ ...filters, cor: value === "all" ? "" : value })}>
              <SelectTrigger className="h-9 text-xs">
                <SelectValue placeholder="Cor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as cores</SelectItem>
                {cores.map((cor) => (
                  <SelectItem key={cor} value={cor}>
                    {cor}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="w-28">
            <Input
              type="number"
              placeholder="Ano nasc."
              value={filters.anoNascimento}
              onChange={(event) => onChange({ ...filters, anoNascimento: event.target.value })}
              className="h-9 text-xs"
              min={1900}
              max={new Date().getFullYear()}
            />
          </div>

          {hasFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onChange({ tipo: "", cor: "", anoNascimento: "" })}
              className="h-9 text-xs gap-1"
            >
              <X className="w-3 h-3" /> Limpar
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
