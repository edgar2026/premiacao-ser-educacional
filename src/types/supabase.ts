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
                    criteria: Json | null
                    cycle_info: Json | null
                    description: string | null
                    id: string
                    image_url: string | null
                    name: string
                }
                Insert: {
                    created_at?: string | null
                    criteria?: Json | null
                    cycle_info?: Json | null
                    description?: string | null
                    id?: string
                    image_url?: string | null
                    name: string
                }
                Update: {
                    created_at?: string | null
                    criteria?: Json | null
                    cycle_info?: Json | null
                    description?: string | null
                    id?: string
                    image_url?: string | null
                    name?: string
                }
                Relationships: []
            }
            brands: {
                Row: {
                    created_at: string | null
                    id: string
                    name: string
                }
                Insert: {
                    created_at?: string | null
                    id?: string
                    name: string
                }
                Update: {
                    created_at?: string | null
                    id?: string
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
                    awarded_at: string
                    biography: string | null
                    brand_id: string
                    created_at: string | null
                    id: string
                    initiatives: string | null
                    is_published: boolean | null
                    photo_url: string | null
                    professional_data: string | null
                    recognitions: string | null
                    stats: Json | null
                    timeline: Json | null
                    type: string | null
                    unit_id: string
                    video_url: string | null
                }
                Insert: {
                    award_id?: string | null
                    awarded_at: string
                    biography?: string | null
                    brand_id: string
                    created_at?: string | null
                    id?: string
                    initiatives?: string | null
                    is_published?: boolean | null
                    photo_url?: string | null
                    professional_data?: string | null
                    recognitions?: string | null
                    stats?: Json | null
                    timeline?: Json | null
                    type?: string | null
                    unit_id: string
                    video_url?: string | null
                }
                Update: {
                    award_id?: string | null
                    awarded_at?: string
                    biography?: string | null
                    brand_id?: string
                    created_at?: string | null
                    id?: string
                    initiatives?: string | null
                    is_published?: boolean | null
                    photo_url?: string | null
                    professional_data?: string | null
                    recognitions?: string | null
                    stats?: Json | null
                    timeline?: Json | null
                    type?: string | null
                    unit_id?: string
                    video_url?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "honorees_award_id_fkey"
                        columns: ["award_id"]
                        isOneToOne: false
                        referencedRelation: "awards"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "honorees_brand_id_fkey"
                        columns: ["brand_id"]
                        isOneToOne: false
                        referencedRelation: "brands"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "honorees_unit_id_fkey"
                        columns: ["unit_id"]
                        isOneToOne: false
                        referencedRelation: "units"
                        referencedColumns: ["id"]
                    }
                ]
            }
            units: {
                Row: {
                    brand_id: string
                    created_at: string | null
                    id: string
                    latitude: number | null
                    location: string
                    longitude: number | null
                    name: string
                }
                Insert: {
                    brand_id: string
                    created_at?: string | null
                    id?: string
                    latitude?: number | null
                    location: string
                    longitude?: number | null
                    name: string
                }
                Update: {
                    brand_id?: string
                    created_at?: string | null
                    id?: string
                    latitude?: number | null
                    location?: string
                    longitude?: number | null
                    name?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "units_brand_id_fkey"
                        columns: ["brand_id"]
                        isOneToOne: false
                        referencedRelation: "brands"
                        referencedColumns: ["id"]
                    }
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
