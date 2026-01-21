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

export enum MemberStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  PENDING = "PENDING",
  WAITLIST = "WAITLIST",
}

export enum MemberGender {
  MALE = "Male",
  FEMALE = "Female",
}

export enum MemberPlanType {
  ADULT = "Adult",
  JUNIOR = "Junior",
}

export type Member = {
  created_at: string;
  id: string;
  rating: number;
  first_name: string;
  last_name: string;
  address: string;
  phone_number: string;
  email: string;
  plan: MemberPlanType;
  gender: MemberGender;
  status: MemberStatus;
};
