export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      companies: {
        Row: {
          id: string
          name: string
          slug: string
          owner_id: string | null
          logo_url: string | null
          country: string | null
          currency: string
          timezone: string
          plan: 'starter' | 'pro' | 'enterprise'
          status: 'active' | 'suspended' | 'cancelled'
          custom_domain: string | null
          website_settings: {
            hero_title?: string
            hero_subtitle?: string
            hero_image?: string | null
            theme_color?: string
            show_prices?: boolean
          } | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          owner_id?: string | null
          logo_url?: string | null
          country?: string | null
          currency?: string
          timezone?: string
          plan?: 'starter' | 'pro' | 'enterprise'
          status?: 'active' | 'suspended' | 'cancelled'
          custom_domain?: string | null
          website_settings?: {
            hero_title?: string
            hero_subtitle?: string
            hero_image?: string | null
            theme_color?: string
            show_prices?: boolean
          } | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          owner_id?: string | null
          logo_url?: string | null
          country?: string | null
          currency?: string
          timezone?: string
          plan?: 'starter' | 'pro' | 'enterprise'
          status?: 'active' | 'suspended' | 'cancelled'
          custom_domain?: string | null
          website_settings?: {
            hero_title?: string
            hero_subtitle?: string
            hero_image?: string | null
            theme_color?: string
            show_prices?: boolean
          } | null
          created_at?: string
          updated_at?: string
        }
      }
      profiles: {
        Row: {
          id: string
          company_id: string | null
          full_name: string | null
          email: string | null
          phone: string | null
          avatar_url: string | null
          role: 'owner' | 'admin' | 'staff' | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          company_id?: string | null
          full_name?: string | null
          email?: string | null
          phone?: string | null
          avatar_url?: string | null
          role?: 'owner' | 'admin' | 'staff' | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          company_id?: string | null
          full_name?: string | null
          email?: string | null
          phone?: string | null
          avatar_url?: string | null
          role?: 'owner' | 'admin' | 'staff' | null
          created_at?: string
          updated_at?: string
        }
      }
      products: {
        Row: {
          id: string
          company_id: string
          name: string
          description: string | null
          price: number
          compare_price: number | null
          sku: string | null
          stock: number
          category: string | null
          images: string[]
          variants: { name: string; value: string; price_adjustment?: number }[]
          is_published: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          company_id: string
          name: string
          description?: string | null
          price: number
          compare_price?: number | null
          sku?: string | null
          stock?: number
          category?: string | null
          images?: string[]
          variants?: { name: string; value: string; price_adjustment?: number }[]
          is_published?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          name?: string
          description?: string | null
          price?: number
          compare_price?: number | null
          sku?: string | null
          stock?: number
          category?: string | null
          images?: string[]
          variants?: { name: string; value: string; price_adjustment?: number }[]
          is_published?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      categories: {
        Row: {
          id: string
          company_id: string
          name: string
          slug: string
          description: string | null
          image_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          company_id: string
          name: string
          slug: string
          description?: string | null
          image_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          name?: string
          slug?: string
          description?: string | null
          image_url?: string | null
          created_at?: string
        }
      }
      payments: {
        Row: {
          id: string
          user_id: string
          total_amount: number
          method: string
          status: 'pending' | 'processing' | 'completed' | 'failed'
          created_at: string
          proof_url?: string
          payment_proof?: string
          reference_number?: string
          quotation_ids?: string[]
        }
        Insert: {
          id?: string
          user_id: string
          total_amount: number
          method: string
          status?: 'pending' | 'processing' | 'completed' | 'failed'
          created_at?: string
          proof_url?: string
          payment_proof?: string
          reference_number?: string
          quotation_ids?: string[]
        }
        Update: {
          id?: string
          user_id?: string
          total_amount?: number
          method?: string
          status?: 'pending' | 'processing' | 'completed' | 'failed'
          created_at?: string
          proof_url?: string
          payment_proof?: string
          reference_number?: string
          quotation_ids?: string[]
        }
      }
      payment_quotations: {
        Row: {
          id: string
          payment_id: string
          quotation_id: string
          user_id: string
          created_at: string
        }
        Insert: {
          id?: string
          payment_id: string
          quotation_id: string
          user_id: string
          created_at?: string
        }
        Update: {
          id?: string
          payment_id?: string
          quotation_id?: string
          user_id?: string
          created_at?: string
        }
      }
      quotations: {
        Row: {
          id: string
          quotation_id: string
          product_name: string
          quantity: number
          status: string
          created_at: string
          product_images?: string[]
          image_url?: string
          hasImage?: boolean
          service_type?: string
          product_url?: string
          shipping_method?: string
          shipping_country?: string
          shipping_city?: string
          title_option1?: string
          total_price_option1?: string
          delivery_time_option1?: string
          description_option1?: string
          image_option1?: string
          title_option2?: string
          total_price_option2?: string
          delivery_time_option2?: string
          description_option2?: string
          image_option2?: string
          title_option3?: string
          total_price_option3?: string
          delivery_time_option3?: string
          description_option3?: string
          image_option3?: string
          user_id: string
        }
        Insert: {
          id?: string
          quotation_id: string
          product_name: string
          quantity: number
          status?: string
          created_at?: string
          product_images?: string[]
          image_url?: string
          hasImage?: boolean
          service_type?: string
          product_url?: string
          shipping_method?: string
          shipping_country?: string
          shipping_city?: string
          title_option1?: string
          total_price_option1?: string
          delivery_time_option1?: string
          description_option1?: string
          image_option1?: string
          title_option2?: string
          total_price_option2?: string
          delivery_time_option2?: string
          description_option2?: string
          image_option2?: string
          title_option3?: string
          total_price_option3?: string
          delivery_time_option3?: string
          description_option3?: string
          image_option3?: string
          user_id?: string
        }
        Update: {
          id?: string
          quotation_id?: string
          product_name?: string
          quantity?: number
          status?: string
          created_at?: string
          product_images?: string[]
          image_url?: string
          hasImage?: boolean
          service_type?: string
          product_url?: string
          shipping_method?: string
          shipping_country?: string
          shipping_city?: string
          title_option1?: string
          total_price_option1?: string
          delivery_time_option1?: string
          description_option1?: string
          image_option1?: string
          title_option2?: string
          total_price_option2?: string
          delivery_time_option2?: string
          description_option2?: string
          image_option2?: string
          title_option3?: string
          total_price_option3?: string
          delivery_time_option3?: string
          description_option3?: string
          image_option3?: string
          user_id?: string
        }
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
  }
} 