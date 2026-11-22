const rawUrl = import.meta.env.VITE_API_URL as string | undefined;
const API_BASE = rawUrl
  ? rawUrl.startsWith('http')
    ? `${rawUrl}/api`
    : `https://${rawUrl}/api`
  : '/api';

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

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

  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers,
    });
  } catch {
    throw new ApiError('اتصال به سرور برقرار نشد. ممکن است سرور در حال راه‌اندازی باشد؛ لطفاً چند لحظه بعد دوباره تلاش کنید.', 0);
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const firstError =
      data?.detail ||
      (typeof data === 'object' && Object.values(data).flat()[0]) ||
      'خطا در ارتباط با سرور';
    throw new ApiError(String(firstError), res.status);
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
  }) =>
    request<{ user: any; tokens: { access: string; refresh: string } }>('/auth/register/', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  login: (payload: { student_id: string; password: string }) =>
    request<{ user: any; tokens: { access: string; refresh: string } }>('/auth/login/', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  getProfile: () => request<any>('/auth/profile/'),

  updateProfile: (payload: {
    full_name?: string;
    age?: number | null;
    gender?: string;
    gaming_frequency?: number | null;
  }) =>
    request<any>('/auth/profile/', {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),

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

  getMeegaStatus: () => request<{ submitted: boolean; data: any }>('/analytics/meega/'),

  submitMeega: (payload: { answers: Record<string, number>; comments?: string }) =>
    request<{ submitted: boolean; data: any }>('/analytics/meega/', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
};
