import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { formatDateBR } from "../../lib/format";
import { getPending } from "./moderation.api";
export function ModerationPage() {
  const q = useQuery({ queryKey: ["pending-reviews"], queryFn: getPending });
  if (q.isLoading) return <main className="page">Carregando avaliações…</main>;
  if (q.isError)
    return (
      <main className="page error-state">
        Não foi possível carregar as avaliações.
      </main>
    );
  return (
    <main className="page">
      <p className="eyebrow">Moderação</p>
      <h1>Avaliações pendentes</h1>
      {q.data?.length ? (
        q.data.map((r) => (
          <article className="card" key={r.id}>
            <p>
              {formatDateBR(r.createdAt)} · Experiência{" "}
              {r.overallExperienceRating}/5 · Clareza{" "}
              {r.informationClarityRating}/5 · Processo {r.processEaseRating}/5
            </p>
            <p>
              {r.comment.slice(0, 140)}
              {r.comment.length > 140 ? "…" : ""}
            </p>
            <Link className="button secondary" to={`/moderation/${r.id}`}>
              Ver detalhes
            </Link>
          </article>
        ))
      ) : (
        <p>Nenhuma avaliação pendente.</p>
      )}
    </main>
  );
}
