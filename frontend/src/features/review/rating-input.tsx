export function RatingInput({
  label,
  value,
  onChange,
  error,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  error?: string;
}) {
  return (
    <fieldset className="rating">
      <legend>{label}</legend>
      <div>
        {[1, 2, 3, 4, 5].map((rating) => (
          <button
            type="button"
            className={rating <= value ? "selected" : ""}
            onClick={() => onChange(rating)}
            aria-label={`${label}: ${rating} de 5`}
            key={rating}
          >
            ★
          </button>
        ))}
      </div>
      {error && <small className="error">{error}</small>}
    </fieldset>
  );
}
