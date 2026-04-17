export type TeamMember = {
  id: string;
  name: string;
  role: string;
  avatar_url: string | null;
  color: string;
  created_at: string;
};

export type Shift = {
  id: string;
  team_member_id: string;
  date: string; // ISO date string YYYY-MM-DD
  start_time: string; // HH:MM
  end_time: string; // HH:MM
  label: string | null;
  created_at: string;
};

export type ShiftWithMember = Shift & {
  team_member: TeamMember;
};

export type Database = {
  public: {
    Tables: {
      team_members: {
        Row: TeamMember;
        Insert: Omit<TeamMember, "id" | "created_at">;
        Update: Partial<Omit<TeamMember, "id" | "created_at">>;
      };
      shifts: {
        Row: Shift;
        Insert: Omit<Shift, "id" | "created_at">;
        Update: Partial<Omit<Shift, "id" | "created_at">>;
      };
    };
  };
};
