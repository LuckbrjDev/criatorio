import { useMemo, useState } from "react";
import { AlertTriangle, GitBranch } from "lucide-react";
import { Passaro } from "@/types/passaro";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface CrossingControlV2Props {
  allBirds: Passaro[];
}

export function CrossingControlV2({ allBirds }: CrossingControlV2Props) {
  const [paiId, setPaiId] = useState("");
  const [maeId, setMaeId] = useState("");

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

    const paiBird = allBirds.find((candidate) => candidate.id === bird.pai || candidate.anilha === bird.pai) || null;
    const maeBird = allBirds.find((candidate) => candidate.id === bird.mae || candidate.anilha === bird.mae) || null;

    if (paiBird) {
      ancestors.add(paiBird.id || paiBird.anilha);
      getAncestors(paiBird, depth - 1, visited).forEach((ancestor) => ancestors.add(ancestor));
    }

    if (maeBird) {
      ancestors.add(maeBird.id || maeBird.anilha);
      getAncestors(maeBird, depth - 1, visited).forEach((ancestor) => ancestors.add(ancestor));
    }

    return ancestors;
  };

  const crossingRisk = useMemo(() => {
    if (!pai || !mae) return null;

    const paiRef = pai.id || pai.anilha;
    const maeRef = mae.id || mae.anilha;

    if (paiRef === maeRef) {
      return { risco: true, motivo: "O mesmo pássaro foi selecionado como pai e mãe." };
    }

    const paiAncestors = getAncestors(pai);
    const maeAncestors = getAncestors(mae);
    const commonAncestors = [...paiAncestors].filter((ancestor) => maeAncestors.has(ancestor));

    if (commonAncestors.length > 0) {
      return { risco: true, motivo: "Os pássaros possuem ancestrais em comum." };
    }

    if ((pai.pai && (pai.pai === maeRef)) || (pai.mae && pai.mae === maeRef)) {
      return { risco: true, motivo: "A mãe selecionada está na linhagem direta do pai." };
    }

    if ((mae.pai && mae.pai === paiRef) || (mae.mae && mae.mae === paiRef)) {
      return { risco: true, motivo: "O pai selecionado está na linhagem direta da mãe." };
    }

    return { risco: false, motivo: "Nenhum risco de consanguinidade detectado nas gerações analisadas." };
  }, [pai, mae, allBirds]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GitBranch className="w-5 h-5" />
          Controle de cruzamento
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
                  <SelectItem key={bird.id || bird.anilha} value={bird.id || bird.anilha}>
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
                  <SelectItem key={bird.id || bird.anilha} value={bird.id || bird.anilha}>
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
