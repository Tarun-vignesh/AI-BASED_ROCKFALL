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
      ai_models: {
        Row: {
          accuracy_score: number | null
          active: boolean | null
          created_at: string
          id: string
          indian_specific: boolean | null
          model_name: string
          model_type: string
          model_version: string
          training_data_size: number | null
          updated_at: string
        }
        Insert: {
          accuracy_score?: number | null
          active?: boolean | null
          created_at?: string
          id?: string
          indian_specific?: boolean | null
          model_name: string
          model_type: string
          model_version: string
          training_data_size?: number | null
          updated_at?: string
        }
        Update: {
          accuracy_score?: number | null
          active?: boolean | null
          created_at?: string
          id?: string
          indian_specific?: boolean | null
          model_name?: string
          model_type?: string
          model_version?: string
          training_data_size?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      alert_deliveries: {
        Row: {
          alert_id: string | null
          created_at: string
          delivered_at: string | null
          delivery_method: string
          error_message: string | null
          id: string
          recipient_contact: string | null
          recipient_id: string | null
          sent_at: string | null
          status: string
        }
        Insert: {
          alert_id?: string | null
          created_at?: string
          delivered_at?: string | null
          delivery_method: string
          error_message?: string | null
          id?: string
          recipient_contact?: string | null
          recipient_id?: string | null
          sent_at?: string | null
          status?: string
        }
        Update: {
          alert_id?: string | null
          created_at?: string
          delivered_at?: string | null
          delivery_method?: string
          error_message?: string | null
          id?: string
          recipient_contact?: string | null
          recipient_id?: string | null
          sent_at?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "alert_deliveries_alert_id_fkey"
            columns: ["alert_id"]
            isOneToOne: false
            referencedRelation: "alerts"
            referencedColumns: ["id"]
          },
        ]
      }
      alerts: {
        Row: {
          acknowledged_at: string | null
          acknowledged_by: string | null
          action_required: string | null
          affected_areas: Json | null
          alert_type: string
          created_at: string
          description: string
          id: string
          mine_site_id: string
          resolved_at: string | null
          risk_assessment_id: string | null
          severity: string
          status: string | null
          title: string
        }
        Insert: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          action_required?: string | null
          affected_areas?: Json | null
          alert_type: string
          created_at?: string
          description: string
          id?: string
          mine_site_id: string
          resolved_at?: string | null
          risk_assessment_id?: string | null
          severity: string
          status?: string | null
          title: string
        }
        Update: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          action_required?: string | null
          affected_areas?: Json | null
          alert_type?: string
          created_at?: string
          description?: string
          id?: string
          mine_site_id?: string
          resolved_at?: string | null
          risk_assessment_id?: string | null
          severity?: string
          status?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "alerts_mine_site_id_fkey"
            columns: ["mine_site_id"]
            isOneToOne: false
            referencedRelation: "mine_sites"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alerts_risk_assessment_id_fkey"
            columns: ["risk_assessment_id"]
            isOneToOne: false
            referencedRelation: "risk_assessments"
            referencedColumns: ["id"]
          },
        ]
      }
      indian_conditions: {
        Row: {
          geological_type: string | null
          groundwater_level: number | null
          humidity_percent: number | null
          id: string
          mine_site_id: string
          monsoon_season: boolean | null
          rainfall_intensity: string | null
          recorded_at: string
          seismic_activity_level: string | null
          temperature_celsius: number | null
          wind_speed_kmh: number | null
        }
        Insert: {
          geological_type?: string | null
          groundwater_level?: number | null
          humidity_percent?: number | null
          id?: string
          mine_site_id: string
          monsoon_season?: boolean | null
          rainfall_intensity?: string | null
          recorded_at?: string
          seismic_activity_level?: string | null
          temperature_celsius?: number | null
          wind_speed_kmh?: number | null
        }
        Update: {
          geological_type?: string | null
          groundwater_level?: number | null
          humidity_percent?: number | null
          id?: string
          mine_site_id?: string
          monsoon_season?: boolean | null
          rainfall_intensity?: string | null
          recorded_at?: string
          seismic_activity_level?: string | null
          temperature_celsius?: number | null
          wind_speed_kmh?: number | null
        }
        Relationships: []
      }
      mine_sites: {
        Row: {
          area_boundaries: Json | null
          created_at: string
          description: string | null
          id: string
          location: Json
          name: string
          status: string | null
          updated_at: string
        }
        Insert: {
          area_boundaries?: Json | null
          created_at?: string
          description?: string | null
          id?: string
          location: Json
          name: string
          status?: string | null
          updated_at?: string
        }
        Update: {
          area_boundaries?: Json | null
          created_at?: string
          description?: string | null
          id?: string
          location?: Json
          name?: string
          status?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      notification_logs: {
        Row: {
          alert_id: string
          content: string
          created_at: string
          delivered_at: string | null
          error_message: string | null
          id: string
          notification_type: string
          recipient_contact: string
          recipient_id: string | null
          sent_at: string | null
          status: string
        }
        Insert: {
          alert_id: string
          content: string
          created_at?: string
          delivered_at?: string | null
          error_message?: string | null
          id?: string
          notification_type: string
          recipient_contact: string
          recipient_id?: string | null
          sent_at?: string | null
          status: string
        }
        Update: {
          alert_id?: string
          content?: string
          created_at?: string
          delivered_at?: string | null
          error_message?: string | null
          id?: string
          notification_type?: string
          recipient_contact?: string
          recipient_id?: string | null
          sent_at?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_logs_alert_id_fkey"
            columns: ["alert_id"]
            isOneToOne: false
            referencedRelation: "alerts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notification_logs_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      predictions: {
        Row: {
          affected_coordinates: Json | null
          alert_triggered: boolean | null
          confidence_level: number
          created_at: string
          id: string
          indian_factors: Json | null
          mine_site_id: string
          model_id: string | null
          prediction_type: string
          raw_data_sources: Json | null
          risk_probability: number
          timeframe_hours: number | null
          valid_until: string | null
        }
        Insert: {
          affected_coordinates?: Json | null
          alert_triggered?: boolean | null
          confidence_level: number
          created_at?: string
          id?: string
          indian_factors?: Json | null
          mine_site_id: string
          model_id?: string | null
          prediction_type: string
          raw_data_sources?: Json | null
          risk_probability: number
          timeframe_hours?: number | null
          valid_until?: string | null
        }
        Update: {
          affected_coordinates?: Json | null
          alert_triggered?: boolean | null
          confidence_level?: number
          created_at?: string
          id?: string
          indian_factors?: Json | null
          mine_site_id?: string
          model_id?: string | null
          prediction_type?: string
          raw_data_sources?: Json | null
          risk_probability?: number
          timeframe_hours?: number | null
          valid_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "predictions_model_id_fkey"
            columns: ["model_id"]
            isOneToOne: false
            referencedRelation: "ai_models"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          full_name: string | null
          id: string
          mine_site_id: string | null
          notification_preferences: Json | null
          phone_number: string | null
          role: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          mine_site_id?: string | null
          notification_preferences?: Json | null
          phone_number?: string | null
          role: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          mine_site_id?: string | null
          notification_preferences?: Json | null
          phone_number?: string | null
          role?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_mine_site_id_fkey"
            columns: ["mine_site_id"]
            isOneToOne: false
            referencedRelation: "mine_sites"
            referencedColumns: ["id"]
          },
        ]
      }
      real_time_streams: {
        Row: {
          confidence_score: number | null
          created_at: string
          data_payload: Json
          id: string
          indian_conditions: Json | null
          mine_site_id: string
          processed_by_ai: boolean | null
          risk_score: number | null
          stream_source: string
          stream_type: string
        }
        Insert: {
          confidence_score?: number | null
          created_at?: string
          data_payload: Json
          id?: string
          indian_conditions?: Json | null
          mine_site_id: string
          processed_by_ai?: boolean | null
          risk_score?: number | null
          stream_source: string
          stream_type: string
        }
        Update: {
          confidence_score?: number | null
          created_at?: string
          data_payload?: Json
          id?: string
          indian_conditions?: Json | null
          mine_site_id?: string
          processed_by_ai?: boolean | null
          risk_score?: number | null
          stream_source?: string
          stream_type?: string
        }
        Relationships: []
      }
      risk_assessments: {
        Row: {
          affected_zones: Json | null
          assessment_type: string
          confidence: number | null
          created_at: string
          id: string
          mine_site_id: string
          prediction_data: Json | null
          probability: number | null
          risk_level: string
          valid_from: string
          valid_until: string | null
        }
        Insert: {
          affected_zones?: Json | null
          assessment_type: string
          confidence?: number | null
          created_at?: string
          id?: string
          mine_site_id: string
          prediction_data?: Json | null
          probability?: number | null
          risk_level: string
          valid_from?: string
          valid_until?: string | null
        }
        Update: {
          affected_zones?: Json | null
          assessment_type?: string
          confidence?: number | null
          created_at?: string
          id?: string
          mine_site_id?: string
          prediction_data?: Json | null
          probability?: number | null
          risk_level?: string
          valid_from?: string
          valid_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "risk_assessments_mine_site_id_fkey"
            columns: ["mine_site_id"]
            isOneToOne: false
            referencedRelation: "mine_sites"
            referencedColumns: ["id"]
          },
        ]
      }
      sensor_data: {
        Row: {
          created_at: string
          data_type: string
          id: string
          quality_score: number | null
          raw_data: Json | null
          sensor_station_id: string
          timestamp: string
          unit: string | null
          value: number | null
        }
        Insert: {
          created_at?: string
          data_type: string
          id?: string
          quality_score?: number | null
          raw_data?: Json | null
          sensor_station_id: string
          timestamp?: string
          unit?: string | null
          value?: number | null
        }
        Update: {
          created_at?: string
          data_type?: string
          id?: string
          quality_score?: number | null
          raw_data?: Json | null
          sensor_station_id?: string
          timestamp?: string
          unit?: string | null
          value?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "sensor_data_sensor_station_id_fkey"
            columns: ["sensor_station_id"]
            isOneToOne: false
            referencedRelation: "sensor_stations"
            referencedColumns: ["id"]
          },
        ]
      }
      sensor_stations: {
        Row: {
          configuration: Json | null
          created_at: string
          id: string
          last_reading_at: string | null
          location: Json
          mine_site_id: string
          sensor_type: string
          station_name: string
          status: string | null
          updated_at: string
        }
        Insert: {
          configuration?: Json | null
          created_at?: string
          id?: string
          last_reading_at?: string | null
          location: Json
          mine_site_id: string
          sensor_type: string
          station_name: string
          status?: string | null
          updated_at?: string
        }
        Update: {
          configuration?: Json | null
          created_at?: string
          id?: string
          last_reading_at?: string | null
          location?: Json
          mine_site_id?: string
          sensor_type?: string
          station_name?: string
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sensor_stations_mine_site_id_fkey"
            columns: ["mine_site_id"]
            isOneToOne: false
            referencedRelation: "mine_sites"
            referencedColumns: ["id"]
          },
        ]
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
