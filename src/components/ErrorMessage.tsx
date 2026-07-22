interface ErrorMessageProps {
  message: string;
}

export default function ErrorMessage({ message }: ErrorMessageProps) {
  return (
    <div className="glass-panel rounded-xl border-red-500/30 p-4 text-sm text-red-400">
      {message}
    </div>
  );
}
