export type TeamMember = {
  id: string;
  full_name: string;
  role: string;
  contract_type: string | null;
  avatar_url: string | null;
  color: string;
  contract_hours: number;
  active: boolean;
  created_at: string;
};

export type Shift = {
  id: string;
  employee_id: string;
  date: string;
  start_time: string;
  end_time: string;
  label: string | null;
  break_minutes: number;
  color: string;
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
