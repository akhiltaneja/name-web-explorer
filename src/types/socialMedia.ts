
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
};
