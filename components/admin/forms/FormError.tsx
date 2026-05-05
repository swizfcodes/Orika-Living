interface Props {
  message: string | null;
}

export default function FormError({ message }: Props) {
  if (!message) return null;
  return (
    <p className="text-sm text-(--gold) border-l-2 border-(--gold) pl-3">
      {message}
    </p>
  );
}
