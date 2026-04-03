import { AlertTriangle, Info } from "lucide-react";
import { AlertaPassaro } from "@/types/passaro";

interface AlertsPanelV2Props {
  alertas: AlertaPassaro[];
  onClickAlerta?: (passaroId: string) => void;
}

export function AlertsPanelV2({ alertas, onClickAlerta }: AlertsPanelV2Props) {
  if (alertas.length === 0) return null;

  return (
    <div className="rounded-xl border border-warning/30 bg-warning/5 p-4 space-y-2">
      <h3 className="font-heading font-semibold text-sm flex items-center gap-2 text-warning">
        <AlertTriangle className="w-4 h-4" /> Alertas ({alertas.length})
      </h3>
      <ul className="space-y-1.5 max-h-32 overflow-y-auto">
        {alertas.map((alerta, index) => (
          <li
            key={`${alerta.passaroId}-${index}`}
            className="text-xs text-muted-foreground flex items-start gap-2 cursor-pointer hover:text-foreground transition-colors"
            onClick={() => onClickAlerta?.(alerta.passaroId)}
          >
            {alerta.tipo === "vacina" ? (
              <AlertTriangle className="w-3 h-3 mt-0.5 text-warning shrink-0" />
            ) : (
              <Info className="w-3 h-3 mt-0.5 text-info shrink-0" />
            )}
            <span>{alerta.mensagem}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
