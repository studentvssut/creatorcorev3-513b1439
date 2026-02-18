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
      ai_insights: {
        Row: {
          created_at: string
          description: string
          generated_at: string
          id: string
          insight_type: string
          is_read: boolean | null
          platform: string | null
          priority: number | null
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description: string
          generated_at?: string
          id?: string
          insight_type: string
          is_read?: boolean | null
          platform?: string | null
          priority?: number | null
          title: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string
          generated_at?: string
          id?: string
          insight_type?: string
          is_read?: boolean | null
          platform?: string | null
          priority?: number | null
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      connected_platforms: {
        Row: {
          access_token: string | null
          connected_at: string | null
          created_at: string
          id: string
          is_connected: boolean
          last_synced_at: string | null
          metadata: Json | null
          page_access_token: string | null
          platform: string
          platform_user_id: string | null
          platform_username: string | null
          refresh_token: string | null
          token_expires_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          access_token?: string | null
          connected_at?: string | null
          created_at?: string
          id?: string
          is_connected?: boolean
          last_synced_at?: string | null
          metadata?: Json | null
          page_access_token?: string | null
          platform: string
          platform_user_id?: string | null
          platform_username?: string | null
          refresh_token?: string | null
          token_expires_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          access_token?: string | null
          connected_at?: string | null
          created_at?: string
          id?: string
          is_connected?: boolean
          last_synced_at?: string | null
          metadata?: Json | null
          page_access_token?: string | null
          platform?: string
          platform_user_id?: string | null
          platform_username?: string | null
          refresh_token?: string | null
          token_expires_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      content_posts: {
        Row: {
          caption: string | null
          caption_length: number | null
          comments: number | null
          created_at: string
          hashtags: string[] | null
          hook_text: string | null
          id: string
          likes: number | null
          platform: string
          platform_post_id: string | null
          posted_at: string | null
          saves: number | null
          shares: number | null
          title: string | null
          updated_at: string
          user_id: string
          video_duration_seconds: number | null
          views: number | null
        }
        Insert: {
          caption?: string | null
          caption_length?: number | null
          comments?: number | null
          created_at?: string
          hashtags?: string[] | null
          hook_text?: string | null
          id?: string
          likes?: number | null
          platform: string
          platform_post_id?: string | null
          posted_at?: string | null
          saves?: number | null
          shares?: number | null
          title?: string | null
          updated_at?: string
          user_id: string
          video_duration_seconds?: number | null
          views?: number | null
        }
        Update: {
          caption?: string | null
          caption_length?: number | null
          comments?: number | null
          created_at?: string
          hashtags?: string[] | null
          hook_text?: string | null
          id?: string
          likes?: number | null
          platform?: string
          platform_post_id?: string | null
          posted_at?: string | null
          saves?: number | null
          shares?: number | null
          title?: string | null
          updated_at?: string
          user_id?: string
          video_duration_seconds?: number | null
          views?: number | null
        }
        Relationships: []
      }
      media_uploads: {
        Row: {
          caption: string | null
          created_at: string
          file_name: string
          file_size_bytes: number | null
          file_type: string
          file_url: string
          id: string
          published_platforms: string[] | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          caption?: string | null
          created_at?: string
          file_name: string
          file_size_bytes?: number | null
          file_type: string
          file_url: string
          id?: string
          published_platforms?: string[] | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          caption?: string | null
          created_at?: string
          file_name?: string
          file_size_bytes?: number | null
          file_type?: string
          file_url?: string
          id?: string
          published_platforms?: string[] | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      performance_metrics: {
        Row: {
          avg_engagement_rate: number | null
          created_at: string
          followers_count: number | null
          id: string
          metric_date: string
          platform: string
          posts_count: number | null
          total_comments: number | null
          total_likes: number | null
          total_saves: number | null
          total_shares: number | null
          total_views: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avg_engagement_rate?: number | null
          created_at?: string
          followers_count?: number | null
          id?: string
          metric_date: string
          platform: string
          posts_count?: number | null
          total_comments?: number | null
          total_likes?: number | null
          total_saves?: number | null
          total_shares?: number | null
          total_views?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avg_engagement_rate?: number | null
          created_at?: string
          followers_count?: number | null
          id?: string
          metric_date?: string
          platform?: string
          posts_count?: number | null
          total_comments?: number | null
          total_likes?: number | null
          total_saves?: number | null
          total_shares?: number | null
          total_views?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          id: string
          plan: string
          preferred_language: string | null
          trial_ends_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          plan?: string
          preferred_language?: string | null
          trial_ends_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          plan?: string
          preferred_language?: string | null
          trial_ends_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          billing_type: string
          created_at: string
          current_period_end: string | null
          current_period_start: string | null
          grace_period_end: string | null
          id: string
          next_billing_date: string | null
          plan: string
          razorpay_plan_id: string
          razorpay_subscription_id: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          billing_type?: string
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          grace_period_end?: string | null
          id?: string
          next_billing_date?: string | null
          plan?: string
          razorpay_plan_id: string
          razorpay_subscription_id: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          billing_type?: string
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          grace_period_end?: string | null
          id?: string
          next_billing_date?: string | null
          plan?: string
          razorpay_plan_id?: string
          razorpay_subscription_id?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      connected_platforms_safe: {
        Row: {
          connected_at: string | null
          created_at: string | null
          id: string | null
          is_connected: boolean | null
          last_synced_at: string | null
          platform: string | null
          platform_user_id: string | null
          platform_username: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          connected_at?: string | null
          created_at?: string | null
          id?: string | null
          is_connected?: boolean | null
          last_synced_at?: string | null
          platform?: string | null
          platform_user_id?: string | null
          platform_username?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          connected_at?: string | null
          created_at?: string | null
          id?: string | null
          is_connected?: boolean | null
          last_synced_at?: string | null
          platform?: string | null
          platform_user_id?: string | null
          platform_username?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      disconnect_platform: {
        Args: { p_platform_id: string }
        Returns: undefined
      }
      update_subscription_from_webhook: {
        Args: {
          p_current_period_end?: string
          p_current_period_start?: string
          p_razorpay_subscription_id: string
          p_status: string
        }
        Returns: undefined
      }
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
    Enums: {},
  },
} as const
