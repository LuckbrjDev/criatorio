import { AlertTriangle, BarChart3, Bird, Sparkles } from "lucide-react";

interface StatsCardsV2Props {
  total: number;
  curios: number;
  canarios: number;
  nascidosAnoAtual: number;
  alertasCount: number;
}

export function StatsCardsV2({
  total,
  curios,
  canarios,
  nascidosAnoAtual,
  alertasCount,
}: StatsCardsV2Props) {
  const cards = [
    { label: "Total de pássaros", value: total, icon: Bird, color: "text-primary" },
    { label: "Curiós", value: curios, icon: Sparkles, color: "text-accent" },
    { label: "Canários", value: canarios, icon: BarChart3, color: "text-info" },
    { label: "Nascidos este ano", value: nascidosAnoAtual, icon: Bird, color: "text-success" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {cards.map((card) => (
        <div key={card.label} className="stat-card flex items-center gap-3">
          <div className={`p-2 rounded-lg bg-muted ${card.color}`}>
            <card.icon className="w-5 h-5" />
          </div>
          <div>
            <p className="text-2xl font-heading font-bold">{card.value}</p>
            <p className="text-xs text-muted-foreground">{card.label}</p>
          </div>
        </div>
      ))}

      {alertasCount > 0 && (
        <div className="stat-card flex items-center gap-3 border-warning/50">
          <div className="p-2 rounded-lg bg-warning/10 text-warning">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-2xl font-heading font-bold">{alertasCount}</p>
            <p className="text-xs text-muted-foreground">Alertas</p>
          </div>
        </div>
      )}
    </div>
  );
}
