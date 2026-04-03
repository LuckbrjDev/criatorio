import { useEffect, useMemo, useState } from "react";
import { Passaro } from "@/types/Passaro";
import { passaroService } from "@/services/passaroService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertTriangle, GitBranch } from "lucide-react";

export function CrossingControl() {
  const [allBirds, setAllBirds] = useState<Passaro[]>([]);
  const [paiId, setPaiId] = useState("");
  const [maeId, setMaeId] = useState("");

  useEffect(() => {
    const loadBirds = async () => {
      const data = await passaroService.getAll();
      setAllBirds(Array.isArray(data) ? data : []);
    };

    loadBirds();
  }, []);

  const pai = useMemo(
    () => allBirds.find((bird) => bird.id === paiId || bird.anilha === paiId) || null,
    [allBirds, paiId]
  );

  const mae = useMemo(
    () => allBirds.find((bird) => bird.id === maeId || bird.anilha === maeId) || null,
    [allBirds, maeId]
  );

  const getAncestors = (bird: Passaro | null, depth = 3, visited = new Set<string>()): Set<string> => {
    const ancestors = new Set<string>();

    if (!bird || depth <= 0) return ancestors;

    const ref = bird.id || bird.anilha;
    if (!ref || visited.has(ref)) return ancestors;

    visited.add(ref);

    const paiBird =
      allBirds.find((b) => b.id === bird.pai || b.anilha === bird.pai) || null;
    const maeBird =
      allBirds.find((b) => b.id === bird.mae || b.anilha === bird.mae) || null;

    if (paiBird) {
      const paiRef = paiBird.id || paiBird.anilha;
      if (paiRef) ancestors.add(paiRef);

      getAncestors(paiBird, depth - 1, visited).forEach((item) => ancestors.add(item));
    }

    if (maeBird) {
      const maeRef = maeBird.id || maeBird.anilha;
      if (maeRef) ancestors.add(maeRef);

      getAncestors(maeBird, depth - 1, visited).forEach((item) => ancestors.add(item));
    }

    return ancestors;
  };

  const crossingRisk = useMemo(() => {
    if (!pai || !mae) return null;

    const paiRef = pai.id || pai.anilha;
    const maeRef = mae.id || mae.anilha;

    if (paiRef && maeRef && paiRef === maeRef) {
      return {
        risco: true,
        motivo: "O mesmo pássaro foi selecionado como pai e mãe.",
      };
    }

    const paiAncestors = getAncestors(pai);
    const maeAncestors = getAncestors(mae);

    const commonAncestors = [...paiAncestors].filter((ancestor) => maeAncestors.has(ancestor));

    if (commonAncestors.length > 0) {
      return {
        risco: true,
        motivo: "Os pássaros possuem ancestrais em comum.",
      };
    }

    if ((pai.pai && (pai.pai === mae.id || pai.pai === mae.anilha)) || (pai.mae && (pai.mae === mae.id || pai.mae === mae.anilha))) {
      return {
        risco: true,
        motivo: "A mãe selecionada está na linhagem direta do pai.",
      };
    }

    if ((mae.pai && (mae.pai === pai.id || mae.pai === pai.anilha)) || (mae.mae && (mae.mae === pai.id || mae.mae === pai.anilha))) {
      return {
        risco: true,
        motivo: "O pai selecionado está na linhagem direta da mãe.",
      };
    }

    return {
      risco: false,
      motivo: "Nenhum risco de consanguinidade detectado nas gerações analisadas.",
    };
  }, [pai, mae, allBirds]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GitBranch className="w-5 h-5" />
          Controle de Cruzamento
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-1 block">Pai</label>
            <Select value={paiId} onValueChange={setPaiId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o pai" />
              </SelectTrigger>
              <SelectContent>
                {allBirds.map((bird) => (
                  <SelectItem key={bird.id ?? bird.anilha} value={bird.id ?? bird.anilha}>
                    {bird.nome} ({bird.anilha})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">Mãe</label>
            <Select value={maeId} onValueChange={setMaeId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a mãe" />
              </SelectTrigger>
              <SelectContent>
                {allBirds.map((bird) => (
                  <SelectItem key={bird.id ?? bird.anilha} value={bird.id ?? bird.anilha}>
                    {bird.nome} ({bird.anilha})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {crossingRisk && (
          <div
            className={`rounded-lg border p-3 text-sm ${
              crossingRisk.risco
                ? "border-destructive/40 bg-destructive/10 text-destructive"
                : "border-green-500/40 bg-green-500/10 text-green-700"
            }`}
          >
            <div className="flex items-start gap-2">
              {crossingRisk.risco && <AlertTriangle className="w-4 h-4 mt-0.5" />}
              <span>{crossingRisk.motivo}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}