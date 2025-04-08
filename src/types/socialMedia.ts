
export interface SocialMediaProfile {
  platform: string;
  url: string;
  username: string;
  icon: string;
  color: string;
  category?: string;
  status?: string;
}

export interface SocialMediaCategory {
  name: string;
  count: number;
}

export interface UserProfile {
  id: string;
  email: string;
  avatar_url: string | null;
  plan: 'free' | 'premium' | 'unlimited';
  checks_used: number;
  plan_start_date: string | null;
  plan_end_date: string | null;
}

export interface SearchHistory {
  id: string;
  query: string;
  result_count: number;
  created_at: string;
}

export interface PlanOption {
  name: string;
  price: string;
  features: string[];
  checksAllowed: number;
  current: boolean;
  buttonText: string;
}
