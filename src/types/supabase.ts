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
                    created_at: string | null
                    description: string | null
                    id: string
                    image_url: string | null
                    name: string
                }
                Insert: {
                    created_at?: string | null
                    description?: string | null
                    id?: string
                    image_url?: string | null
                    name: string
                }
                Update: {
                    created_at?: string | null
                    description?: string | null
                    id?: string
                    image_url?: string | null
                    name?: string
                }
                Relationships: []
            }
            home_media: {
                Row: {
                    created_at: string | null
                    description: string | null
                    headline: string
                    id: string
                    image_url: string | null
                    is_active: boolean | null
                    video_url: string | null
                }
                Insert: {
                    created_at?: string | null
                    description?: string | null
                    headline: string
                    id?: string
                    image_url?: string | null
                    is_active?: boolean | null
                    video_url?: string | null
                }
                Update: {
                    created_at?: string | null
                    description?: string | null
                    headline?: string
                    id?: string
                    image_url?: string | null
                    is_active?: boolean | null
                    video_url?: string | null
                }
                Relationships: []
            }
            honorees: {
                Row: {
                    award_id: string | null
                    biography: string | null
                    created_at: string | null
                    id: string
                    initiatives: string | null
                    is_published: boolean | null
                    photo_url: string | null
                    professional_data: string | null
                    recognitions: string | null
                    stats: Json | null
                    timeline: Json | null
                    type: string
                    video_url: string | null
                }
                Insert: {
                    award_id?: string | null
                    biography?: string | null
                    created_at?: string | null
                    id?: string
                    initiatives?: string | null
                    is_published?: boolean | null
                    photo_url?: string | null
                    professional_data?: string | null
                    recognitions?: string | null
                    stats?: Json | null
                    timeline?: Json | null
                    type: string
                    video_url?: string | null
                }
                Update: {
                    award_id?: string | null
                    biography?: string | null
                    created_at?: string | null
                    id?: string
                    initiatives?: string | null
                    is_published?: boolean | null
                    photo_url?: string | null
                    professional_data?: string | null
                    recognitions?: string | null
                    stats?: Json | null
                    timeline?: Json | null
                    type?: string
                    video_url?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "honorees_award_id_fkey"
                        columns: ["award_id"]
                        isOneToOne: false
                        referencedRelation: "awards"
                        referencedColumns: ["id"]
                    }
                ]
            }
            units: {
                Row: {
                    created_at: string | null
                    id: string
                    location: string
                    name: string
                }
                Insert: {
                    created_at?: string | null
                    id?: string
                    location: string
                    name: string
                }
                Update: {
                    created_at?: string | null
                    id?: string
                    location?: string
                    name?: string
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
