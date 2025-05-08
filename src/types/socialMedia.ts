
export type SocialMediaProfile = {
  platform: string;
  url: string;
  username: string;
  icon: string;
  color: string;
  category?: string;
  status?: 'active' | 'inactive';
  errorReason?: string;
  verificationStatus?: 'verified' | 'error';
  note?: string;
};

export type SocialMediaCategory = {
  name: string;
  count: number;
};

export type PlanOption = {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  limit: string;
  features: string[];
  creditsAmount?: number;
  popular?: boolean;
};

export type SearchHistory = {
  id: string;
  query: string;
  created_at: string;
  result_count: number;
  user_id: string;
};

export type UserProfile = {
  id: string;
  email: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
  plan: string;
  checks_used: number;
  plan_start_date?: string;
  plan_end_date?: string;
  role?: string;
};
