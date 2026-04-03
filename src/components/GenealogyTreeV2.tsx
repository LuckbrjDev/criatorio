import { useMemo } from "react";
import { Passaro } from "@/types/passaro";

interface TreeNode {
  bird: Passaro;
  pai?: TreeNode | { label: string };
  mae?: TreeNode | { label: string };
}

interface GenealogyTreeV2Props {
  passaro: Passaro;
  allBirds: Passaro[];
}

function NodeBox({ node, level }: { node: TreeNode | { label: string }; level: number }) {
  const isBird = "bird" in node;
  const scale = Math.max(0.75, 1 - level * 0.08);

  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className={`px-3 py-2 rounded-lg border text-center transition-all ${
          isBird ? "bg-card border-primary/30 shadow-sm" : "bg-muted border-border"
        }`}
        style={{ fontSize: `${scale}rem` }}
      >
        {isBird ? (
          <>
            <p className="font-heading font-semibold text-foreground leading-tight">{node.bird.nome}</p>
            <p className="text-muted-foreground" style={{ fontSize: `${scale * 0.75}rem` }}>
              {node.bird.anilha}
            </p>
          </>
        ) : (
          <p className="text-muted-foreground italic">{node.label}</p>
        )}
      </div>

      {isBird && (node.pai || node.mae) && (
        <div className="flex gap-4 mt-1">
          <div className="flex flex-col items-center">
            <span className="text-[10px] text-muted-foreground mb-0.5">Pai</span>
            <div className="w-px h-3 bg-border" />
            {node.pai ? (
              <NodeBox node={node.pai} level={level + 1} />
            ) : (
              <div className="px-2 py-1 rounded bg-muted text-muted-foreground text-xs italic">Desconhecido</div>
            )}
          </div>

          <div className="flex flex-col items-center">
            <span className="text-[10px] text-muted-foreground mb-0.5">Mãe</span>
            <div className="w-px h-3 bg-border" />
            {node.mae ? (
              <NodeBox node={node.mae} level={level + 1} />
            ) : (
              <div className="px-2 py-1 rounded bg-muted text-muted-foreground text-xs italic">Desconhecida</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export function GenealogyTreeV2({ passaro, allBirds }: GenealogyTreeV2Props) {
  const findBirdByRef = (id: string | undefined) => {
    if (!id?.trim()) return undefined;
    return allBirds.find((bird) => bird.id === id || bird.anilha === id);
  };

  const buildNode = (id: string | undefined, depth: number): TreeNode | { label: string } | undefined => {
    if (!id?.trim()) return undefined;

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
