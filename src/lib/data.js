const DATA_ROOT = `${import.meta.env.BASE_URL}data`;

export async function fetchIndex() {
  const response = await fetch(`${DATA_ROOT}/index.json`, { cache: 'no-cache' });
  if (!response.ok) {
    throw new Error('Не удалось загрузить индекс брифингов');
  }

  const data = await response.json();
  return {
    ...data,
    briefings: [...data.briefings].sort((a, b) => b.date.localeCompare(a.date)),
  };
}

export async function fetchBrief(date) {
  const response = await fetch(`${DATA_ROOT}/${date}/brief.json`, { cache: 'no-cache' });
  if (!response.ok) {
    throw new Error('Брифинг не найден');
  }

  return response.json();
}

export function chartUrl(date) {
  return `${DATA_ROOT}/${date}/chart.png`;
}

export function formatDate(value) {
  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(new Date(`${value}T12:00:00Z`));
}
