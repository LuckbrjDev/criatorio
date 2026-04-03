import { Passaro } from "@/types/passaro";
import { Bird } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface BirdCardProps {
  passaro: Passaro;
  onClick: (passaro: Passaro) => void;
}

export function BirdCard({ passaro, onClick }: BirdCardProps) {
  return (
    <div className="bird-card animate-fade-in" onClick={() => onClick(passaro)}>
      <div className="aspect-[4/3] bg-muted relative overflow-hidden">
        {passaro.imagens.length > 0 ? (
          <img
            src={passaro.imagens[0]}
            alt={passaro.nome}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Bird className="w-12 h-12 text-muted-foreground/40" />
          </div>
        )}
        <Badge className="absolute top-2 right-2 bg-primary text-primary-foreground text-xs">
          {passaro.tipo}
        </Badge>
      </div>
      <div className="p-3">
        <h3 className="font-heading font-semibold text-foreground truncate">{passaro.nome}</h3>
        <div className="flex items-center justify-between mt-1">
          <span className="text-xs text-muted-foreground">Anilha: {passaro.anilha}</span>
          {passaro.cor && (
            <span className="text-xs text-muted-foreground">{passaro.cor}</span>
          )}
        </div>
      </div>
    </div>
  );
}
