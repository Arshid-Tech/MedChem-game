const rawUrl = import.meta.env.VITE_API_URL as string | undefined;
const API_BASE = rawUrl
  ? rawUrl.startsWith('http')
    ? `${rawUrl}/api`
    : `https://${rawUrl}/api`
  : '/api';

export function getAccessToken(): string | null {
  return localStorage.getItem('medchem_access_token');
}

export function setTokens(access: string, refresh: string) {
  localStorage.setItem('medchem_access_token', access);
  localStorage.setItem('medchem_refresh_token', refresh);
}

export function clearTokens() {
  localStorage.removeItem('medchem_access_token');
  localStorage.removeItem('medchem_refresh_token');
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getAccessToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const firstError =
      data?.detail ||
      (typeof data === 'object' && Object.values(data).flat()[0]) ||
      'خطا در ارتباط با سرور';
    throw new Error(String(firstError));
  }
  return data as T;
}

export const api = {
  register: (payload: {
    student_id: string;
    full_name: string;
    password: string;
    age?: number;
    gender?: string;
    gaming_frequency?: number;
  }) => request<{ user: any; tokens: { access: string; refresh: string } }>('/auth/register/', {
    method: 'POST',
    body: JSON.stringify(payload),
  }),

  login: (payload: { student_id: string; password: string }) =>
    request<{ user: any; tokens: { access: string; refresh: string } }>('/auth/login/', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  getProfile: () => request<any>('/auth/profile/'),

  changePassword: (payload: { old_password: string; new_password: string }) =>
    request<{ detail: string }>('/auth/change-password/', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  getSession: () => request<{ session: any; badges: any[] }>('/game/session/'),

  resetSession: () =>
    request<{ session: any }>('/game/session/', {
      method: 'POST',
    }),

  submitPuzzle: (payload: {
    stage_code: string;
    puzzle_code: string;
    answer: unknown;
    time_spent_seconds: number;
    time_remaining_seconds: number;
  }) =>
    request<{
      correct: boolean;
      feedback: string;
      score_earned: number;
      unlocked_clue: any;
      new_badge: any;
      session: any;
    }>('/game/submit/', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  getLeaderboard: () => request<{ leaderboard: any[] }>('/game/leaderboard/'),
};
