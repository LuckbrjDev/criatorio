import { useState } from "react";
import { passaroService } from "@/services/passaroService";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { AlertTriangle, CheckCircle } from "lucide-react";

export function CrossingControl() {
  const [bird1, setBird1] = useState("");
  const [bird2, setBird2] = useState("");
  const [result, setResult] = useState<{ permitido: boolean; motivo?: string } | null>(null);
  const allBirds = passaroService.getAll();

  const check = () => {
    if (!bird1 || !bird2) return;
    setResult(passaroService.verificarCruzamento(bird1, bird2));
  };

  return (
    <div className="space-y-3 p-4 rounded-xl border bg-card">
      <h3 className="font-heading font-semibold text-sm">Controle de Cruzamento</h3>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="text-xs">Pássaro 1</Label>
          <Select value={bird1} onValueChange={setBird1}>
            <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
            <SelectContent>
              {allBirds.map((b) => (
                <SelectItem key={b.anilha} value={b.anilha}>{b.nome} ({b.anilha})</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs">Pássaro 2</Label>
          <Select value={bird2} onValueChange={setBird2}>
            <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
            <SelectContent>
              {allBirds.filter((b) => b.anilha !== bird1).map((b) => (
                <SelectItem key={b.anilha} value={b.anilha}>{b.nome} ({b.anilha})</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <Button size="sm" onClick={check} disabled={!bird1 || !bird2} className="w-full">Verificar</Button>
      {result && (
        <div className={`flex items-center gap-2 text-sm p-2 rounded-lg ${result.permitido ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"}`}>
          {result.permitido ? <CheckCircle className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
          {result.permitido ? "Cruzamento permitido." : `Cruzamento não recomendado: ${result.motivo}`}
        </div>
      )}
    </div>
  );
}
