"use client";

interface Props {
  saving: boolean;
  // Additional disabled signal — e.g. an upload still in flight. Gates both
  // Save and Delete to prevent races.
  busy?: boolean;
  saveLabel: string;
  savingLabel?: string;
  onDelete?: () => void;
  deleteLabel?: string;
}

export default function FormActions({
  saving,
  busy,
  saveLabel,
  savingLabel = "Saving…",
  onDelete,
  deleteLabel = "Delete",
}: Props) {
  const disabled = saving || Boolean(busy);
  return (
    <div className="flex flex-wrap gap-3 pt-4 border-t border-(--border)">
      <button
        type="submit"
        disabled={disabled}
        className="text-[0.65rem] tracking-[0.3em] uppercase px-6 py-3 bg-(--charcoal) text-(--warm-white) hover:bg-(--gold) transition-colors disabled:opacity-60"
      >
        {saving ? savingLabel : saveLabel}
      </button>
      {onDelete && (
        <button
          type="button"
          onClick={onDelete}
          disabled={disabled}
          className="text-[0.65rem] tracking-[0.3em] uppercase px-6 py-3 border border-(--border) text-(--smoke) hover:text-(--charcoal) hover:border-(--charcoal) transition-colors disabled:opacity-60"
        >
          {deleteLabel}
        </button>
      )}
    </div>
  );
}
