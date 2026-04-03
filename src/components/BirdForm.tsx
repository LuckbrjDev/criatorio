import { useState, useEffect, useCallback } from "react";
import { Passaro, PassaroFormData, Vacina } from "@/types/Passaro";
import { passaroService } from "@/services/passaroService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon, Plus, Trash2, Upload, X, Save, Bird } from "lucide-react";
import { cn } from "@/lib/utils";

const Field = ({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) => (
  <div className="space-y-1.5">
    <Label className="text-sm font-medium">{label}</Label>
    {children}
    {error && <p className="text-xs text-destructive">{error}</p>}
  </div>
);

interface BirdFormProps {
  editingBird: Passaro | null;
  onSave: () => void;
  onClear: () => void;
}

const emptyForm: PassaroFormData = {
  nome: "",
  tipo: "Curió",
  anilha: "",
  cor: "",
  pai: "",
  mae: "",
  dataNascimento: "",
  vacinas: [],
  alimentacao: "",
  imagens: [],
  audio: "",
  observacoes: "",
};

export function BirdForm({ editingBird, onSave, onClear }: BirdFormProps) {
  const [form, setForm] = useState<PassaroFormData>(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const allBirds = passaroService.getAll();

  useEffect(() => {
    if (editingBird) {
      setForm({
        nome: editingBird.nome,
        tipo: editingBird.tipo,
        anilha: editingBird.anilha,
        cor: editingBird.cor,
        pai: editingBird.pai,
        mae: editingBird.mae,
        dataNascimento: editingBird.dataNascimento,
        vacinas: [...editingBird.vacinas],
        alimentacao: editingBird.alimentacao,
        imagens: [...editingBird.imagens],
        audio: editingBird.audio,
        observacoes: editingBird.observacoes,
      });
      setErrors({});
    }
  }, [editingBird]);

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!form.nome.trim()) e.nome = "Nome é obrigatório.";
    if (!form.tipo) e.tipo = "Tipo é obrigatório.";
    if (!form.anilha.trim()) e.anilha = "Anilha é obrigatória.";
    else if (form.anilha.length > 10) e.anilha = "Máximo 10 caracteres.";
    else if (!/^[a-zA-Z0-9]+$/.test(form.anilha)) e.anilha = "Apenas letras e números.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;

    if (editingBird) {
      const changes: string[] = [];
      if (editingBird.nome !== form.nome) changes.push("nome");
      if (editingBird.cor !== form.cor) changes.push("cor");
      if (editingBird.alimentacao !== form.alimentacao) changes.push("alimentação");
      
      const result = passaroService.update(
        editingBird.anilha,
        form,
        changes.length > 0 ? `Campos alterados: ${changes.join(", ")}` : "Dados atualizados."
      );
      if (result.success) {
        toast.success("Pássaro atualizado com sucesso!");
        onSave();
      } else {
        toast.error(result.error);
      }
    } else {
      const result = passaroService.create(form);
      if (result.success) {
        toast.success("Pássaro cadastrado com sucesso!");
        setForm(emptyForm);
        onSave();
      } else {
        toast.error(result.error);
        if (result.error?.includes("Anilha")) {
          setErrors((prev) => ({ ...prev, anilha: result.error! }));
        }
      }
    }
  };

  const handleDelete = () => {
    if (!editingBird) return;
    passaroService.remove(editingBird.anilha);
    toast.success("Pássaro excluído.");
    setForm(emptyForm);
    onSave();
    onClear();
  };

  const handleNewForm = () => {
    setForm(emptyForm);
    setErrors({});
    onClear();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: "image" | "audio") => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result as string;
      if (type === "image") {
        setForm((f) => ({ ...f, imagens: [...f.imagens, result] }));
      } else {
        setForm((f) => ({ ...f, audio: result }));
      }
    };
    reader.readAsDataURL(file);
  };

  const removeImage = (index: number) => {
    setForm((f) => ({ ...f, imagens: f.imagens.filter((_, i) => i !== index) }));
  };

  const addVacina = () => {
    setForm((f) => ({ ...f, vacinas: [...f.vacinas, { nome: "", data: new Date().toISOString() }] }));
  };

  const updateVacina = (index: number, field: keyof Vacina, value: string) => {
    setForm((f) => ({
      ...f,
      vacinas: f.vacinas.map((v, i) => (i === index ? { ...v, [field]: value } : v)),
    }));
  };

  const removeVacina = (index: number) => {
    setForm((f) => ({ ...f, vacinas: f.vacinas.filter((_, i) => i !== index) }));
  };

  return (

    <ScrollArea className="h-[calc(100vh-12rem)]">
      <div className="space-y-5 pr-4 pb-6">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-lg font-semibold">
            {editingBird ? `Editando: ${editingBird.nome}` : "Novo Cadastro"}
          </h2>
          <Button variant="outline" size="sm" onClick={handleNewForm}>
            <Plus className="w-4 h-4 mr-1" /> Novo
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Nome *" error={errors.nome}>
            <Input value={form.nome} onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))} placeholder="Nome do pássaro" />
          </Field>

          <Field label="Tipo *" error={errors.tipo}>
            <Select value={form.tipo} onValueChange={(v) => setForm((f) => ({ ...f, tipo: v as any }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Curió">Curió</SelectItem>
                <SelectItem value="Canário">Canário</SelectItem>
              </SelectContent>
            </Select>
          </Field>

          <Field label="Anilha *" error={errors.anilha}>
            <Input
              value={form.anilha}
              onChange={(e) => setForm((f) => ({ ...f, anilha: e.target.value.slice(0, 10) }))}
              placeholder="Ex: ABC123"
              disabled={!!editingBird}
            />
          </Field>

          <Field label="Cor">
            <Input value={form.cor} onChange={(e) => setForm((f) => ({ ...f, cor: e.target.value }))} placeholder="Ex: Amarelo" />
          </Field>

          <Field label="Pai">
            <Select value={form.pai} onValueChange={(v) => setForm((f) => ({ ...f, pai: v }))}>
              <SelectTrigger><SelectValue placeholder="Selecione ou deixe em branco" /></SelectTrigger>
              <SelectContent>
                <SelectItem value=" ">Nenhum</SelectItem>
                {allBirds.filter((b) => b.anilha !== form.anilha).map((b) => (
                  <SelectItem key={b.anilha} value={b.anilha}>{b.nome} ({b.anilha})</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              value={form.pai}
              onChange={(e) => setForm((f) => ({ ...f, pai: e.target.value }))}
              placeholder="Ou digite texto livre"
              className="mt-1"
            />
          </Field>

          <Field label="Mãe">
            <Select value={form.mae} onValueChange={(v) => setForm((f) => ({ ...f, mae: v }))}>
              <SelectTrigger><SelectValue placeholder="Selecione ou deixe em branco" /></SelectTrigger>
              <SelectContent>
                <SelectItem value=" ">Nenhuma</SelectItem>
                {allBirds.filter((b) => b.anilha !== form.anilha).map((b) => (
                  <SelectItem key={b.anilha} value={b.anilha}>{b.nome} ({b.anilha})</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              value={form.mae}
              onChange={(e) => setForm((f) => ({ ...f, mae: e.target.value }))}
              placeholder="Ou digite texto livre"
              className="mt-1"
            />
          </Field>
        </div>

        <Field label="Data de Nascimento">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !form.dataNascimento && "text-muted-foreground")}>
                <CalendarIcon className="mr-2 h-4 w-4" />
                {form.dataNascimento ? format(new Date(form.dataNascimento), "dd/MM/yyyy") : "Selecione a data"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={form.dataNascimento ? new Date(form.dataNascimento) : undefined}
                onSelect={(d) => setForm((f) => ({ ...f, dataNascimento: d ? d.toISOString() : "" }))}
                disabled={(d) => d > new Date()}
                initialFocus
                className="p-3 pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </Field>

        {/* Vacinas */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Vacinas</Label>
            <Button variant="outline" size="sm" onClick={addVacina}><Plus className="w-3 h-3 mr-1" /> Adicionar</Button>
          </div>
          {form.vacinas.map((v, i) => (
            <div key={i} className="flex items-center gap-2">
              <Input
                value={v.nome}
                onChange={(e) => updateVacina(i, "nome", e.target.value)}
                placeholder="Nome da vacina"
                className="flex-1"
              />
              <Input
                type="date"
                value={v.data ? v.data.split("T")[0] : ""}
                onChange={(e) => updateVacina(i, "data", new Date(e.target.value).toISOString())}
                className="w-40"
              />
              <Button variant="ghost" size="icon" onClick={() => removeVacina(i)}>
                <Trash2 className="w-4 h-4 text-destructive" />
              </Button>
            </div>
          ))}
        </div>

        <Field label="Alimentação">
          <Textarea value={form.alimentacao} onChange={(e) => setForm((f) => ({ ...f, alimentacao: e.target.value }))} placeholder="Descreva a alimentação..." rows={3} />
        </Field>

        <Field label="Observações">
          <Textarea value={form.observacoes} onChange={(e) => setForm((f) => ({ ...f, observacoes: e.target.value }))} placeholder="Observações adicionais..." rows={3} />
        </Field>

        {/* Images */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Imagens</Label>
          <div className="flex flex-wrap gap-2">
            {form.imagens.map((img, i) => (
              <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden border">
                <img src={img} alt="" className="w-full h-full object-cover" />
                <button onClick={() => removeImage(i)} className="absolute top-0.5 right-0.5 bg-destructive text-destructive-foreground rounded-full p-0.5">
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
            <label className="w-20 h-20 rounded-lg border-2 border-dashed border-border flex items-center justify-center cursor-pointer hover:border-primary transition-colors">
              <Upload className="w-5 h-5 text-muted-foreground" />
              <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, "image")} />
            </label>
          </div>
        </div>

        {/* Audio */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Áudio (canto)</Label>
          {form.audio ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Áudio carregado</span>
              <Button variant="ghost" size="sm" onClick={() => setForm((f) => ({ ...f, audio: "" }))}>
                <X className="w-3 h-3 mr-1" /> Remover
              </Button>
            </div>
          ) : (
            <label className="flex items-center gap-2 p-3 rounded-lg border-2 border-dashed border-border cursor-pointer hover:border-primary transition-colors">
              <Upload className="w-5 h-5 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Carregar áudio</span>
              <input type="file" accept="audio/*" className="hidden" onChange={(e) => handleFileUpload(e, "audio")} />
            </label>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button onClick={handleSave} className="flex-1">
            <Save className="w-4 h-4 mr-1" /> Salvar
          </Button>
          {editingBird && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">
                  <Trash2 className="w-4 h-4 mr-1" /> Excluir
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                  <AlertDialogDescription>
                    Tem certeza que deseja excluir {editingBird.nome} ({editingBird.anilha})? Esta ação não pode ser desfeita.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete}>Excluir</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>
    </ScrollArea>
  );
}
