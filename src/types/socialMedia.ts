
export interface SocialMediaProfile {
  platform: string;
  url: string;
  username: string;
  icon: string;
  color: string;
  category?: string;
  status?: 'active' | 'inactive' | 'pending';
  note?: string;
}

export interface UserProfile {
  id: string;
  email: string;
  avatar_url: string;
  created_at: string;
  updated_at: string;
  checks_used: number;
  plan: string;
  plan_start_date: string;
  plan_end_date: string;
  role?: string;
}

export interface DomainSuggestion {
  tld: string;
  available: boolean;
  price: number;
}

export interface CategoryCount {
  name: string;
  count: number;
}

export interface SocialMediaCategory {
  name: string;
  count: number;
}

export interface PlanOption {
  id: string;
  name: string;
  description: string;
  price: number;
  limit: string;
  features: string[];
}

export interface SearchHistory {
  id: string;
  user_id: string;
  query: string;
  created_at: string;
  result_count: number;
}
