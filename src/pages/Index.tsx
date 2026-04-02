import { useState, useMemo } from "react";
import { Passaro } from "@/types/Passaro";
import { usePassaros } from "@/hooks/usePassaros";
import { passaroService } from "@/services/passaroService";
import { StatsCards } from "@/components/StatsCards";
import { SearchBar } from "@/components/SearchBar";
import { BirdCard } from "@/components/BirdCard";
import { BirdDetailModal } from "@/components/BirdDetailModal";
import { BirdForm } from "@/components/BirdForm";
import { AlertsPanel } from "@/components/AlertsPanel";
import { BackupRestore } from "@/components/BackupRestore";
import { CrossingControl } from "@/components/CrossingControl";
import { AdvancedFilters, Filters } from "@/components/AdvancedFilters";
import { PdfReport } from "@/components/PdfReport";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bird, ClipboardList } from "lucide-react";
import heroBirds from "@/assets/hero-birds.jpg";

const Index = () => {
  const { passaros, refresh, buscar, searchQuery, stats, alertas } = usePassaros();
  const [selectedBird, setSelectedBird] = useState<Passaro | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [editingBird, setEditingBird] = useState<Passaro | null>(null);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [filters, setFilters] = useState<Filters>({ tipo: "", cor: "", anoNascimento: "" });

  const cores = useMemo(() => {
    const all = passaroService.getAll();
    return [...new Set(all.map((p) => p.cor).filter(Boolean))];
  }, [passaros]);

  const filteredPassaros = useMemo(() => {
    return passaros.filter((p) => {
      if (filters.tipo && p.tipo !== filters.tipo) return false;
      if (filters.cor && p.cor !== filters.cor) return false;
      if (filters.anoNascimento && p.dataNascimento) {
        const ano = new Date(p.dataNascimento).getFullYear().toString();
        if (ano !== filters.anoNascimento) return false;
      } else if (filters.anoNascimento && !p.dataNascimento) {
        return false;
      }
      return true;
    });
  }, [passaros, filters]);

  const handleCardClick = (p: Passaro) => {
    setSelectedBird(p);
    setDetailOpen(true);
  };

  const handleAlertClick = (id: string) => {
    const p = passaroService.getById(id);
    if (p) handleCardClick(p);
  };

  const handleSave = () => {
    refresh();
    setEditingBird(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="relative h-36 md:h-44 overflow-hidden">
        <img src={heroBirds} alt="Criadouro" className="w-full h-full object-cover" width={1920} height={512} />
        <div className="absolute inset-0 bg-gradient-to-b from-foreground/40 to-foreground/70 flex items-center justify-center">
          <div className="text-center">
            <h1 className="font-heading text-2xl md:text-3xl font-bold text-primary-foreground drop-shadow-lg flex items-center gap-2 justify-center">
              <Bird className="w-7 h-7" /> Criadouro Manager
            </h1>
            <p className="text-primary-foreground/80 text-sm mt-1">Sistema de Gerenciamento de Pássaros</p>
          </div>
        </div>
      </header>

      <main className="container max-w-6xl mx-auto px-4 -mt-6 relative z-10 pb-12">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <TabsList className="bg-card shadow-sm">
              <TabsTrigger value="dashboard" className="gap-1.5"><Bird className="w-4 h-4" /> Dashboard</TabsTrigger>
              <TabsTrigger value="cadastro" className="gap-1.5"><ClipboardList className="w-4 h-4" /> Cadastro</TabsTrigger>
            </TabsList>
            <div className="flex gap-2 flex-wrap">
              <PdfReport passaros={filteredPassaros} />
              <BackupRestore onRestore={refresh} />
            </div>
          </div>

          <TabsContent value="dashboard" className="space-y-5 animate-fade-in">
            <StatsCards
              total={stats.total}
              curios={stats.curios}
              canarios={stats.canarios}
              nascidosAnoAtual={stats.nascidosAnoAtual}
              alertasCount={alertas.length}
            />

            <AlertsPanel alertas={alertas} onClickAlerta={handleAlertClick} />

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <SearchBar value={searchQuery} onChange={buscar} />
              <span className="text-sm text-muted-foreground">{filteredPassaros.length} pássaro(s)</span>
            </div>

            <AdvancedFilters filters={filters} onChange={setFilters} cores={cores} />

            {filteredPassaros.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <Bird className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="text-lg font-heading">Nenhum pássaro encontrado</p>
                <p className="text-sm">Tente ajustar os filtros ou adicione pássaros na aba Cadastro.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredPassaros.map((p) => (
                  <BirdCard key={p.id} passaro={p} onClick={handleCardClick} />
                ))}
              </div>
            )}

            {stats.total >= 2 && <CrossingControl />}
          </TabsContent>

          <TabsContent value="cadastro" className="animate-fade-in">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-card rounded-xl border p-5">
                <BirdForm editingBird={editingBird} onSave={handleSave} onClear={() => setEditingBird(null)} />
              </div>
              <div className="space-y-3">
                <h3 className="font-heading font-semibold text-sm text-muted-foreground">Pássaros Cadastrados</h3>
                <div className="space-y-2 max-h-[60vh] overflow-y-auto">
                  {passaroService.getAll().map((p) => (
                    <div
                      key={p.id}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors hover:bg-muted ${editingBird?.id === p.id ? "border-primary bg-primary/5" : ""}`}
                      onClick={() => setEditingBird(p)}
                    >
                      <p className="font-medium text-sm">{p.nome}</p>
                      <p className="text-xs text-muted-foreground">{p.tipo} • {p.anilha}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      <BirdDetailModal passaro={selectedBird} open={detailOpen} onClose={() => setDetailOpen(false)} />
    </div>
  );
};

export default Index;
