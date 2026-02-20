export enum MemberStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  PENDING = "PENDING",
  WAITLIST = "WAITLIST",
}

export enum MemberRole {
  ADMIN = "ADMIN",
  MEMBER = "MEMBER",
}

export enum MemberGender {
  MALE = "Male",
  FEMALE = "Female",
}

export enum MemberPlanType {
  ADULT = "Adult",
  JUNIOR = "Junior",
}

export enum ReservationStatus {
  ACTIVE = "ACTIVE",
  CANCELLED = "CANCELLED",
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
  waiver: boolean;
  role: MemberRole;
  plan: MemberPlanType;
  gender: MemberGender;
  status: MemberStatus;
};

export type Reservation = {
  status: ReservationStatus;
  id: string;
  member_id: string;
  slot: number;
  court: number;
  date: string;
  name: string;
  created_at: string;
  players: string[];
};

export type Slot = {
  reservationsByCourt: { [key: number]: Reservation };
  slotIndex: number;
  availableCourts: number;
  isFull: boolean;
  endTime: string;
  startTime: string;
};

export type GetSlotsApiResponse = {
  date: string;
  slots: Slot[];
};
