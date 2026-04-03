import { useMemo, useState } from "react";
import { Bird, ClipboardList } from "lucide-react";
import heroBirds from "@/assets/hero-birds.jpg";
import { Passaro } from "@/types/passaro";
import { usePassarosV2 } from "@/hooks/usePassarosV2";
import { StatsCardsV2 } from "@/components/StatsCardsV2";
import { SearchBar } from "@/components/SearchBar";
import { BirdCard } from "@/components/BirdCard";
import { BirdDetailModalV2 } from "@/components/BirdDetailModalV2";
import { BirdFormV2 } from "@/components/BirdFormV2";
import { AlertsPanelV2 } from "@/components/AlertsPanelV2";
import { BackupRestoreV2 } from "@/components/BackupRestoreV2";
import { CrossingControlV2 } from "@/components/CrossingControlV2";
import { AdvancedFiltersV2, FiltersV2 } from "@/components/AdvancedFiltersV2";
import { PdfReportV2 } from "@/components/PdfReportV2";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const initialFilters: FiltersV2 = { tipo: "", cor: "", anoNascimento: "" };

const IndexV2 = () => {
  const { allPassaros, passaros, refresh, buscar, searchQuery, stats, alertas } = usePassarosV2();
  const [selectedBird, setSelectedBird] = useState<Passaro | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [editingBird, setEditingBird] = useState<Passaro | null>(null);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [filters, setFilters] = useState<FiltersV2>(initialFilters);

  const cores = useMemo(() => [...new Set(allPassaros.map((passaro) => passaro.cor).filter(Boolean))], [allPassaros]);

  const filteredPassaros = useMemo(() => {
    return passaros.filter((passaro) => {
      if (filters.tipo && passaro.tipo !== filters.tipo) return false;
      if (filters.cor && passaro.cor !== filters.cor) return false;

      if (filters.anoNascimento) {
        if (!passaro.dataNascimento) return false;
        const ano = new Date(passaro.dataNascimento).getFullYear().toString();
        if (ano !== filters.anoNascimento) return false;
      }

      return true;
    });
  }, [passaros, filters]);

  const handleCardClick = (passaro: Passaro) => {
    setSelectedBird(passaro);
    setDetailOpen(true);
  };

  const handleAlertClick = (id: string) => {
    const passaro = allPassaros.find((bird) => bird.id === id || bird.anilha === id);
    if (passaro) handleCardClick(passaro);
  };

  const handleSave = () => {
    void refresh();
    setEditingBird(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="relative h-36 md:h-44 overflow-hidden">
        <img src={heroBirds} alt="Criatório" className="w-full h-full object-cover" width={1920} height={512} />
        <div className="absolute inset-0 bg-gradient-to-b from-foreground/40 to-foreground/70 flex items-center justify-center">
          <div className="text-center">
            <h1 className="font-heading text-2xl md:text-3xl font-bold text-primary-foreground drop-shadow-lg flex items-center gap-2 justify-center">
              <Bird className="w-7 h-7" /> Criatório Berbel
            </h1>
            <p className="text-primary-foreground/80 text-sm mt-1">Sistema de gerenciamento de pássaros</p>
          </div>
        </div>
      </header>

      <main className="container max-w-6xl mx-auto px-4 -mt-6 relative z-10 pb-12">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <TabsList className="bg-card shadow-sm">
              <TabsTrigger value="dashboard" className="gap-1.5">
                <Bird className="w-4 h-4" /> Dashboard
              </TabsTrigger>
              <TabsTrigger value="cadastro" className="gap-1.5">
                <ClipboardList className="w-4 h-4" /> Cadastro
              </TabsTrigger>
            </TabsList>

            <div className="flex gap-2 flex-wrap">
              <PdfReportV2 passaros={filteredPassaros} />
              <BackupRestoreV2 onRestore={() => void refresh()} />
            </div>
          </div>

          <TabsContent value="dashboard" className="space-y-5 animate-fade-in">
            <StatsCardsV2
              total={stats.total}
              curios={stats.curios}
              canarios={stats.canarios}
              nascidosAnoAtual={stats.nascidosAnoAtual}
              alertasCount={alertas.length}
            />

            <AlertsPanelV2 alertas={alertas} onClickAlerta={handleAlertClick} />

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <SearchBar value={searchQuery} onChange={buscar} />
              <span className="text-sm text-muted-foreground">{filteredPassaros.length} pássaro(s)</span>
            </div>

            <AdvancedFiltersV2 filters={filters} onChange={setFilters} cores={cores} />

            {filteredPassaros.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <Bird className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="text-lg font-heading">Nenhum pássaro encontrado</p>
                <p className="text-sm">Tente ajustar os filtros ou adicione pássaros na aba Cadastro.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredPassaros.map((passaro) => (
                  <BirdCard key={passaro.id || passaro.anilha} passaro={passaro} onClick={handleCardClick} />
                ))}
              </div>
            )}

            {stats.total >= 2 && <CrossingControlV2 allBirds={allPassaros} />}
          </TabsContent>

          <TabsContent value="cadastro" forceMount className="animate-fade-in">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-card rounded-xl border p-5">
                <BirdFormV2 editingBird={editingBird} allBirds={allPassaros} onSave={handleSave} onClear={() => setEditingBird(null)} />
              </div>

              <div className="space-y-3">
                <h3 className="font-heading font-semibold text-sm text-muted-foreground">Pássaros cadastrados</h3>

                <div className="space-y-2 max-h-[60vh] overflow-y-auto">
                  {allPassaros.map((passaro) => (
                    <div
                      key={passaro.id || passaro.anilha}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors hover:bg-muted ${
                        editingBird?.id === passaro.id ? "border-primary bg-primary/5" : ""
                      }`}
                      onClick={() => setEditingBird(passaro)}
                    >
                      <p className="font-medium text-sm">{passaro.nome}</p>
                      <p className="text-xs text-muted-foreground">
                        {passaro.tipo} • {passaro.anilha}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      <BirdDetailModalV2
        passaro={selectedBird}
        allBirds={allPassaros}
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
      />
    </div>
  );
};

export default IndexV2;
