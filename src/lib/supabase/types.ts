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
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      entitlements: {
        Row: {
          current_period_end: string | null
          plan: string
          source: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          current_period_end?: string | null
          plan?: string
          source?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          current_period_end?: string | null
          plan?: string
          source?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          completed_onboarding_at: string | null
          created_at: string
          email: string | null
          experience: string | null
          garden_type: string | null
          id: string
          interests: string[]
          is_anonymous: boolean
          pets_children: string[]
          solution_preference: string | null
        }
        Insert: {
          completed_onboarding_at?: string | null
          created_at?: string
          email?: string | null
          experience?: string | null
          garden_type?: string | null
          id: string
          interests?: string[]
          is_anonymous?: boolean
          pets_children?: string[]
          solution_preference?: string | null
        }
        Update: {
          completed_onboarding_at?: string | null
          created_at?: string
          email?: string | null
          experience?: string | null
          garden_type?: string | null
          id?: string
          interests?: string[]
          is_anonymous?: boolean
          pets_children?: string[]
          solution_preference?: string | null
        }
        Relationships: []
      }
      project_activity_logs: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          message: string
          metadata: Json
          new_progress: number | null
          new_stage: Database["public"]["Enums"]["project_stage"] | null
          previous_progress: number | null
          previous_stage: Database["public"]["Enums"]["project_stage"] | null
          project_id: string
          source: Database["public"]["Enums"]["activity_source"]
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          message?: string
          metadata?: Json
          new_progress?: number | null
          new_stage?: Database["public"]["Enums"]["project_stage"] | null
          previous_progress?: number | null
          previous_stage?: Database["public"]["Enums"]["project_stage"] | null
          project_id: string
          source: Database["public"]["Enums"]["activity_source"]
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          message?: string
          metadata?: Json
          new_progress?: number | null
          new_stage?: Database["public"]["Enums"]["project_stage"] | null
          previous_progress?: number | null
          previous_stage?: Database["public"]["Enums"]["project_stage"] | null
          project_id?: string
          source?: Database["public"]["Enums"]["activity_source"]
        }
        Relationships: [
          {
            foreignKeyName: "project_activity_logs_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_activity_logs_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_members: {
        Row: {
          project_id: string
          role_in_project: string
          user_id: string
        }
        Insert: {
          project_id: string
          role_in_project?: string
          user_id: string
        }
        Update: {
          project_id?: string
          role_in_project?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_members_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      project_tasks: {
        Row: {
          assigned_to: string | null
          created_at: string
          description: string | null
          due_date: string | null
          id: string
          metadata: Json
          order_index: number
          priority: Database["public"]["Enums"]["project_priority"]
          project_id: string
          status: Database["public"]["Enums"]["task_status"]
          title: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          metadata?: Json
          order_index?: number
          priority?: Database["public"]["Enums"]["project_priority"]
          project_id: string
          status?: Database["public"]["Enums"]["task_status"]
          title: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          metadata?: Json
          order_index?: number
          priority?: Database["public"]["Enums"]["project_priority"]
          project_id?: string
          status?: Database["public"]["Enums"]["task_status"]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_tasks_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_tasks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          created_at: string
          current_stage: Database["public"]["Enums"]["project_stage"]
          domain: string | null
          figma_url: string | null
          full_description: string | null
          id: string
          last_update_at: string
          live_url: string | null
          monetization_model: string | null
          name: string
          platforms: string[]
          priority: Database["public"]["Enums"]["project_priority"]
          problem_benefit: string | null
          progress_percent: number
          repo_url: string | null
          screenshot_url: string | null
          short_description: string
          slug: string
          status: Database["public"]["Enums"]["project_status"]
          target_audience: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          current_stage?: Database["public"]["Enums"]["project_stage"]
          domain?: string | null
          figma_url?: string | null
          full_description?: string | null
          id?: string
          last_update_at?: string
          live_url?: string | null
          monetization_model?: string | null
          name: string
          platforms?: string[]
          priority?: Database["public"]["Enums"]["project_priority"]
          problem_benefit?: string | null
          progress_percent?: number
          repo_url?: string | null
          screenshot_url?: string | null
          short_description?: string
          slug: string
          status?: Database["public"]["Enums"]["project_status"]
          target_audience?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          current_stage?: Database["public"]["Enums"]["project_stage"]
          domain?: string | null
          figma_url?: string | null
          full_description?: string | null
          id?: string
          last_update_at?: string
          live_url?: string | null
          monetization_model?: string | null
          name?: string
          platforms?: string[]
          priority?: Database["public"]["Enums"]["project_priority"]
          problem_benefit?: string | null
          progress_percent?: number
          repo_url?: string | null
          screenshot_url?: string | null
          short_description?: string
          slug?: string
          status?: Database["public"]["Enums"]["project_status"]
          target_audience?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      scan_candidates: {
        Row: {
          common_names: string[]
          confidence: number
          content_id: string | null
          id: string
          rank: number
          scan_id: string
          scientific_name: string
          taxonomy: Json | null
        }
        Insert: {
          common_names?: string[]
          confidence: number
          content_id?: string | null
          id?: string
          rank: number
          scan_id: string
          scientific_name: string
          taxonomy?: Json | null
        }
        Update: {
          common_names?: string[]
          confidence?: number
          content_id?: string | null
          id?: string
          rank?: number
          scan_id?: string
          scientific_name?: string
          taxonomy?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "scan_candidates_scan_id_fkey"
            columns: ["scan_id"]
            isOneToOne: false
            referencedRelation: "scans"
            referencedColumns: ["id"]
          },
        ]
      }
      scan_usage: {
        Row: {
          scans_used: number
          user_id: string
          year_month: string
        }
        Insert: {
          scans_used?: number
          user_id: string
          year_month: string
        }
        Update: {
          scans_used?: number
          user_id?: string
          year_month?: string
        }
        Relationships: []
      }
      scans: {
        Row: {
          created_at: string
          id: string
          image_meta: Json | null
          image_path: string
          matched_content_id: string | null
          provider: string | null
          provider_raw: Json | null
          status: string
          triage_category: string | null
          triage_quality: string | null
          triage_reason: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          image_meta?: Json | null
          image_path: string
          matched_content_id?: string | null
          provider?: string | null
          provider_raw?: Json | null
          status: string
          triage_category?: string | null
          triage_quality?: string | null
          triage_reason?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          image_meta?: Json | null
          image_path?: string
          matched_content_id?: string | null
          provider?: string | null
          provider_raw?: Json | null
          status?: string
          triage_category?: string | null
          triage_quality?: string | null
          triage_reason?: string | null
          user_id?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          id: string
          name: string
          role: Database["public"]["Enums"]["user_role"]
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          id: string
          name?: string
          role?: Database["public"]["Enums"]["user_role"]
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          id?: string
          name?: string
          role?: Database["public"]["Enums"]["user_role"]
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: { Args: never; Returns: boolean }
    }
    Enums: {
      activity_source: "manual" | "claude" | "system"
      project_priority: "high" | "medium" | "low"
      project_stage:
        | "idea"
        | "concept"
        | "mvp_in_development"
        | "testing"
        | "launch_prep"
        | "live"
        | "optimization"
        | "monetization"
        | "paused"
        | "archived"
      project_status: "active" | "blocked"
      task_status: "open" | "in_progress" | "done"
      user_role: "admin" | "partner"
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      activity_source: ["manual", "claude", "system"],
      project_priority: ["high", "medium", "low"],
      project_stage: [
        "idea",
        "concept",
        "mvp_in_development",
        "testing",
        "launch_prep",
        "live",
        "optimization",
        "monetization",
        "paused",
        "archived",
      ],
      project_status: ["active", "blocked"],
      task_status: ["open", "in_progress", "done"],
      user_role: ["admin", "partner"],
    },
  },
} as const
