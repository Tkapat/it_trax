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
      book_highlights: {
        Row: {
          book_id: string
          created_at: string | null
          extracted_text: string | null
          id: string
          image_url: string | null
          page_number: number | null
          user_id: string
        }
        Insert: {
          book_id: string
          created_at?: string | null
          extracted_text?: string | null
          id?: string
          image_url?: string | null
          page_number?: number | null
          user_id: string
        }
        Update: {
          book_id?: string
          created_at?: string | null
          extracted_text?: string | null
          id?: string
          image_url?: string | null
          page_number?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "book_highlights_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
        ]
      }
      book_notes: {
        Row: {
          book_id: string
          content: string | null
          created_at: string | null
          id: string
          page_reference: number | null
          parent_note_id: string | null
          position: number | null
          title: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          book_id: string
          content?: string | null
          created_at?: string | null
          id?: string
          page_reference?: number | null
          parent_note_id?: string | null
          position?: number | null
          title?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          book_id?: string
          content?: string | null
          created_at?: string | null
          id?: string
          page_reference?: number | null
          parent_note_id?: string | null
          position?: number | null
          title?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "book_notes_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "book_notes_parent_note_id_fkey"
            columns: ["parent_note_id"]
            isOneToOne: false
            referencedRelation: "book_notes"
            referencedColumns: ["id"]
          },
        ]
      }
      books: {
        Row: {
          author: string | null
          cover_url: string | null
          created_at: string | null
          current_page: number | null
          finished_at: string | null
          id: string
          isbn: string | null
          routine_id: string
          started_at: string | null
          status: string | null
          title: string
          total_pages: number | null
          user_id: string
        }
        Insert: {
          author?: string | null
          cover_url?: string | null
          created_at?: string | null
          current_page?: number | null
          finished_at?: string | null
          id?: string
          isbn?: string | null
          routine_id: string
          started_at?: string | null
          status?: string | null
          title: string
          total_pages?: number | null
          user_id: string
        }
        Update: {
          author?: string | null
          cover_url?: string | null
          created_at?: string | null
          current_page?: number | null
          finished_at?: string | null
          id?: string
          isbn?: string | null
          routine_id?: string
          started_at?: string | null
          status?: string | null
          title?: string
          total_pages?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "books_routine_id_fkey"
            columns: ["routine_id"]
            isOneToOne: false
            referencedRelation: "routines"
            referencedColumns: ["id"]
          },
        ]
      }
      github_connections: {
        Row: {
          avatar_url: string | null
          connected_at: string
          encrypted_token: string
          github_user_id: number | null
          github_username: string
          refresh_token: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          connected_at?: string
          encrypted_token: string
          github_user_id?: number | null
          github_username: string
          refresh_token?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          connected_at?: string
          encrypted_token?: string
          github_user_id?: number | null
          github_username?: string
          refresh_token?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          accent_theme: string
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          theme: string | null
          timezone: string
          updated_at: string
          username: string
        }
        Insert: {
          accent_theme?: string
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          theme?: string | null
          timezone?: string
          updated_at?: string
          username: string
        }
        Update: {
          accent_theme?: string
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          theme?: string | null
          timezone?: string
          updated_at?: string
          username?: string
        }
        Relationships: []
      }
      project_categories: {
        Row: {
          created_at: string | null
          id: string
          name: string
          position: number | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          position?: number | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          position?: number | null
          user_id?: string
        }
        Relationships: []
      }
      project_links: {
        Row: {
          created_at: string | null
          favicon_url: string | null
          id: string
          position: number | null
          project_id: string
          title: string
          url: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          favicon_url?: string | null
          id?: string
          position?: number | null
          project_id: string
          title: string
          url: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          favicon_url?: string | null
          id?: string
          position?: number | null
          project_id?: string
          title?: string
          url?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_links_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_media: {
        Row: {
          created_at: string
          id: string
          mime_type: string
          project_id: string
          size_bytes: number
          storage_path: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          mime_type: string
          project_id: string
          size_bytes: number
          storage_path: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          mime_type?: string
          project_id?: string
          size_bytes?: number
          storage_path?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_media_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_media_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      project_tasks: {
        Row: {
          created_at: string | null
          due_date: string | null
          id: string
          is_completed: boolean | null
          name: string
          parent_task_id: string | null
          position: number | null
          project_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          due_date?: string | null
          id?: string
          is_completed?: boolean | null
          name: string
          parent_task_id?: string | null
          position?: number | null
          project_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          due_date?: string | null
          id?: string
          is_completed?: boolean | null
          name?: string
          parent_task_id?: string | null
          position?: number | null
          project_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_tasks_parent_task_id_fkey"
            columns: ["parent_task_id"]
            isOneToOne: false
            referencedRelation: "project_tasks"
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
      project_updates: {
        Row: {
          content: string
          created_at: string
          id: string
          project_id: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          project_id: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          project_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_updates_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_updates_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          category_id: string | null
          created_at: string
          description: string | null
          github_default_branch: string | null
          github_repo: string | null
          github_url: string | null
          icon: string | null
          id: string
          is_archived: boolean | null
          name: string
          repo_url: string | null
          started_at: string | null
          status: string
          target_date: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          category_id?: string | null
          created_at?: string
          description?: string | null
          github_default_branch?: string | null
          github_repo?: string | null
          github_url?: string | null
          icon?: string | null
          id?: string
          is_archived?: boolean | null
          name: string
          repo_url?: string | null
          started_at?: string | null
          status?: string
          target_date?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          category_id?: string | null
          created_at?: string
          description?: string | null
          github_default_branch?: string | null
          github_repo?: string | null
          github_url?: string | null
          icon?: string | null
          id?: string
          is_archived?: boolean | null
          name?: string
          repo_url?: string | null
          started_at?: string | null
          status?: string
          target_date?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "project_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      reading_sessions: {
        Row: {
          book_id: string
          created_at: string | null
          date: string
          id: string
          minutes_spent: number | null
          note: string | null
          pages_read: number
          user_id: string
        }
        Insert: {
          book_id: string
          created_at?: string | null
          date?: string
          id?: string
          minutes_spent?: number | null
          note?: string | null
          pages_read: number
          user_id: string
        }
        Update: {
          book_id?: string
          created_at?: string | null
          date?: string
          id?: string
          minutes_spent?: number | null
          note?: string | null
          pages_read?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reading_sessions_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
        ]
      }
      reminders: {
        Row: {
          created_at: string | null
          id: string
          item_id: string
          item_type: string
          remind_at: string
          repeat_rule: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          item_id: string
          item_type: string
          remind_at: string
          repeat_rule?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          item_id?: string
          item_type?: string
          remind_at?: string
          repeat_rule?: string | null
          user_id?: string
        }
        Relationships: []
      }
      routine_categories: {
        Row: {
          created_at: string | null
          icon: string | null
          id: string
          name: string
          position: number | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          icon?: string | null
          id?: string
          name: string
          position?: number | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          icon?: string | null
          id?: string
          name?: string
          position?: number | null
          user_id?: string
        }
        Relationships: []
      }
      routine_logs: {
        Row: {
          completed_at: string
          created_at: string
          id: string
          logged_late: boolean | null
          notes: string | null
          routine_id: string
          user_id: string
        }
        Insert: {
          completed_at?: string
          created_at?: string
          id?: string
          logged_late?: boolean | null
          notes?: string | null
          routine_id: string
          user_id: string
        }
        Update: {
          completed_at?: string
          created_at?: string
          id?: string
          logged_late?: boolean | null
          notes?: string | null
          routine_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "routine_logs_routine_id_fkey"
            columns: ["routine_id"]
            isOneToOne: false
            referencedRelation: "routines"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "routine_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      routines: {
        Row: {
          category_id: string | null
          created_at: string
          custom_days: number[] | null
          description: string | null
          frequency: Database["public"]["Enums"]["routine_frequency"]
          id: string
          is_active: boolean
          is_must_do: boolean
          name: string
          time_of_day: string | null
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category_id?: string | null
          created_at?: string
          custom_days?: number[] | null
          description?: string | null
          frequency?: Database["public"]["Enums"]["routine_frequency"]
          id?: string
          is_active?: boolean
          is_must_do?: boolean
          name: string
          time_of_day?: string | null
          type?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category_id?: string | null
          created_at?: string
          custom_days?: number[] | null
          description?: string | null
          frequency?: Database["public"]["Enums"]["routine_frequency"]
          id?: string
          is_active?: boolean
          is_must_do?: boolean
          name?: string
          time_of_day?: string | null
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "routines_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "routine_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "routines_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      streaks: {
        Row: {
          current_streak: number
          id: string
          last_completed_date: string | null
          longest_streak: number
          routine_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          current_streak?: number
          id?: string
          last_completed_date?: string | null
          longest_streak?: number
          routine_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          current_streak?: number
          id?: string
          last_completed_date?: string | null
          longest_streak?: number
          routine_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "streaks_routine_id_fkey"
            columns: ["routine_id"]
            isOneToOne: false
            referencedRelation: "routines"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "streaks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      task_logs: {
        Row: {
          action: Database["public"]["Enums"]["task_action"]
          created_at: string
          id: string
          metadata: Json | null
          task_id: string
          user_id: string
        }
        Insert: {
          action: Database["public"]["Enums"]["task_action"]
          created_at?: string
          id?: string
          metadata?: Json | null
          task_id: string
          user_id: string
        }
        Update: {
          action?: Database["public"]["Enums"]["task_action"]
          created_at?: string
          id?: string
          metadata?: Json | null
          task_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_logs_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      task_media: {
        Row: {
          caption: string | null
          created_at: string | null
          file_name: string | null
          file_size_bytes: number | null
          file_type: string | null
          file_url: string
          id: string
          project_id: string | null
          task_id: string | null
          user_id: string
        }
        Insert: {
          caption?: string | null
          created_at?: string | null
          file_name?: string | null
          file_size_bytes?: number | null
          file_type?: string | null
          file_url: string
          id?: string
          project_id?: string | null
          task_id?: string | null
          user_id: string
        }
        Update: {
          caption?: string | null
          created_at?: string | null
          file_name?: string | null
          file_size_bytes?: number | null
          file_type?: string | null
          file_url?: string
          id?: string
          project_id?: string | null
          task_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_media_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_media_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "project_tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          created_at: string
          description: string | null
          due_date: string | null
          id: string
          priority: Database["public"]["Enums"]["task_priority"]
          project_id: string | null
          status: Database["public"]["Enums"]["task_status"]
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: Database["public"]["Enums"]["task_priority"]
          project_id?: string | null
          status?: Database["public"]["Enums"]["task_status"]
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: Database["public"]["Enums"]["task_priority"]
          project_id?: string | null
          status?: Database["public"]["Enums"]["task_status"]
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      todos: {
        Row: {
          created_at: string | null
          description: string | null
          due_date: string | null
          id: string
          is_completed: boolean | null
          priority: string | null
          project_id: string | null
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          is_completed?: boolean | null
          priority?: string | null
          project_id?: string | null
          title: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          is_completed?: boolean | null
          priority?: string | null
          project_id?: string | null
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "todos_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      routine_heatmap: {
        Row: {
          completion_count: number | null
          completion_ratio: number | null
          local_date: string | null
          user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "routine_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      clear_github_connection: { Args: never; Returns: undefined }
      get_github_connection_info: {
        Args: never
        Returns: {
          avatar_url: string
          connected_at: string
          github_user_id: number
          github_username: string
        }[]
      }
      get_github_token: { Args: never; Returns: string }
      get_heatmap_range: {
        Args: { end_date: string; start_date: string }
        Returns: {
          completion_count: number
          completion_ratio: number
          local_date: string
        }[]
      }
      get_today_routines: {
        Args: never
        Returns: {
          completed_at: string
          completed_today: boolean
          description: string
          frequency: Database["public"]["Enums"]["routine_frequency"]
          name: string
          routine_id: string
          time_of_day: string
        }[]
      }
      recalculate_streak: {
        Args: { p_routine_id: string; p_user_id: string }
        Returns: undefined
      }
      set_github_connection: {
        Args: {
          p_access_token: string
          p_avatar_url?: string
          p_refresh_token: string
          p_user_id_gh?: number
          p_username: string
        }
        Returns: undefined
      }
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
    }
    Enums: {
      project_status: "active" | "paused" | "completed" | "archived"
      routine_frequency: "daily" | "weekdays" | "weekends" | "custom"
      task_action:
        | "created"
        | "status_changed"
        | "due_date_changed"
        | "completed"
        | "reopened"
      task_priority: "low" | "medium" | "high" | "urgent"
      task_status: "todo" | "in_progress" | "done" | "cancelled"
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
    Enums: {
      project_status: ["active", "paused", "completed", "archived"],
      routine_frequency: ["daily", "weekdays", "weekends", "custom"],
      task_action: [
        "created",
        "status_changed",
        "due_date_changed",
        "completed",
        "reopened",
      ],
      task_priority: ["low", "medium", "high", "urgent"],
      task_status: ["todo", "in_progress", "done", "cancelled"],
    },
  },
} as const
