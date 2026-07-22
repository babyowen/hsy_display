interface EmptyStateProps {
  message: string;
}

export default function EmptyState({ message }: EmptyStateProps) {
  return (
    <div className="glass-panel rounded-xl p-4 text-sm text-amber-300">
      {message}
    </div>
  );
}
