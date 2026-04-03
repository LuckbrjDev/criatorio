import { useRef } from "react";
import { Download, Upload } from "lucide-react";
import { toast } from "sonner";
import { passaroServiceV2 } from "@/services/passaroServiceV2";
import { Button } from "@/components/ui/button";

interface BackupRestoreV2Props {
  onRestore: () => void;
}

export function BackupRestoreV2({ onRestore }: BackupRestoreV2Props) {
  const fileRef = useRef<HTMLInputElement>(null);

  const handleExport = async () => {
    const data = await passaroServiceV2.exportarDados();
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `criadouro_backup_${new Date().toISOString().split("T")[0]}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
    toast.success("Backup exportado com sucesso.");
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (loadEvent) => {
      const result = await passaroServiceV2.importarDados((loadEvent.target?.result as string) || "");
      if (result.success) {
        toast.success("Dados importados com sucesso.");
        onRestore();
      } else {
        toast.error(result.error);
      }
    };

    reader.readAsText(file);
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <div className="flex gap-2">
      <Button variant="outline" size="sm" onClick={() => void handleExport()}>
        <Download className="w-4 h-4 mr-1" /> Exportar
      </Button>
      <label>
        <Button variant="outline" size="sm" asChild>
          <span className="cursor-pointer">
            <Upload className="w-4 h-4 mr-1" /> Importar
          </span>
        </Button>
        <input ref={fileRef} type="file" accept=".json" className="hidden" onChange={handleImport} />
      </label>
    </div>
  );
}
