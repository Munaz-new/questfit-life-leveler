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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      body_measurements: {
        Row: {
          arms: number | null
          body_fat: number | null
          chest: number | null
          created_at: string
          hip: number | null
          id: string
          legs: number | null
          measured_at: string
          neck: number | null
          note: string | null
          shoulders: number | null
          unit: string
          updated_at: string
          user_id: string
          waist: number | null
          weight: number | null
        }
        Insert: {
          arms?: number | null
          body_fat?: number | null
          chest?: number | null
          created_at?: string
          hip?: number | null
          id?: string
          legs?: number | null
          measured_at?: string
          neck?: number | null
          note?: string | null
          shoulders?: number | null
          unit?: string
          updated_at?: string
          user_id: string
          waist?: number | null
          weight?: number | null
        }
        Update: {
          arms?: number | null
          body_fat?: number | null
          chest?: number | null
          created_at?: string
          hip?: number | null
          id?: string
          legs?: number | null
          measured_at?: string
          neck?: number | null
          note?: string | null
          shoulders?: number | null
          unit?: string
          updated_at?: string
          user_id?: string
          waist?: number | null
          weight?: number | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          age_range: string
          created_at: string
          display_name: string
          fitness_level: string
          gender: string | null
          goals: string[]
          height: string
          onboarded: boolean
          primary_goal: string
          updated_at: string
          user_id: string
          weight: string
        }
        Insert: {
          age_range?: string
          created_at?: string
          display_name?: string
          fitness_level?: string
          gender?: string | null
          goals?: string[]
          height?: string
          onboarded?: boolean
          primary_goal?: string
          updated_at?: string
          user_id: string
          weight?: string
        }
        Update: {
          age_range?: string
          created_at?: string
          display_name?: string
          fitness_level?: string
          gender?: string | null
          goals?: string[]
          height?: string
          onboarded?: boolean
          primary_goal?: string
          updated_at?: string
          user_id?: string
          weight?: string
        }
        Relationships: []
      }
      progress_achievements: {
        Row: {
          achievement_key: string
          created_at: string
          id: string
          unlocked_at: string
          user_id: string
        }
        Insert: {
          achievement_key: string
          created_at?: string
          id?: string
          unlocked_at?: string
          user_id: string
        }
        Update: {
          achievement_key?: string
          created_at?: string
          id?: string
          unlocked_at?: string
          user_id?: string
        }
        Relationships: []
      }
      progress_photos: {
        Row: {
          confidence: number | null
          created_at: string
          energy: number | null
          id: string
          mood: number | null
          note: string | null
          pain_level: number | null
          storage_path: string
          taken_at: string
          updated_at: string
          user_id: string
          view: string
        }
        Insert: {
          confidence?: number | null
          created_at?: string
          energy?: number | null
          id?: string
          mood?: number | null
          note?: string | null
          pain_level?: number | null
          storage_path: string
          taken_at?: string
          updated_at?: string
          user_id: string
          view?: string
        }
        Update: {
          confidence?: number | null
          created_at?: string
          energy?: number | null
          id?: string
          mood?: number | null
          note?: string | null
          pain_level?: number | null
          storage_path?: string
          taken_at?: string
          updated_at?: string
          user_id?: string
          view?: string
        }
        Relationships: []
      }
      progress_settings: {
        Row: {
          created_at: string
          enabled: boolean
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          enabled?: boolean
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          enabled?: boolean
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_lifestyle: {
        Row: {
          created_at: string
          energy: number
          equipment: string[]
          lifestyle: string
          room_size: string
          schedule: string
          sitting_hours: number
          sleep_time: string
          stress: number
          updated_at: string
          user_id: string
          wake_time: string
        }
        Insert: {
          created_at?: string
          energy?: number
          equipment?: string[]
          lifestyle?: string
          room_size?: string
          schedule?: string
          sitting_hours?: number
          sleep_time?: string
          stress?: number
          updated_at?: string
          user_id: string
          wake_time?: string
        }
        Update: {
          created_at?: string
          energy?: number
          equipment?: string[]
          lifestyle?: string
          room_size?: string
          schedule?: string
          sitting_hours?: number
          sleep_time?: string
          stress?: number
          updated_at?: string
          user_id?: string
          wake_time?: string
        }
        Relationships: []
      }
      user_preferences: {
        Row: {
          created_at: string
          demonstration_preference: string
          motivation_mode: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          demonstration_preference?: string
          motivation_mode?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          demonstration_preference?: string
          motivation_mode?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
