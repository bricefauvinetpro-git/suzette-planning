export type TeamMember = {
  id: string;
  full_name: string;
  role: string;
  contract_type: string | null;
  avatar_url: string | null;
  color: string;
  contract_hours: number;
  active: boolean;
  email: string | null;
  phone: string | null;
  birth_date: string | null;
  start_date: string | null;
  hourly_rate: number | null;
  availability: Record<string, boolean> | null;
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
  notes: string | null;
  created_at: string;
};

export type ShiftWithMember = Shift & {
  team_member: TeamMember;
};

export type EmployeeDocument = {
  id: string;
  employee_id: string;
  file_name: string;
  file_type: string;
  storage_path: string;
  created_at: string;
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
