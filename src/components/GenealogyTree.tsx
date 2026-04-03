import { useEffect, useMemo, useState } from "react";
import { Passaro } from "@/types/Passaro";
import { passaroService } from "@/services/passaroService";

interface TreeNode {
  bird: Passaro;
  pai?: TreeNode | { label: string };
  mae?: TreeNode | { label: string };
}

interface GenealogyTreeProps {
  passaro: Passaro;
}

function NodeBox({
  node,
  level,
}: {
  node: TreeNode | { label: string };
  level: number;
}) {
  const isBird = "bird" in node;
  const scale = Math.max(0.75, 1 - level * 0.08);

  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className={`px-3 py-2 rounded-lg border text-center transition-all ${
          isBird
            ? "bg-card border-primary/30 shadow-sm"
            : "bg-muted border-border"
        }`}
        style={{ fontSize: `${scale}rem` }}
      >
        {isBird ? (
          <>
            <p className="font-heading font-semibold text-foreground leading-tight">
              {(node as TreeNode).bird.nome}
            </p>
            <p
              className="text-muted-foreground"
              style={{ fontSize: `${scale * 0.75}rem` }}
            >
              {(node as TreeNode).bird.anilha}
            </p>
          </>
        ) : (
          <p className="text-muted-foreground italic">
            {(node as { label: string }).label}
          </p>
        )}
      </div>

      {isBird && (((node as TreeNode).pai) || ((node as TreeNode).mae)) && (
        <div className="flex gap-4 mt-1">
          <div className="flex flex-col items-center">
            <span className="text-[10px] text-muted-foreground mb-0.5">Pai</span>
            <div className="w-px h-3 bg-border" />
            {(node as TreeNode).pai ? (
              <NodeBox node={(node as TreeNode).pai!} level={level + 1} />
            ) : (
              <div className="px-2 py-1 rounded bg-muted text-muted-foreground text-xs italic">
                Desconhecido
              </div>
            )}
          </div>

          <div className="flex flex-col items-center">
            <span className="text-[10px] text-muted-foreground mb-0.5">Mãe</span>
            <div className="w-px h-3 bg-border" />
            {(node as TreeNode).mae ? (
              <NodeBox node={(node as TreeNode).mae!} level={level + 1} />
            ) : (
              <div className="px-2 py-1 rounded bg-muted text-muted-foreground text-xs italic">
                Desconhecida
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export function GenealogyTree({ passaro }: GenealogyTreeProps) {
  const [allBirds, setAllBirds] = useState<Passaro[]>([]);

  useEffect(() => {
    const loadBirds = async () => {
      const data = await passaroService.getAll();
      setAllBirds(Array.isArray(data) ? data : []);
    };

    loadBirds();
  }, []);

  const findBirdByRef = (id: string | undefined) => {
    if (!id || !id.trim()) return undefined;

    return allBirds.find(
      (bird) => bird.id === id || bird.anilha === id
    );
  };

  const buildNode = (
    id: string | undefined,
    depth: number
  ): TreeNode | { label: string } | undefined => {
    if (!id || !id.trim()) return undefined;

    const bird = findBirdByRef(id);

    if (!bird) return { label: id };
    if (depth <= 0) return { bird };

    return {
      bird,
      pai: buildNode(bird.pai, depth - 1),
      mae: buildNode(bird.mae, depth - 1),
    };
  };

  const tree = useMemo<TreeNode>(
    () => ({
      bird: passaro,
      pai: buildNode(passaro.pai, 2),
      mae: buildNode(passaro.mae, 2),
    }),
    [passaro, allBirds]
  );

  return (
    <div className="overflow-x-auto p-4">
      <div className="flex justify-center min-w-fit">
        <NodeBox node={tree} level={0} />
      </div>
    </div>
  );
}