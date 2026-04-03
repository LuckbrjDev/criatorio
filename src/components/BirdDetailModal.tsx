import { Passaro } from "@/types/Passaro";
import { AudioPlayer } from "@/components/AudioPlayer";
import { GenealogyTree } from "@/components/GenealogyTree";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Bird,
  Calendar,
  Utensils,
  Syringe,
  FileText,
  GitBranch,
  Clock,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useEffect, useState } from "react";

interface BirdDetailModalProps {
  passaro: Passaro | null;
  open: boolean;
  onClose: () => void;
}

export function BirdDetailModal({ passaro, open, onClose }: BirdDetailModalProps) {
  const [imgIndex, setImgIndex] = useState(0);

  useEffect(() => {
    setImgIndex(0);
  }, [passaro]);

  if (!passaro) return null;

  const imagens = Array.isArray(passaro.imagens) ? passaro.imagens : [];
  const vacinas = Array.isArray(passaro.vacinas) ? passaro.vacinas : [];
  const historico = Array.isArray((passaro as any).historico) ? (passaro as any).historico : [];

  const Section = ({
    icon: Icon,
    title,
    children,
  }: {
    icon: any;
    title: string;
    children: React.ReactNode;
  }) => (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
        <Icon className="w-4 h-4 text-primary" />
        {title}
      </div>
      <div className="pl-6 text-sm text-muted-foreground">{children}</div>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] p-0 overflow-hidden">
        <div className="relative aspect-video bg-muted">
          {imagens.length > 0 ? (
            <>
              <img
                src={imagens[imgIndex]}
                alt={passaro.nome}
                className="w-full h-full object-cover"
              />

              {imagens.length > 1 && (
                <>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="absolute left-1 top-1/2 -translate-y-1/2 bg-background/60"
                    onClick={() =>
                      setImgIndex((i) => (i - 1 + imagens.length) % imagens.length)
                    }
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>

                  <Button
                    size="icon"
                    variant="ghost"
                    className="absolute right-1 top-1/2 -translate-y-1/2 bg-background/60"
                    onClick={() =>
                      setImgIndex((i) => (i + 1) % imagens.length)
                    }
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>

                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                    {imagens.map((_, i) => (
                      <div
                        key={i}
                        className={`w-2 h-2 rounded-full ${
                          i === imgIndex ? "bg-primary" : "bg-background/60"
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Bird className="w-16 h-16 text-muted-foreground/30" />
            </div>
          )}
        </div>

        <ScrollArea className="max-h-[50vh]">
          <div className="p-5 space-y-4">
            <DialogHeader>
              <DialogTitle className="font-heading text-xl flex items-center gap-2">
                {passaro.nome}
                <Badge className="bg-primary text-primary-foreground">
                  {passaro.tipo}
                </Badge>
              </DialogTitle>

              <div className="flex gap-3 text-xs text-muted-foreground">
                <span>
                  Anilha: <strong>{passaro.anilha}</strong>
                </span>
                {passaro.cor && (
                  <span>
                    Cor: <strong>{passaro.cor}</strong>
                  </span>
                )}
              </div>
            </DialogHeader>

            <Separator />

            {passaro.dataNascimento && (
              <Section icon={Calendar} title="Data de Nascimento">
                {new Date(passaro.dataNascimento).toLocaleDateString("pt-BR")}
              </Section>
            )}

            <Section icon={GitBranch} title="Genealogia">
              <GenealogyTree passaro={passaro} />
            </Section>

            {vacinas.length > 0 && (
              <Section icon={Syringe} title="Vacinas">
                <ul className="space-y-1">
                  {vacinas.map((v, i) => (
                    <li key={i} className="flex justify-between">
                      <span>{v.nome}</span>
                      <span className="text-xs">
                        {new Date(v.data).toLocaleDateString("pt-BR")}
                      </span>
                    </li>
                  ))}
                </ul>
              </Section>
            )}

            {passaro.alimentacao && (
              <Section icon={Utensils} title="Alimentação">
                {passaro.alimentacao}
              </Section>
            )}

            {passaro.observacoes && (
              <Section icon={FileText} title="Observações">
                {passaro.observacoes}
              </Section>
            )}

            {passaro.audio && (
              <Section icon={Bird} title="Canto">
                <AudioPlayer src={passaro.audio} label="Canto do pássaro" />
              </Section>
            )}

            {historico.length > 0 && (
              <Section icon={Clock} title="Histórico">
                <ul className="space-y-1">
                  {historico
                    .slice()
                    .reverse()
                    .slice(0, 5)
                    .map((h, i) => (
                      <li key={i} className="text-xs">
                        <span className="text-muted-foreground">
                          {new Date(h.data).toLocaleDateString("pt-BR")}
                        </span>{" "}
                        {h.descricao}
                      </li>
                    ))}
                </ul>
              </Section>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}