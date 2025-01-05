export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
}

export function cn(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export const fetcher = async (url: string) => {
  const response = await fetch(url);
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    console.error('API Error:', {
      status: response.status,
      statusText: response.statusText,
      errorData
    });
    throw new Error(
      `API error: ${response.status} - ${errorData?.error || response.statusText}`
    );
  }
  
  return response.json();
}; 