import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useParams } from "react-router-dom";
import { z } from "zod";
import { formatCurrencyBRL, formatDateBR } from "../../lib/format";
import { getInvitation, submitReview } from "./review.api";
import { RatingInput } from "./rating-input";
const schema = z.object({
  overallExperienceRating: z.number().int().min(1),
  informationClarityRating: z.number().int().min(1),
  processEaseRating: z.number().int().min(1),
  comment: z.string().min(10).max(2000),
  policyAccepted: z.boolean().refine((value) => value === true, {
    message: "Você precisa aceitar a política de avaliações.",
  }),
});
type Form = z.infer<typeof schema>;
const closure: Record<string, string> = {
  REACHED_MATURITY: "Vencimento",
  REDEEMED_EARLY: "Resgate antecipado",
  OTHER: "Outro motivo",
};
const errorMessage = (status?: number) =>
  ({
    404: "Convite não encontrado.",
    409: "Este convite já foi utilizado.",
    410: "Este convite expirou.",
    422: "Este investimento não está disponível para avaliação.",
  })[status ?? 0] ?? "Não foi possível carregar o convite.";
export function ReviewPage() {
  const { token = "" } = useParams();
  const invitation = useQuery({
    queryKey: ["invitation", token],
    queryFn: () => getInvitation(token),
  });
  const [files, setFiles] = useState<File[]>([]);
  const [success, setSuccess] = useState(false);
  const form = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: {
      overallExperienceRating: 0,
      informationClarityRating: 0,
      processEaseRating: 0,
      comment: "",
      policyAccepted: false,
    },
  });
  const mutation = useMutation({
    mutationFn: (data: Form) =>
      submitReview(token, { ...data, attachments: files }),
    onSuccess: () => setSuccess(true),
    onError: () =>
      form.setError("root", {
        message: "Não foi possível enviar a avaliação. Tente novamente.",
      }),
  });
  if (invitation.isLoading)
    return <main className="page">Carregando convite…</main>;
  if (invitation.isError)
    return (
      <main className="page error-state">
        {errorMessage(
          (invitation.error as { response?: { status?: number } }).response
            ?.status,
        )}
      </main>
    );
  if (success)
    return (
      <main className="page success">
        <h1>Avaliação enviada</h1>
        <p>Obrigado por compartilhar sua experiência.</p>
        <p>
          Sua avaliação foi recebida e será analisada antes de qualquer
          publicação.
        </p>
      </main>
    );
  const data = invitation.data!;
  const addFiles = (selected: FileList | null) => {
    const next = [...files, ...Array.from(selected ?? [])];
    if (
      next.length > 3 ||
      next.some(
        (file) =>
          file.size > 5 * 1024 * 1024 ||
          !["application/pdf", "image/jpeg", "image/png"].includes(file.type),
      )
    ) {
      form.setError("root", {
        message: "Use até 3 arquivos PDF, JPEG ou PNG de no máximo 5 MB.",
      });
      return;
    }
    setFiles(next);
  };
  return (
    <main className="page">
      <p className="eyebrow">Avaliação de investimento</p>
      <h1>{data.investment.productName}</h1>
      <section className="card grid">
        <span>
          Cliente<strong>{data.investment.customerName}</strong>
        </span>
        <span>
          Valor
          <strong>{formatCurrencyBRL(data.investment.investedAmount)}</strong>
        </span>
        <span>
          Início<strong>{formatDateBR(data.investment.startedAt)}</strong>
        </span>
        <span>
          Encerramento<strong>{formatDateBR(data.investment.closedAt)}</strong>
        </span>
        <span>
          Motivo
          <strong>
            {data.investment.closureReason
              ? closure[data.investment.closureReason]
              : "—"}
          </strong>
        </span>
      </section>
      <form
        className="card form"
        onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
      >
        <h2>Conte sua experiência</h2>
        <RatingInput
          label="Experiência geral"
          value={form.watch("overallExperienceRating")}
          onChange={(value) =>
            form.setValue("overallExperienceRating", value, {
              shouldValidate: true,
            })
          }
        />
        {form.formState.errors.overallExperienceRating && (
          <p className="error">Selecione uma nota para experiência geral.</p>
        )}
        <RatingInput
          label="Clareza das informações"
          value={form.watch("informationClarityRating")}
          onChange={(value) =>
            form.setValue("informationClarityRating", value, {
              shouldValidate: true,
            })
          }
        />
        {form.formState.errors.informationClarityRating && (
          <p className="error">Selecione uma nota para clareza.</p>
        )}
        <RatingInput
          label="Facilidade do processo"
          value={form.watch("processEaseRating")}
          onChange={(value) =>
            form.setValue("processEaseRating", value, { shouldValidate: true })
          }
        />
        {form.formState.errors.processEaseRating && (
          <p className="error">Selecione uma nota para facilidade.</p>
        )}
        <label>
          Comentário
          <textarea {...form.register("comment")} maxLength={2000} />
          <small>{form.watch("comment").length}/2000</small>
        </label>
        {form.formState.errors.comment && (
          <p className="error">
            O comentário deve ter entre 10 e 2000 caracteres.
          </p>
        )}
        <label>
          Anexos opcionais (PDF, JPEG ou PNG; até 3 arquivos, 5 MB cada)
          <input
            type="file"
            multiple
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={(event) => addFiles(event.target.files)}
          />
        </label>
        <ul>
          {files.map((file, index) => (
            <li key={`${file.name}-${index}`}>
              {file.name} ({(file.size / 1024).toFixed(1)} KB){" "}
              <button
                type="button"
                onClick={() => setFiles(files.filter((_, i) => i !== index))}
              >
                Remover
              </button>
            </li>
          ))}
        </ul>
        <label className="check">
          <input type="checkbox" {...form.register("policyAccepted")} /> Li e
          concordo com a política de avaliações.
        </label>
        {form.formState.errors.policyAccepted && (
          <p className="error">
            {form.formState.errors.policyAccepted.message}
          </p>
        )}
        <p>
          Política de avaliações — versão {data.policy.version}. A avaliação
          poderá ser analisada antes de qualquer publicação.
        </p>
        {form.formState.errors.root && (
          <p className="error">{form.formState.errors.root.message}</p>
        )}
        <button className="button" disabled={mutation.isPending}>
          Enviar avaliação
        </button>
      </form>
    </main>
  );
}
