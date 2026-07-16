export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5";
  };
  public: {
    Tables: {
      arc_mappings: {
        Row: {
          arc: string | null;
          chapter_end: number;
          chapter_start: number;
          episode_end: number | null;
          episode_start: number | null;
          id: number;
          note: string | null;
          position: number;
          season: number | null;
          series_id: number;
        };
        Insert: {
          arc?: string | null;
          chapter_end: number;
          chapter_start: number;
          episode_end?: number | null;
          episode_start?: number | null;
          id?: never;
          note?: string | null;
          position: number;
          season?: number | null;
          series_id: number;
        };
        Update: {
          arc?: string | null;
          chapter_end?: number;
          chapter_start?: number;
          episode_end?: number | null;
          episode_start?: number | null;
          id?: never;
          note?: string | null;
          position?: number;
          season?: number | null;
          series_id?: number;
        };
        Relationships: [
          {
            foreignKeyName: "arc_mappings_series_id_fkey";
            columns: ["series_id"];
            isOneToOne: false;
            referencedRelation: "series";
            referencedColumns: ["id"];
          },
        ];
      };
      genre_filters: {
        Row: {
          id: string;
          kind: string;
          label: string;
          sort_order: number;
          token: string;
        };
        Insert: {
          id: string;
          kind: string;
          label: string;
          sort_order: number;
          token: string;
        };
        Update: {
          id?: string;
          kind?: string;
          label?: string;
          sort_order?: number;
          token?: string;
        };
        Relationships: [];
      };
      movies: {
        Row: {
          after_episode: number | null;
          anilist_id: number | null;
          chapter_end: number | null;
          chapter_start: number | null;
          id: number;
          note: string | null;
          position: number;
          series_id: number;
          title: string;
          year: number;
        };
        Insert: {
          after_episode?: number | null;
          anilist_id?: number | null;
          chapter_end?: number | null;
          chapter_start?: number | null;
          id?: never;
          note?: string | null;
          position: number;
          series_id: number;
          title: string;
          year: number;
        };
        Update: {
          after_episode?: number | null;
          anilist_id?: number | null;
          chapter_end?: number | null;
          chapter_start?: number | null;
          id?: never;
          note?: string | null;
          position?: number;
          series_id?: number;
          title?: string;
          year?: number;
        };
        Relationships: [
          {
            foreignKeyName: "movies_series_id_fkey";
            columns: ["series_id"];
            isOneToOne: false;
            referencedRelation: "series";
            referencedColumns: ["id"];
          },
        ];
      };
      search_aliases: {
        Row: {
          alias: string;
          target: string;
        };
        Insert: {
          alias: string;
          target: string;
        };
        Update: {
          alias?: string;
          target?: string;
        };
        Relationships: [];
      };
      series: {
        Row: {
          anilist_anime_id: number;
          anilist_manga_id: number;
          created_at: string;
          id: number;
          source_notes: string | null;
          title: string;
          updated_at: string;
        };
        Insert: {
          anilist_anime_id: number;
          anilist_manga_id: number;
          created_at?: string;
          id?: never;
          source_notes?: string | null;
          title: string;
          updated_at?: string;
        };
        Update: {
          anilist_anime_id?: number;
          anilist_manga_id?: number;
          created_at?: string;
          id?: never;
          source_notes?: string | null;
          title?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      user_preferences: {
        Row: {
          hidden_genres: string[];
          japanese: boolean;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          hidden_genres?: string[];
          japanese?: boolean;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          hidden_genres?: string[];
          japanese?: boolean;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      user_progress: {
        Row: {
          position: number;
          route_id: number;
          side: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          position: number;
          route_id: number;
          side: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          position?: number;
          route_id?: number;
          side?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};
