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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      driver_notes: {
        Row: {
          author_id: string
          content: string
          created_at: string
          driver_id: string
          id: string
        }
        Insert: {
          author_id: string
          content: string
          created_at?: string
          driver_id: string
          id?: string
        }
        Update: {
          author_id?: string
          content?: string
          created_at?: string
          driver_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "driver_notes_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_current_month"
            referencedColumns: ["operator_id"]
          },
          {
            foreignKeyName: "driver_notes_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "operator_performance"
            referencedColumns: ["operator_id"]
          },
          {
            foreignKeyName: "driver_notes_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "driver_notes_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
        ]
      }
      drivers: {
        Row: {
          created_at: string
          first_name: string
          first_seen_at: string
          id: string
          last_name: string | null
          last_seen_at: string
          telegram_user_id: number
          updated_at: string
          username: string | null
        }
        Insert: {
          created_at?: string
          first_name: string
          first_seen_at?: string
          id?: string
          last_name?: string | null
          last_seen_at?: string
          telegram_user_id: number
          updated_at?: string
          username?: string | null
        }
        Update: {
          created_at?: string
          first_name?: string
          first_seen_at?: string
          id?: string
          last_name?: string | null
          last_seen_at?: string
          telegram_user_id?: number
          updated_at?: string
          username?: string | null
        }
        Relationships: []
      }
      raw_messages: {
        Row: {
          ai_raw_response: Json | null
          chat_id: number
          chat_type: string
          classification_result: string | null
          classification_source: string | null
          content_text: string | null
          content_type: string
          created_at: string
          has_media: boolean
          id: string
          telegram_message_id: number
          telegram_user_id: number
          ticket_id: string | null
        }
        Insert: {
          ai_raw_response?: Json | null
          chat_id: number
          chat_type: string
          classification_result?: string | null
          classification_source?: string | null
          content_text?: string | null
          content_type: string
          created_at?: string
          has_media?: boolean
          id?: string
          telegram_message_id: number
          telegram_user_id: number
          ticket_id?: string | null
        }
        Update: {
          ai_raw_response?: Json | null
          chat_id?: number
          chat_type?: string
          classification_result?: string | null
          classification_source?: string | null
          content_text?: string | null
          content_type?: string
          created_at?: string
          has_media?: boolean
          id?: string
          telegram_message_id?: number
          telegram_user_id?: number
          ticket_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "raw_messages_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      score_categories: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          name: string
          points: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          points: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          points?: number
          updated_at?: string
        }
        Relationships: []
      }
      score_entries: {
        Row: {
          created_at: string
          id: string
          operator_id: string
          points: number
          score_category_id: string
          scored_date: string
          ticket_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          operator_id: string
          points: number
          score_category_id: string
          scored_date?: string
          ticket_id: string
        }
        Update: {
          created_at?: string
          id?: string
          operator_id?: string
          points?: number
          score_category_id?: string
          scored_date?: string
          ticket_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "score_entries_operator_id_fkey"
            columns: ["operator_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_current_month"
            referencedColumns: ["operator_id"]
          },
          {
            foreignKeyName: "score_entries_operator_id_fkey"
            columns: ["operator_id"]
            isOneToOne: false
            referencedRelation: "operator_performance"
            referencedColumns: ["operator_id"]
          },
          {
            foreignKeyName: "score_entries_operator_id_fkey"
            columns: ["operator_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "score_entries_score_category_id_fkey"
            columns: ["score_category_id"]
            isOneToOne: false
            referencedRelation: "score_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "score_entries_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: true
            referencedRelation: "tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      settings: {
        Row: {
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          key: string
          updated_at?: string
          value: Json
        }
        Update: {
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      teams: {
        Row: {
          created_at: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      telegram_connections: {
        Row: {
          business_connection_id: string | null
          chat_id: number | null
          connection_type: Database["public"]["Enums"]["telegram_connection_type"]
          created_at: string
          display_name: string
          id: string
          is_active: boolean
          updated_at: string
        }
        Insert: {
          business_connection_id?: string | null
          chat_id?: number | null
          connection_type: Database["public"]["Enums"]["telegram_connection_type"]
          created_at?: string
          display_name: string
          id?: string
          is_active?: boolean
          updated_at?: string
        }
        Update: {
          business_connection_id?: string | null
          chat_id?: number | null
          connection_type?: Database["public"]["Enums"]["telegram_connection_type"]
          created_at?: string
          display_name?: string
          id?: string
          is_active?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      ticket_messages: {
        Row: {
          ai_media_description: string | null
          content_text: string | null
          content_type: Database["public"]["Enums"]["message_content_type"]
          created_at: string
          delivery_status:
            | Database["public"]["Enums"]["message_delivery_status"]
            | null
          direction: Database["public"]["Enums"]["message_direction"]
          id: string
          is_internal_note: boolean
          media_thumbnail_url: string | null
          media_url: string | null
          sender_name: string
          sender_type: Database["public"]["Enums"]["message_sender_type"]
          sender_user_id: string | null
          telegram_message_id: number | null
          ticket_id: string
        }
        Insert: {
          ai_media_description?: string | null
          content_text?: string | null
          content_type?: Database["public"]["Enums"]["message_content_type"]
          created_at?: string
          delivery_status?:
            | Database["public"]["Enums"]["message_delivery_status"]
            | null
          direction: Database["public"]["Enums"]["message_direction"]
          id?: string
          is_internal_note?: boolean
          media_thumbnail_url?: string | null
          media_url?: string | null
          sender_name: string
          sender_type: Database["public"]["Enums"]["message_sender_type"]
          sender_user_id?: string | null
          telegram_message_id?: number | null
          ticket_id: string
        }
        Update: {
          ai_media_description?: string | null
          content_text?: string | null
          content_type?: Database["public"]["Enums"]["message_content_type"]
          created_at?: string
          delivery_status?:
            | Database["public"]["Enums"]["message_delivery_status"]
            | null
          direction?: Database["public"]["Enums"]["message_direction"]
          id?: string
          is_internal_note?: boolean
          media_thumbnail_url?: string | null
          media_url?: string | null
          sender_name?: string
          sender_type?: Database["public"]["Enums"]["message_sender_type"]
          sender_user_id?: string | null
          telegram_message_id?: number | null
          ticket_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ticket_messages_sender_user_id_fkey"
            columns: ["sender_user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_current_month"
            referencedColumns: ["operator_id"]
          },
          {
            foreignKeyName: "ticket_messages_sender_user_id_fkey"
            columns: ["sender_user_id"]
            isOneToOne: false
            referencedRelation: "operator_performance"
            referencedColumns: ["operator_id"]
          },
          {
            foreignKeyName: "ticket_messages_sender_user_id_fkey"
            columns: ["sender_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ticket_messages_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      tickets: {
        Row: {
          ai_category: string | null
          ai_location: string | null
          ai_summary: string | null
          ai_urgency: number | null
          assigned_operator_id: string | null
          business_connection_id: string | null
          claimed_at: string | null
          created_at: string
          dismissed_at: string | null
          display_id: string
          driver_id: string
          held_at: string | null
          held_by_id: string | null
          hold_note: string | null
          id: string
          is_urgent: boolean
          priority: Database["public"]["Enums"]["ticket_priority"]
          resolved_at: string | null
          score_category_id: string | null
          source_chat_id: number
          source_name: string | null
          source_type: Database["public"]["Enums"]["ticket_source"]
          status: Database["public"]["Enums"]["ticket_status"]
          total_hold_seconds: number
          updated_at: string
        }
        Insert: {
          ai_category?: string | null
          ai_location?: string | null
          ai_summary?: string | null
          ai_urgency?: number | null
          assigned_operator_id?: string | null
          business_connection_id?: string | null
          claimed_at?: string | null
          created_at?: string
          dismissed_at?: string | null
          display_id?: string
          driver_id: string
          held_at?: string | null
          held_by_id?: string | null
          hold_note?: string | null
          id?: string
          is_urgent?: boolean
          priority?: Database["public"]["Enums"]["ticket_priority"]
          resolved_at?: string | null
          score_category_id?: string | null
          source_chat_id: number
          source_name?: string | null
          source_type: Database["public"]["Enums"]["ticket_source"]
          status?: Database["public"]["Enums"]["ticket_status"]
          total_hold_seconds?: number
          updated_at?: string
        }
        Update: {
          ai_category?: string | null
          ai_location?: string | null
          ai_summary?: string | null
          ai_urgency?: number | null
          assigned_operator_id?: string | null
          business_connection_id?: string | null
          claimed_at?: string | null
          created_at?: string
          dismissed_at?: string | null
          display_id?: string
          driver_id?: string
          held_at?: string | null
          held_by_id?: string | null
          hold_note?: string | null
          id?: string
          is_urgent?: boolean
          priority?: Database["public"]["Enums"]["ticket_priority"]
          resolved_at?: string | null
          score_category_id?: string | null
          source_chat_id?: number
          source_name?: string | null
          source_type?: Database["public"]["Enums"]["ticket_source"]
          status?: Database["public"]["Enums"]["ticket_status"]
          total_hold_seconds?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tickets_assigned_operator_id_fkey"
            columns: ["assigned_operator_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_current_month"
            referencedColumns: ["operator_id"]
          },
          {
            foreignKeyName: "tickets_assigned_operator_id_fkey"
            columns: ["assigned_operator_id"]
            isOneToOne: false
            referencedRelation: "operator_performance"
            referencedColumns: ["operator_id"]
          },
          {
            foreignKeyName: "tickets_assigned_operator_id_fkey"
            columns: ["assigned_operator_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tickets_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tickets_held_by_id_fkey"
            columns: ["held_by_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_current_month"
            referencedColumns: ["operator_id"]
          },
          {
            foreignKeyName: "tickets_held_by_id_fkey"
            columns: ["held_by_id"]
            isOneToOne: false
            referencedRelation: "operator_performance"
            referencedColumns: ["operator_id"]
          },
          {
            foreignKeyName: "tickets_held_by_id_fkey"
            columns: ["held_by_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tickets_score_category_id_fkey"
            columns: ["score_category_id"]
            isOneToOne: false
            referencedRelation: "score_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          created_at: string
          email: string
          full_name: string
          id: string
          role: Database["public"]["Enums"]["user_role"]
          status: Database["public"]["Enums"]["user_status"]
          team_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          full_name: string
          id: string
          role?: Database["public"]["Enums"]["user_role"]
          status?: Database["public"]["Enums"]["user_status"]
          team_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          status?: Database["public"]["Enums"]["user_status"]
          team_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "users_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "team_leaderboard_current_month"
            referencedColumns: ["team_id"]
          },
          {
            foreignKeyName: "users_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      dashboard_stats: {
        Row: {
          avg_handling_time_minutes: number | null
          avg_pickup_time_minutes: number | null
          dismissed_tickets: number | null
          resolved_tickets: number | null
          total_tickets: number | null
          unresolved_tickets: number | null
        }
        Relationships: []
      }
      leaderboard_current_month: {
        Row: {
          full_name: string | null
          operator_id: string | null
          rank: number | null
          team_id: string | null
          team_name: string | null
          tickets_scored: number | null
          total_score: number | null
        }
        Relationships: [
          {
            foreignKeyName: "users_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "team_leaderboard_current_month"
            referencedColumns: ["team_id"]
          },
          {
            foreignKeyName: "users_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      operator_performance: {
        Row: {
          avg_handling_time_minutes: number | null
          avg_pickup_time_minutes: number | null
          email: string | null
          full_name: string | null
          operator_id: string | null
          team_name: string | null
          tickets_resolved_month: number | null
          tickets_resolved_today: number | null
        }
        Relationships: []
      }
      team_leaderboard_current_month: {
        Row: {
          member_count: number | null
          rank: number | null
          team_id: string | null
          team_name: string | null
          tickets_scored: number | null
          total_score: number | null
        }
        Relationships: []
      }
      tickets_per_day: {
        Row: {
          date: string | null
          resolved_count: number | null
          ticket_count: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      check_ticket_urgency: { Args: never; Returns: undefined }
      is_active_user: { Args: never; Returns: boolean }
      is_admin: { Args: never; Returns: boolean }
      next_ticket_display_id: { Args: never; Returns: string }
    }
    Enums: {
      message_content_type:
        | "text"
        | "photo"
        | "voice"
        | "video"
        | "document"
        | "location"
      message_delivery_status: "pending" | "sent" | "delivered" | "failed"
      message_direction: "inbound" | "outbound"
      message_sender_type: "driver" | "operator" | "system"
      telegram_connection_type: "business_account" | "group"
      ticket_priority: "normal" | "urgent"
      ticket_source: "business_dm" | "group"
      ticket_status:
        | "open"
        | "in_progress"
        | "on_hold"
        | "resolved"
        | "dismissed"
      user_role: "admin" | "operator"
      user_status: "pending_approval" | "active" | "rejected" | "deactivated"
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
      message_content_type: [
        "text",
        "photo",
        "voice",
        "video",
        "document",
        "location",
      ],
      message_delivery_status: ["pending", "sent", "delivered", "failed"],
      message_direction: ["inbound", "outbound"],
      message_sender_type: ["driver", "operator", "system"],
      telegram_connection_type: ["business_account", "group"],
      ticket_priority: ["normal", "urgent"],
      ticket_source: ["business_dm", "group"],
      ticket_status: [
        "open",
        "in_progress",
        "on_hold",
        "resolved",
        "dismissed",
      ],
      user_role: ["admin", "operator"],
      user_status: ["pending_approval", "active", "rejected", "deactivated"],
    },
  },
} as const
