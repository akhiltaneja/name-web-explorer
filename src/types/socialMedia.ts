
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
