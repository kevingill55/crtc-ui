export enum MemberStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  PENDING = "PENDING",
  WAITLIST = "WAITLIST",
}

export enum MemberRole {
  ADMIN = "ADMIN",
  MEMBER = "MEMBER",
  LEAGUE_COORDINATOR = "LEAGUE_COORDINATOR",
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
  type?: string;
  group_id?: string | null;
  league_id?: string | null;
  // Returned by GET /reservations/upcoming
  slots?: number[];
  courts?: number[];
  can_manage?: boolean;
  player_ids?: string[];
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

export type DayAvailability = {
  date: string;
  bookedSlots: number;
  totalSlots: number;
};

export type League = {
  id: string;
  name: string;
  coordinator_id: string | null;
  coordinator: { first_name: string; last_name: string } | null;
};

export type LeagueSeason = {
  id: string;
  league_id: string;
  name: string;
  status: "DRAFT" | "ENROLLMENT_OPEN" | "ACTIVE" | "COMPLETED";
  start_date: string | null;
  end_date: string | null;
  max_players: number | null;
  created_at: string;
};

export type LeagueEnrollment = {
  id: string;
  season_id: string;
  member_id: string;
  status: "ACTIVE" | "WAITLISTED" | "WITHDRAWN";
  enrolled_at: string;
  members: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
  } | null;
};
