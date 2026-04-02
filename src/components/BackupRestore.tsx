import { useRef } from "react";
import { passaroService } from "@/services/passaroService";
import { Button } from "@/components/ui/button";
import { Download, Upload } from "lucide-react";
import { toast } from "sonner";

interface BackupRestoreProps {
  onRestore: () => void;
}

export function BackupRestore({ onRestore }: BackupRestoreProps) {
  const fileRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    const data = passaroService.exportarDados();
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `criadouro_backup_${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Backup exportado com sucesso!");
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = passaroService.importarDados(ev.target?.result as string);
      if (result.success) {
        toast.success("Dados importados com sucesso!");
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
      <Button variant="outline" size="sm" onClick={handleExport}>
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
