import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { formatDateBR } from "../../lib/format";
import { approveReview, getReview, rejectReview } from "./moderation.api";
export function ModerationDetailPage() {
  const { id = "" } = useParams();
  const nav = useNavigate(),
    qc = useQueryClient(),
    [reason, setReason] = useState(""),
    [reject, setReject] = useState(false);
  const q = useQuery({
    queryKey: ["review", id],
    queryFn: () => getReview(id),
  });
  const done = () => {
    qc.invalidateQueries({ queryKey: ["pending-reviews"] });
    qc.invalidateQueries({ queryKey: ["review", id] });
    nav("/moderation");
  };
  const approve = useMutation({
    mutationFn: () => approveReview(id),
    onSuccess: done,
  });
  const decline = useMutation({
    mutationFn: () => rejectReview(id, reason.trim()),
    onSuccess: done,
  });
  if (q.isLoading) return <main className="page">Carregando…</main>;
  if (!q.data)
    return <main className="page error-state">Avaliação não encontrada.</main>;
  const r = q.data;
  return (
    <main className="page">
      <h1>Detalhe da avaliação</h1>
      <article className="card">
        <p>
          Experiência geral: {r.overallExperienceRating}/5 · Clareza:{" "}
          {r.informationClarityRating}/5 · Facilidade: {r.processEaseRating}/5
        </p>
        <p>{r.comment}</p>
        <p>
          Status:{" "}
          {r.status === "PENDING_MODERATION"
            ? "Pendente de moderação"
            : r.status}{" "}
          · Política {r.policyVersion} · Aceita em{" "}
          {formatDateBR(r.policyAcceptedAt)} · Enviada em{" "}
          {formatDateBR(r.createdAt)}
        </p>
        <h2>Anexos</h2>
        {r.attachments.length ? (
          <ul>
            {r.attachments.map((a) => (
              <li key={a.id}>
                {a.originalFileName} · {a.mimeType} ·{" "}
                {(a.fileSize / 1024).toFixed(1)} KB
              </li>
            ))}
          </ul>
        ) : (
          <p>Sem anexos.</p>
        )}
        <div className="actions">
          <button
            className="button"
            disabled={approve.isPending || decline.isPending}
            onClick={() => approve.mutate()}
          >
            Aprovar avaliação
          </button>
          <button
            className="button danger"
            disabled={approve.isPending || decline.isPending}
            onClick={() => setReject(!reject)}
          >
            Rejeitar avaliação
          </button>
        </div>
        {reject && (
          <section className="form">
            <label>
              Motivo
              <textarea
                value={reason}
                maxLength={1000}
                onChange={(e) => setReason(e.target.value)}
              />
            </label>
            <button
              className="button danger"
              disabled={!reason.trim() || decline.isPending}
              onClick={() => decline.mutate()}
            >
              Confirmar rejeição
            </button>
          </section>
        )}
        {(approve.isError || decline.isError) && (
          <p className="error">Não foi possível moderar a avaliação.</p>
        )}
      </article>
    </main>
  );
}
