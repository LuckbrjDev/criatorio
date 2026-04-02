import { Passaro } from "@/types/Passaro";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import { toast } from "sonner";

interface PdfReportProps {
  passaros: Passaro[];
}

export function PdfReport({ passaros }: PdfReportProps) {
  const generateReport = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      toast.error("Permita pop-ups para gerar o relatório.");
      return;
    }

    const hoje = new Date().toLocaleDateString("pt-BR");
    const curios = passaros.filter((p) => p.tipo === "Curió").length;
    const canarios = passaros.filter((p) => p.tipo === "Canário").length;

    const rows = passaros
      .map(
        (p) => `
        <tr>
          <td>${p.nome}</td>
          <td>${p.tipo}</td>
          <td>${p.anilha}</td>
          <td>${p.cor || "-"}</td>
          <td>${p.dataNascimento ? new Date(p.dataNascimento).toLocaleDateString("pt-BR") : "-"}</td>
          <td>${p.pai || "-"}</td>
          <td>${p.mae || "-"}</td>
          <td>${p.vacinas.map((v) => v.nome).join(", ") || "-"}</td>
          <td>${p.alimentacao || "-"}</td>
          <td>${p.observacoes || "-"}</td>
        </tr>`
      )
      .join("");

    printWindow.document.write(`
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="utf-8" />
        <title>Relatório - Criadouro Manager</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #1a1a1a; padding: 32px; }
          .header { text-align: center; margin-bottom: 24px; border-bottom: 2px solid #2d7a4f; padding-bottom: 16px; }
          .header h1 { font-size: 22px; color: #2d7a4f; }
          .header p { font-size: 12px; color: #666; margin-top: 4px; }
          .stats { display: flex; gap: 16px; justify-content: center; margin-bottom: 20px; }
          .stat { padding: 8px 16px; border: 1px solid #ddd; border-radius: 8px; text-align: center; }
          .stat strong { font-size: 18px; display: block; color: #2d7a4f; }
          .stat span { font-size: 11px; color: #666; }
          table { width: 100%; border-collapse: collapse; font-size: 11px; }
          th { background: #2d7a4f; color: white; padding: 8px 6px; text-align: left; font-weight: 600; }
          td { padding: 6px; border-bottom: 1px solid #eee; vertical-align: top; }
          tr:nth-child(even) { background: #f8faf8; }
          .footer { text-align: center; margin-top: 24px; font-size: 10px; color: #999; }
          @media print { body { padding: 16px; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Criadouro Manager - Relatório de Pássaros</h1>
          <p>Gerado em ${hoje}</p>
        </div>
        <div class="stats">
          <div class="stat"><strong>${passaros.length}</strong><span>Total</span></div>
          <div class="stat"><strong>${curios}</strong><span>Curiós</span></div>
          <div class="stat"><strong>${canarios}</strong><span>Canários</span></div>
        </div>
        <table>
          <thead>
            <tr>
              <th>Nome</th><th>Tipo</th><th>Anilha</th><th>Cor</th><th>Nascimento</th>
              <th>Pai</th><th>Mãe</th><th>Vacinas</th><th>Alimentação</th><th>Obs.</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
        <div class="footer">Criadouro Manager &copy; ${new Date().getFullYear()}</div>
        <script>window.onload = function() { window.print(); }</script>
      </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <Button variant="outline" size="sm" onClick={generateReport} className="gap-1.5">
      <FileText className="w-4 h-4" /> Relatório PDF
    </Button>
  );
}
