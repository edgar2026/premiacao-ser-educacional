export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export type Database = {
    public: {
        Tables: {
            awards: {
                Row: {
                    id: string
                    created_at: string | null
                    name: string
                    description: string | null
                    image_url: string | null
                    criteria: Json | null
                    cycle_info: Json | null
                }
                Insert: {
                    id?: string
                    created_at?: string | null
                    name: string
                    description?: string | null
                    image_url?: string | null
                    criteria?: Json | null
                    cycle_info?: Json | null
                }
                Update: {
                    id?: string
                    created_at?: string | null
                    name?: string
                    description?: string | null
                    image_url?: string | null
                    criteria?: Json | null
                    cycle_info?: Json | null
                }
                Relationships: []
            }
            home_media: {
                Row: {
                    id: string
                    created_at: string | null
                    headline: string
                    description: string | null
                    image_url: string | null
                    video_url: string | null
                    is_active: boolean | null
                }
                Insert: {
                    id?: string
                    created_at?: string | null
                    headline: string
                    description?: string | null
                    image_url?: string | null
                    video_url?: string | null
                    is_active?: boolean | null
                }
                Update: {
                    id?: string
                    created_at?: string | null
                    headline?: string
                    description?: string | null
                    image_url?: string | null
                    video_url?: string | null
                    is_active?: boolean | null
                }
                Relationships: []
            }
            honorees: {
                Row: {
                    id: string
                    created_at: string | null
                    type: string | null
                    professional_data: string | null
                    biography: string | null
                    photo_url: string | null
                    video_url: string | null
                    award_id: string | null
                    is_published: boolean | null
                    stats: Json | null
                    timeline: Json | null
                    initiatives: string | null
                    recognitions: string | null
                }
                Insert: {
                    id?: string
                    created_at?: string | null
                    type?: string | null
                    professional_data?: string | null
                    biography?: string | null
                    photo_url?: string | null
                    video_url?: string | null
                    award_id?: string | null
                    is_published?: boolean | null
                    stats?: Json | null
                    timeline?: Json | null
                    initiatives?: string | null
                    recognitions?: string | null
                }
                Update: {
                    id?: string
                    created_at?: string | null
                    type?: string | null
                    professional_data?: string | null
                    biography?: string | null
                    photo_url?: string | null
                    video_url?: string | null
                    award_id?: string | null
                    is_published?: boolean | null
                    stats?: Json | null
                    timeline?: Json | null
                    initiatives?: string | null
                    recognitions?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "honorees_award_id_fkey"
                        columns: ["award_id"]
                        isOneToOne: false
                        referencedRelation: "awards"
                        referencedColumns: ["id"]
                    },
                ]
            }
            units: {
                Row: {
                    id: string
                    created_at: string | null
                    name: string
                    location: string
                    latitude: number | null
                    longitude: number | null
                }
                Insert: {
                    id?: string
                    created_at?: string | null
                    name: string
                    location: string
                    latitude?: number | null
                    longitude?: number | null
                }
                Update: {
                    id?: string
                    created_at?: string | null
                    name?: string
                    location?: string
                    latitude?: number | null
                    longitude?: number | null
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

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type TablesInsert<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert'];
export type TablesUpdate<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update'];
