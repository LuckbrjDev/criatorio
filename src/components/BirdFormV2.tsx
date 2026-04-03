import { ReactNode, useEffect, useState } from "react";
import { CalendarIcon, Plus, Save, Trash2, Upload, X } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { Passaro, PassaroFormData, Vacina } from "@/types/passaro";
import { passaroServiceV2 } from "@/services/passaroServiceV2";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

const NONE_VALUE = "__none__";

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

function Field({ label, error, children }: { label: string; error?: string; children: ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-medium">{label}</Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

interface BirdFormV2Props {
  editingBird: Passaro | null;
  allBirds: Passaro[];
  onSave: () => void;
  onClear: () => void;
}

export function BirdFormV2({ editingBird, allBirds, onSave, onClear }: BirdFormV2Props) {
  const [form, setForm] = useState<PassaroFormData>(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!editingBird) {
      setForm(emptyForm);
      setErrors({});
      return;
    }

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
  }, [editingBird]);

  const validate = () => {
    const nextErrors: Record<string, string> = {};

    if (!form.nome.trim()) nextErrors.nome = "Nome é obrigatório.";
    if (!form.anilha.trim()) nextErrors.anilha = "Anilha é obrigatória.";
    if (form.anilha.length > 10) nextErrors.anilha = "Máximo de 10 caracteres.";
    if (form.anilha && !/^[a-zA-Z0-9]+$/.test(form.anilha)) nextErrors.anilha = "Use apenas letras e números.";

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;

    const result = editingBird
      ? await passaroServiceV2.update(editingBird.anilha, form)
      : await passaroServiceV2.create(form);

    if (!result.success) {
      toast.error(result.error);
      return;
    }

    toast.success(editingBird ? "Pássaro atualizado com sucesso." : "Pássaro cadastrado com sucesso.");
    if (!editingBird) setForm(emptyForm);
    onSave();
  };

  const handleDelete = async () => {
    if (!editingBird) return;

    await passaroServiceV2.remove(editingBird.anilha);
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

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>, type: "image" | "audio") => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (loadEvent) => {
      const result = loadEvent.target?.result as string;
      if (type === "image") {
        setForm((current) => ({ ...current, imagens: [...current.imagens, result] }));
      } else {
        setForm((current) => ({ ...current, audio: result }));
      }
    };
    reader.readAsDataURL(file);
  };

  const updateVacina = (index: number, field: keyof Vacina, value: string) => {
    setForm((current) => ({
      ...current,
      vacinas: current.vacinas.map((vacina, itemIndex) =>
        itemIndex === index ? { ...vacina, [field]: value } : vacina
      ),
    }));
  };

  const parentOptions = allBirds.filter((bird) => bird.anilha !== form.anilha);

  return (
    <ScrollArea className="h-[calc(100vh-12rem)]">
      <div className="space-y-5 pr-4 pb-6">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-lg font-semibold">
            {editingBird ? `Editando: ${editingBird.nome}` : "Novo cadastro"}
          </h2>
          <Button variant="outline" size="sm" onClick={handleNewForm}>
            <Plus className="w-4 h-4 mr-1" /> Novo
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Nome *" error={errors.nome}>
            <Input value={form.nome} onChange={(event) => setForm((current) => ({ ...current, nome: event.target.value }))} />
          </Field>

          <Field label="Tipo">
            <Select value={form.tipo} onValueChange={(value) => setForm((current) => ({ ...current, tipo: value as Passaro["tipo"] }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Curió">Curió</SelectItem>
                <SelectItem value="Canário">Canário</SelectItem>
              </SelectContent>
            </Select>
          </Field>

          <Field label="Anilha *" error={errors.anilha}>
            <Input
              value={form.anilha}
              onChange={(event) => setForm((current) => ({ ...current, anilha: event.target.value.slice(0, 10) }))}
              placeholder="Ex.: ABC123"
              disabled={Boolean(editingBird)}
            />
          </Field>

          <Field label="Cor">
            <Input value={form.cor} onChange={(event) => setForm((current) => ({ ...current, cor: event.target.value }))} />
          </Field>

          <Field label="Pai">
            <Select value={form.pai || NONE_VALUE} onValueChange={(value) => setForm((current) => ({ ...current, pai: value === NONE_VALUE ? "" : value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione ou deixe em branco" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NONE_VALUE}>Nenhum</SelectItem>
                {parentOptions.map((bird) => (
                  <SelectItem key={bird.id || bird.anilha} value={bird.anilha}>
                    {bird.nome} ({bird.anilha})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              value={form.pai}
              onChange={(event) => setForm((current) => ({ ...current, pai: event.target.value }))}
              placeholder="Ou digite texto livre"
              className="mt-1"
            />
          </Field>

          <Field label="Mãe">
            <Select value={form.mae || NONE_VALUE} onValueChange={(value) => setForm((current) => ({ ...current, mae: value === NONE_VALUE ? "" : value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione ou deixe em branco" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NONE_VALUE}>Nenhuma</SelectItem>
                {parentOptions.map((bird) => (
                  <SelectItem key={bird.id || bird.anilha} value={bird.anilha}>
                    {bird.nome} ({bird.anilha})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              value={form.mae}
              onChange={(event) => setForm((current) => ({ ...current, mae: event.target.value }))}
              placeholder="Ou digite texto livre"
              className="mt-1"
            />
          </Field>
        </div>

        <Field label="Data de nascimento">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn("w-full justify-start text-left font-normal", !form.dataNascimento && "text-muted-foreground")}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {form.dataNascimento ? format(new Date(form.dataNascimento), "dd/MM/yyyy") : "Selecione a data"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={form.dataNascimento ? new Date(form.dataNascimento) : undefined}
                onSelect={(date) => setForm((current) => ({ ...current, dataNascimento: date ? date.toISOString() : "" }))}
                disabled={(date) => date > new Date()}
                initialFocus
                className="p-3 pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </Field>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Vacinas</Label>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setForm((current) => ({
                  ...current,
                  vacinas: [...current.vacinas, { nome: "", data: new Date().toISOString() }],
                }))
              }
            >
              <Plus className="w-3 h-3 mr-1" /> Adicionar
            </Button>
          </div>

          {form.vacinas.map((vacina, index) => (
            <div key={index} className="flex items-center gap-2">
              <Input
                value={vacina.nome}
                onChange={(event) => updateVacina(index, "nome", event.target.value)}
                placeholder="Nome da vacina"
                className="flex-1"
              />
              <Input
                type="date"
                value={vacina.data ? vacina.data.split("T")[0] : ""}
                onChange={(event) => updateVacina(index, "data", event.target.value ? new Date(event.target.value).toISOString() : "")}
                className="w-40"
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={() =>
                  setForm((current) => ({
                    ...current,
                    vacinas: current.vacinas.filter((_, itemIndex) => itemIndex !== index),
                  }))
                }
              >
                <Trash2 className="w-4 h-4 text-destructive" />
              </Button>
            </div>
          ))}
        </div>

        <Field label="Alimentação">
          <Textarea
            value={form.alimentacao}
            onChange={(event) => setForm((current) => ({ ...current, alimentacao: event.target.value }))}
            rows={3}
          />
        </Field>

        <Field label="Observações">
          <Textarea
            value={form.observacoes}
            onChange={(event) => setForm((current) => ({ ...current, observacoes: event.target.value }))}
            rows={3}
          />
        </Field>

        <div className="space-y-2">
          <Label className="text-sm font-medium">Imagens</Label>
          <div className="flex flex-wrap gap-2">
            {form.imagens.map((imagem, index) => (
              <div key={index} className="relative w-20 h-20 rounded-lg overflow-hidden border">
                <img src={imagem} alt="" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() =>
                    setForm((current) => ({
                      ...current,
                      imagens: current.imagens.filter((_, itemIndex) => itemIndex !== index),
                    }))
                  }
                  className="absolute top-0.5 right-0.5 bg-destructive text-destructive-foreground rounded-full p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}

            <label className="w-20 h-20 rounded-lg border-2 border-dashed border-border flex items-center justify-center cursor-pointer hover:border-primary transition-colors">
              <Upload className="w-5 h-5 text-muted-foreground" />
              <input type="file" accept="image/*" className="hidden" onChange={(event) => handleFileUpload(event, "image")} />
            </label>
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium">Áudio (canto)</Label>
          {form.audio ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Áudio carregado</span>
              <Button variant="ghost" size="sm" onClick={() => setForm((current) => ({ ...current, audio: "" }))}>
                <X className="w-3 h-3 mr-1" /> Remover
              </Button>
            </div>
          ) : (
            <label className="flex items-center gap-2 p-3 rounded-lg border-2 border-dashed border-border cursor-pointer hover:border-primary transition-colors">
              <Upload className="w-5 h-5 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Carregar áudio</span>
              <input type="file" accept="audio/*" className="hidden" onChange={(event) => handleFileUpload(event, "audio")} />
            </label>
          )}
        </div>

        <div className="flex gap-2 pt-2">
          <Button onClick={() => void handleSave()} className="flex-1">
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
                  <AlertDialogAction onClick={() => void handleDelete()}>Excluir</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>
    </ScrollArea>
  );
}
