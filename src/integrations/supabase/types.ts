export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action: string
          created_at: string
          id: string
          new_values: Json | null
          old_values: Json | null
          record_id: string | null
          table_name: string
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string | null
          table_name: string
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string | null
          table_name?: string
          user_id?: string | null
        }
        Relationships: []
      }
      daily_progress: {
        Row: {
          completed_exercises: number | null
          completion_date: string | null
          created_at: string
          day_number: number
          id: string
          is_day_completed: boolean | null
          notes: string | null
          updated_at: string
          user_id: string
          weight_check: number | null
        }
        Insert: {
          completed_exercises?: number | null
          completion_date?: string | null
          created_at?: string
          day_number: number
          id?: string
          is_day_completed?: boolean | null
          notes?: string | null
          updated_at?: string
          user_id: string
          weight_check?: number | null
        }
        Update: {
          completed_exercises?: number | null
          completion_date?: string | null
          created_at?: string
          day_number?: number
          id?: string
          is_day_completed?: boolean | null
          notes?: string | null
          updated_at?: string
          user_id?: string
          weight_check?: number | null
        }
        Relationships: []
      }
      exercise_completions: {
        Row: {
          completed_at: string
          day_number: number
          exercise_id: string
          id: string
          user_id: string
        }
        Insert: {
          completed_at?: string
          day_number: number
          exercise_id: string
          id?: string
          user_id: string
        }
        Update: {
          completed_at?: string
          day_number?: number
          exercise_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "exercise_completions_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          },
        ]
      }
      exercises: {
        Row: {
          calories_estimate: number | null
          created_at: string
          day_number: number
          description: string
          difficulty_level: Database["public"]["Enums"]["difficulty_level"]
          duration_minutes: number
          exercise_order: number
          id: string
          image_url: string | null
          instructions: string
          plan_id: string | null
          target_audience: Database["public"]["Enums"]["goal_type"] | null
          title: string
          updated_at: string
          youtube_video_id: string | null
        }
        Insert: {
          calories_estimate?: number | null
          created_at?: string
          day_number: number
          description: string
          difficulty_level?: Database["public"]["Enums"]["difficulty_level"]
          duration_minutes?: number
          exercise_order: number
          id?: string
          image_url?: string | null
          instructions: string
          plan_id?: string | null
          target_audience?: Database["public"]["Enums"]["goal_type"] | null
          title: string
          updated_at?: string
          youtube_video_id?: string | null
        }
        Update: {
          calories_estimate?: number | null
          created_at?: string
          day_number?: number
          description?: string
          difficulty_level?: Database["public"]["Enums"]["difficulty_level"]
          duration_minutes?: number
          exercise_order?: number
          id?: string
          image_url?: string | null
          instructions?: string
          plan_id?: string | null
          target_audience?: Database["public"]["Enums"]["goal_type"] | null
          title?: string
          updated_at?: string
          youtube_video_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "exercises_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "workout_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          age: number
          created_at: string
          current_bmi: number
          email: string
          goal_type: Database["public"]["Enums"]["goal_type"]
          height: number
          id: string
          name: string
          preferred_difficulty:
            | Database["public"]["Enums"]["difficulty_level"]
            | null
          program_start_date: string | null
          updated_at: string
          user_id: string
          weight: number
        }
        Insert: {
          age: number
          created_at?: string
          current_bmi: number
          email: string
          goal_type?: Database["public"]["Enums"]["goal_type"]
          height: number
          id?: string
          name: string
          preferred_difficulty?:
            | Database["public"]["Enums"]["difficulty_level"]
            | null
          program_start_date?: string | null
          updated_at?: string
          user_id: string
          weight: number
        }
        Update: {
          age?: number
          created_at?: string
          current_bmi?: number
          email?: string
          goal_type?: Database["public"]["Enums"]["goal_type"]
          height?: number
          id?: string
          name?: string
          preferred_difficulty?:
            | Database["public"]["Enums"]["difficulty_level"]
            | null
          program_start_date?: string | null
          updated_at?: string
          user_id?: string
          weight?: number
        }
        Relationships: []
      }
      purchases: {
        Row: {
          amount: number
          created_at: string | null
          currency: string | null
          email: string
          id: string
          order_id: string | null
          product: string
          raw: Json | null
          status: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          currency?: string | null
          email: string
          id?: string
          order_id?: string | null
          product: string
          raw?: Json | null
          status: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          currency?: string | null
          email?: string
          id?: string
          order_id?: string | null
          product?: string
          raw?: Json | null
          status?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      workout_plans: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          difficulty_level:
            | Database["public"]["Enums"]["difficulty_level"]
            | null
          id: string
          target_audience: Database["public"]["Enums"]["goal_type"] | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          difficulty_level?:
            | Database["public"]["Enums"]["difficulty_level"]
            | null
          id?: string
          target_audience?: Database["public"]["Enums"]["goal_type"] | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          difficulty_level?:
            | Database["public"]["Enums"]["difficulty_level"]
            | null
          id?: string
          target_audience?: Database["public"]["Enums"]["goal_type"] | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_audit_log: {
        Args: {
          _action: string
          _new_values?: Json
          _old_values?: Json
          _record_id: string
          _table_name: string
        }
        Returns: undefined
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user" | "instrutor"
      difficulty_level: "leve" | "medio" | "pesado"
      goal_type:
        | "maintain_weight"
        | "lose_weight"
        | "bariatric_prep"
        | "bariatric_indicated"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user", "instrutor"],
      difficulty_level: ["leve", "medio", "pesado"],
      goal_type: [
        "maintain_weight",
        "lose_weight",
        "bariatric_prep",
        "bariatric_indicated",
      ],
    },
  },
} as const
