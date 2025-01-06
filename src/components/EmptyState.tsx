interface EmptyStateProps {
  message: string;
}

export default function EmptyState({ message }: EmptyStateProps) {
  return (
    <div className="p-4 bg-yellow-50 text-yellow-600 rounded-lg">
      {message}
    </div>
  );
} 