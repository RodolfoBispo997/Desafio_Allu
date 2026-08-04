import { Link } from "react-router-dom";
export function HomePage() {
  return (
    <main className="page">
      <p className="eyebrow">Investment Review</p>
      <h1>Fluxos do desafio</h1>
      <p>
        Use os links abaixo para demonstrar a experiência do cliente e a
        moderação.
      </p>
      <div className="actions">
        <Link className="button" to="/review/valid-review-invitation">
          Avaliação com convite válido
        </Link>
        <Link className="button secondary" to="/moderation">
          Moderação
        </Link>
      </div>
    </main>
  );
}
