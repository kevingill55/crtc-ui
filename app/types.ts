export type AuthSession = {
  token_type: string;
  access_token: string;
  refresh_token: string;
  expires_at: number;
  expires_in: number;
  user: AuthUser;
};

export type AuthUser = {
  id: string;
  email: string;
  created_at: string;
  updated_at: string;
  confirmed_at: string;
};

export type Profile = {
  id: string;
  rating: number;
  first_name: string;
  last_name: string;
  address: string;
  phone_number: string;
  email: string;
  gender: string; // "F" or "M"
  active: boolean;
};
