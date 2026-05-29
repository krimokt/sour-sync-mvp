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
      bank_accounts: {
        Row: {
          account_name: string
          account_number: string | null
          bank_name: string
          branch_address: string | null
          branch_name: string | null
          company_id: string
          created_at: string | null
          currency: string | null
          iban: string | null
          id: string
          image_url: string | null
          instructions: string | null
          is_active: boolean | null
          rib: string | null
          routing_number: string | null
          sort_order: number | null
          swift_code: string | null
          updated_at: string | null
        }
        Insert: {
          account_name: string
          account_number?: string | null
          bank_name: string
          branch_address?: string | null
          branch_name?: string | null
          company_id: string
          created_at?: string | null
          currency?: string | null
          iban?: string | null
          id?: string
          image_url?: string | null
          instructions?: string | null
          is_active?: boolean | null
          rib?: string | null
          routing_number?: string | null
          sort_order?: number | null
          swift_code?: string | null
          updated_at?: string | null
        }
        Update: {
          account_name?: string
          account_number?: string | null
          bank_name?: string
          branch_address?: string | null
          branch_name?: string | null
          company_id?: string
          created_at?: string | null
          currency?: string | null
          iban?: string | null
          id?: string
          image_url?: string | null
          instructions?: string | null
          is_active?: boolean | null
          rib?: string | null
          routing_number?: string | null
          sort_order?: number | null
          swift_code?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bank_accounts_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      cart_items: {
        Row: {
          cart_id: string
          created_at: string | null
          id: string
          notes: string | null
          price_at_add: number
          product_id: string
          quantity: number
          updated_at: string | null
        }
        Insert: {
          cart_id: string
          created_at?: string | null
          id?: string
          notes?: string | null
          price_at_add: number
          product_id: string
          quantity?: number
          updated_at?: string | null
        }
        Update: {
          cart_id?: string
          created_at?: string | null
          id?: string
          notes?: string | null
          price_at_add?: number
          product_id?: string
          quantity?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cart_items_cart_id_fkey"
            columns: ["cart_id"]
            isOneToOne: false
            referencedRelation: "carts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cart_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      carts: {
        Row: {
          company_id: string
          created_at: string | null
          currency: string | null
          id: string
          notes: string | null
          session_id: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          company_id: string
          created_at?: string | null
          currency?: string | null
          id?: string
          notes?: string | null
          session_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          company_id?: string
          created_at?: string | null
          currency?: string | null
          id?: string
          notes?: string | null
          session_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "carts_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          company_id: string
          created_at: string | null
          description: string | null
          id: string
          image_url: string | null
          name: string
          slug: string
        }
        Insert: {
          company_id: string
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          name: string
          slug: string
        }
        Update: {
          company_id?: string
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          name?: string
          slug?: string
        }
        Relationships: [
          {
            foreignKeyName: "categories_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      client_addresses: {
        Row: {
          address_line_1: string | null
          address_line_2: string | null
          city: string | null
          company_id: string
          company_name: string | null
          country: string
          created_at: string | null
          first_name: string | null
          full_name: string | null
          id: string
          is_default: boolean | null
          last_name: string | null
          phone: string | null
          postal_code: string | null
          state: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          address_line_1?: string | null
          address_line_2?: string | null
          city?: string | null
          company_id: string
          company_name?: string | null
          country: string
          created_at?: string | null
          first_name?: string | null
          full_name?: string | null
          id?: string
          is_default?: boolean | null
          last_name?: string | null
          phone?: string | null
          postal_code?: string | null
          state?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          address_line_1?: string | null
          address_line_2?: string | null
          city?: string | null
          company_id?: string
          company_name?: string | null
          country?: string
          created_at?: string | null
          first_name?: string | null
          full_name?: string | null
          id?: string
          is_default?: boolean | null
          last_name?: string | null
          phone?: string | null
          postal_code?: string | null
          state?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_addresses_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      client_magic_links: {
        Row: {
          client_id: string
          client_name_snapshot: string
          client_phone_snapshot: string
          company_id: string
          created_at: string | null
          created_by: string | null
          expires_at: string
          id: string
          last_accessed_at: string | null
          max_uses: number | null
          quotation_id: string | null
          revoked_at: string | null
          scopes: string[] | null
          token_hash: string
          updated_at: string | null
          use_count: number | null
        }
        Insert: {
          client_id: string
          client_name_snapshot: string
          client_phone_snapshot: string
          company_id: string
          created_at?: string | null
          created_by?: string | null
          expires_at: string
          id?: string
          last_accessed_at?: string | null
          max_uses?: number | null
          quotation_id?: string | null
          revoked_at?: string | null
          scopes?: string[] | null
          token_hash: string
          updated_at?: string | null
          use_count?: number | null
        }
        Update: {
          client_id?: string
          client_name_snapshot?: string
          client_phone_snapshot?: string
          company_id?: string
          created_at?: string | null
          created_by?: string | null
          expires_at?: string
          id?: string
          last_accessed_at?: string | null
          max_uses?: number | null
          quotation_id?: string | null
          revoked_at?: string | null
          scopes?: string[] | null
          token_hash?: string
          updated_at?: string | null
          use_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "client_magic_links_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_magic_links_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_magic_links_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_magic_links_quotation_id_fkey"
            columns: ["quotation_id"]
            isOneToOne: false
            referencedRelation: "quotations"
            referencedColumns: ["id"]
          },
        ]
      }
      client_otp_verifications: {
        Row: {
          code: string
          company_id: string
          created_at: string
          email: string
          expires_at: string
          id: string
          used: boolean
        }
        Insert: {
          code: string
          company_id: string
          created_at?: string
          email: string
          expires_at: string
          id?: string
          used?: boolean
        }
        Update: {
          code?: string
          company_id?: string
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          used?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "client_otp_verifications_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          company_id: string
          company_name: string | null
          created_at: string | null
          email: string | null
          id: string
          name: string | null
          notes: string | null
          phone_e164: string | null
          status: string | null
          tags: string[] | null
          tax_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          company_id: string
          company_name?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          name?: string | null
          notes?: string | null
          phone_e164?: string | null
          status?: string | null
          tags?: string[] | null
          tax_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          company_id?: string
          company_name?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          name?: string | null
          notes?: string | null
          phone_e164?: string | null
          status?: string | null
          tags?: string[] | null
          tax_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "clients_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      companies: {
        Row: {
          country: string | null
          created_at: string
          currency: string | null
          custom_domain: string | null
          email_from_domain: string | null
          id: string
          logo_url: string | null
          name: string
          owner_id: string | null
          plan: string | null
          quotation_countries: Json | null
          quotation_input_fields: Json | null
          resend_api_key: string | null
          slug: string
          status: string | null
          subscription_expires_at: string | null
          subscription_period_id: string | null
          subscription_started_at: string | null
          timezone: string | null
          updated_at: string
          website_settings: Json | null
        }
        Insert: {
          country?: string | null
          created_at?: string
          currency?: string | null
          custom_domain?: string | null
          email_from_domain?: string | null
          id?: string
          logo_url?: string | null
          name: string
          owner_id?: string | null
          plan?: string | null
          quotation_countries?: Json | null
          quotation_input_fields?: Json | null
          resend_api_key?: string | null
          slug: string
          status?: string | null
          subscription_expires_at?: string | null
          subscription_period_id?: string | null
          subscription_started_at?: string | null
          timezone?: string | null
          updated_at?: string
          website_settings?: Json | null
        }
        Update: {
          country?: string | null
          created_at?: string
          currency?: string | null
          custom_domain?: string | null
          email_from_domain?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          owner_id?: string | null
          plan?: string | null
          quotation_countries?: Json | null
          quotation_input_fields?: Json | null
          resend_api_key?: string | null
          slug?: string
          status?: string | null
          subscription_expires_at?: string | null
          subscription_period_id?: string | null
          subscription_started_at?: string | null
          timezone?: string | null
          updated_at?: string
          website_settings?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "companies_subscription_period_id_fkey"
            columns: ["subscription_period_id"]
            isOneToOne: false
            referencedRelation: "subscription_periods"
            referencedColumns: ["id"]
          },
        ]
      }
      crypto_wallets: {
        Row: {
          company_id: string
          created_at: string | null
          cryptocurrency: string
          id: string
          image_url: string | null
          is_active: boolean | null
          network: string | null
          qr_code_url: string | null
          sort_order: number | null
          updated_at: string | null
          wallet_address: string
          wallet_name: string
        }
        Insert: {
          company_id: string
          created_at?: string | null
          cryptocurrency: string
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          network?: string | null
          qr_code_url?: string | null
          sort_order?: number | null
          updated_at?: string | null
          wallet_address: string
          wallet_name: string
        }
        Update: {
          company_id?: string
          created_at?: string | null
          cryptocurrency?: string
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          network?: string | null
          qr_code_url?: string | null
          sort_order?: number | null
          updated_at?: string | null
          wallet_address?: string
          wallet_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "crypto_wallets_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_quotations: {
        Row: {
          company_id: string | null
          created_at: string
          id: string
          payment_id: string
          quotation_id: string
          user_id: string
        }
        Insert: {
          company_id?: string | null
          created_at?: string
          id?: string
          payment_id: string
          quotation_id: string
          user_id: string
        }
        Update: {
          company_id?: string | null
          created_at?: string
          id?: string
          payment_id?: string
          quotation_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_quotations_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_quotations_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_quotations_quotation_id_fkey"
            columns: ["quotation_id"]
            isOneToOne: false
            referencedRelation: "quotations"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          billing_address: string | null
          company_id: string | null
          created_at: string
          currency: string
          id: string
          metadata: Json | null
          payer_email: string | null
          payer_name: string | null
          payment_date: string | null
          payment_method: string
          payment_notes: string | null
          payment_proof_url: string | null
          quotation_ids: string[] | null
          reference_number: string | null
          status: string
          transaction_id: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          amount: number
          billing_address?: string | null
          company_id?: string | null
          created_at?: string
          currency?: string
          id?: string
          metadata?: Json | null
          payer_email?: string | null
          payer_name?: string | null
          payment_date?: string | null
          payment_method?: string
          payment_notes?: string | null
          payment_proof_url?: string | null
          quotation_ids?: string[] | null
          reference_number?: string | null
          status?: string
          transaction_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          amount?: number
          billing_address?: string | null
          company_id?: string | null
          created_at?: string
          currency?: string
          id?: string
          metadata?: Json | null
          payer_email?: string | null
          payer_name?: string | null
          payment_date?: string | null
          payment_method?: string
          payment_notes?: string | null
          payment_proof_url?: string | null
          quotation_ids?: string[] | null
          reference_number?: string | null
          status?: string
          transaction_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      price_tiers: {
        Row: {
          base_price: number
          created_at: string | null
          id: string
          max_qty: number | null
          min_qty: number
          product_id: string
          sort_order: number | null
          updated_at: string | null
          variant_id: string | null
        }
        Insert: {
          base_price: number
          created_at?: string | null
          id?: string
          max_qty?: number | null
          min_qty: number
          product_id: string
          sort_order?: number | null
          updated_at?: string | null
          variant_id?: string | null
        }
        Update: {
          base_price?: number
          created_at?: string | null
          id?: string
          max_qty?: number | null
          min_qty?: number
          product_id?: string
          sort_order?: number | null
          updated_at?: string | null
          variant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "price_tiers_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          category: string | null
          company_id: string
          compare_price: number | null
          created_at: string | null
          description: string | null
          id: string
          images: string[] | null
          is_published: boolean | null
          moq: number | null
          name: string
          price: number
          sku: string | null
          stock: number | null
          updated_at: string | null
          variant_groups: Json | null
          variants: Json | null
        }
        Insert: {
          category?: string | null
          company_id: string
          compare_price?: number | null
          created_at?: string | null
          description?: string | null
          id?: string
          images?: string[] | null
          is_published?: boolean | null
          moq?: number | null
          name: string
          price: number
          sku?: string | null
          stock?: number | null
          updated_at?: string | null
          variant_groups?: Json | null
          variants?: Json | null
        }
        Update: {
          category?: string | null
          company_id?: string
          compare_price?: number | null
          created_at?: string | null
          description?: string | null
          id?: string
          images?: string[] | null
          is_published?: boolean | null
          moq?: number | null
          name?: string
          price?: number
          sku?: string | null
          stock?: number | null
          updated_at?: string | null
          variant_groups?: Json | null
          variants?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "products_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          company_id: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          phone: string | null
          role: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          company_id?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          phone?: string | null
          role?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          company_id?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          role?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      quotations: {
        Row: {
          alibaba_url: string | null
          company_id: string | null
          created_at: string
          delivery_time_option1: string | null
          delivery_time_option2: string | null
          delivery_time_option3: string | null
          description_option1: string | null
          description_option2: string | null
          description_option3: string | null
          destination_city: string
          destination_country: string
          hasimage: boolean | null
          id: string
          image_option1: string | null
          image_option2: string | null
          image_option3: string | null
          image_url: string | null
          image_urls: string[] | null
          notes: string | null
          price_description_option1: string | null
          price_description_option2: string | null
          price_description_option3: string | null
          price_per_unit_option1: string | null
          price_per_unit_option2: string | null
          price_per_unit_option3: string | null
          product_images: string[] | null
          product_name: string
          product_url: string | null
          quantity: number
          quotation_fees: string | null
          quotation_id: string
          selected_option: number | null
          service_type: string
          shipping_city: string | null
          shipping_country: string | null
          shipping_method: string
          status: string
          title_option1: string | null
          title_option2: string | null
          title_option3: string | null
          total_price_option1: string | null
          total_price_option2: string | null
          total_price_option3: string | null
          updated_at: string
          user_id: string | null
          variant_groups: Json | null
          variant_specs: string | null
        }
        Insert: {
          alibaba_url?: string | null
          company_id?: string | null
          created_at?: string
          delivery_time_option1?: string | null
          delivery_time_option2?: string | null
          delivery_time_option3?: string | null
          description_option1?: string | null
          description_option2?: string | null
          description_option3?: string | null
          destination_city: string
          destination_country: string
          hasimage?: boolean | null
          id?: string
          image_option1?: string | null
          image_option2?: string | null
          image_option3?: string | null
          image_url?: string | null
          image_urls?: string[] | null
          notes?: string | null
          price_description_option1?: string | null
          price_description_option2?: string | null
          price_description_option3?: string | null
          price_per_unit_option1?: string | null
          price_per_unit_option2?: string | null
          price_per_unit_option3?: string | null
          product_images?: string[] | null
          product_name: string
          product_url?: string | null
          quantity?: number
          quotation_fees?: string | null
          quotation_id: string
          selected_option?: number | null
          service_type: string
          shipping_city?: string | null
          shipping_country?: string | null
          shipping_method: string
          status?: string
          title_option1?: string | null
          title_option2?: string | null
          title_option3?: string | null
          total_price_option1?: string | null
          total_price_option2?: string | null
          total_price_option3?: string | null
          updated_at?: string
          user_id?: string | null
          variant_groups?: Json | null
          variant_specs?: string | null
        }
        Update: {
          alibaba_url?: string | null
          company_id?: string | null
          created_at?: string
          delivery_time_option1?: string | null
          delivery_time_option2?: string | null
          delivery_time_option3?: string | null
          description_option1?: string | null
          description_option2?: string | null
          description_option3?: string | null
          destination_city?: string
          destination_country?: string
          hasimage?: boolean | null
          id?: string
          image_option1?: string | null
          image_option2?: string | null
          image_option3?: string | null
          image_url?: string | null
          image_urls?: string[] | null
          notes?: string | null
          price_description_option1?: string | null
          price_description_option2?: string | null
          price_description_option3?: string | null
          price_per_unit_option1?: string | null
          price_per_unit_option2?: string | null
          price_per_unit_option3?: string | null
          product_images?: string[] | null
          product_name?: string
          product_url?: string | null
          quantity?: number
          quotation_fees?: string | null
          quotation_id?: string
          selected_option?: number | null
          service_type?: string
          shipping_city?: string | null
          shipping_country?: string | null
          shipping_method?: string
          status?: string
          title_option1?: string | null
          title_option2?: string | null
          title_option3?: string | null
          total_price_option1?: string | null
          total_price_option2?: string | null
          total_price_option3?: string | null
          updated_at?: string
          user_id?: string | null
          variant_groups?: Json | null
          variant_specs?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quotations_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      shipping: {
        Row: {
          company_id: string | null
          created_at: string
          delivered_at: string | null
          estimated_delivery: string | null
          id: string
          images_urls: string[] | null
          location: string | null
          metadata: Json | null
          payment_id: string | null
          quotation_id: string | null
          receiver_address: string | null
          receiver_name: string | null
          receiver_phone: string | null
          status: string
          tracking_number: string | null
          updated_at: string
          user_id: string | null
          videos_urls: string[] | null
        }
        Insert: {
          company_id?: string | null
          created_at?: string
          delivered_at?: string | null
          estimated_delivery?: string | null
          id?: string
          images_urls?: string[] | null
          location?: string | null
          metadata?: Json | null
          payment_id?: string | null
          quotation_id?: string | null
          receiver_address?: string | null
          receiver_name?: string | null
          receiver_phone?: string | null
          status?: string
          tracking_number?: string | null
          updated_at?: string
          user_id?: string | null
          videos_urls?: string[] | null
        }
        Update: {
          company_id?: string | null
          created_at?: string
          delivered_at?: string | null
          estimated_delivery?: string | null
          id?: string
          images_urls?: string[] | null
          location?: string | null
          metadata?: Json | null
          payment_id?: string | null
          quotation_id?: string | null
          receiver_address?: string | null
          receiver_name?: string | null
          receiver_phone?: string | null
          status?: string
          tracking_number?: string | null
          updated_at?: string
          user_id?: string | null
          videos_urls?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "shipping_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shipping_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shipping_quotation_id_fkey"
            columns: ["quotation_id"]
            isOneToOne: false
            referencedRelation: "quotations"
            referencedColumns: ["id"]
          },
        ]
      }
      store_users: {
        Row: {
          avatar_url: string | null
          company_id: string
          created_at: string | null
          email: string
          email_verified: boolean | null
          first_name: string | null
          id: string
          is_active: boolean | null
          last_login_at: string | null
          last_name: string | null
          password_hash: string
          phone: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          company_id: string
          created_at?: string | null
          email: string
          email_verified?: boolean | null
          first_name?: string | null
          id?: string
          is_active?: boolean | null
          last_login_at?: string | null
          last_name?: string | null
          password_hash: string
          phone?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          company_id?: string
          created_at?: string | null
          email?: string
          email_verified?: boolean | null
          first_name?: string | null
          id?: string
          is_active?: boolean | null
          last_login_at?: string | null
          last_name?: string | null
          password_hash?: string
          phone?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "store_users_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription_periods: {
        Row: {
          code: string
          created_at: string
          duration_days: number
          id: string
          is_active: boolean
          is_trial: boolean
          name: string
          sort_order: number
        }
        Insert: {
          code: string
          created_at?: string
          duration_days: number
          id?: string
          is_active?: boolean
          is_trial?: boolean
          name: string
          sort_order?: number
        }
        Update: {
          code?: string
          created_at?: string
          duration_days?: number
          id?: string
          is_active?: boolean
          is_trial?: boolean
          name?: string
          sort_order?: number
        }
        Relationships: []
      }
      website_settings: {
        Row: {
          accent_color: string | null
          brand_yellow_color: string | null
          company_id: string
          contact_email: string | null
          contact_location: string | null
          contact_phone: string | null
          contact_wechat: string | null
          created_at: string | null
          custom_domain: string | null
          custom_domain_verification_token: string | null
          custom_domain_verified: boolean | null
          custom_website_url: string | null
          font: string | null
          font_body: string | null
          font_heading: string | null
          homepage_layout_draft: Json | null
          homepage_layout_published: Json | null
          id: string
          invoice_template: string
          is_published: boolean | null
          logo_url: string | null
          primary_color: string | null
          published_builder_data: Json | null
          secondary_color: string | null
          template_config: Json | null
          template_type: string | null
          theme_name: string | null
          updated_at: string | null
        }
        Insert: {
          accent_color?: string | null
          brand_yellow_color?: string | null
          company_id: string
          contact_email?: string | null
          contact_location?: string | null
          contact_phone?: string | null
          contact_wechat?: string | null
          created_at?: string | null
          custom_domain?: string | null
          custom_domain_verification_token?: string | null
          custom_domain_verified?: boolean | null
          custom_website_url?: string | null
          font?: string | null
          font_body?: string | null
          font_heading?: string | null
          homepage_layout_draft?: Json | null
          homepage_layout_published?: Json | null
          id?: string
          invoice_template?: string
          is_published?: boolean | null
          logo_url?: string | null
          primary_color?: string | null
          published_builder_data?: Json | null
          secondary_color?: string | null
          template_config?: Json | null
          template_type?: string | null
          theme_name?: string | null
          updated_at?: string | null
        }
        Update: {
          accent_color?: string | null
          brand_yellow_color?: string | null
          company_id?: string
          contact_email?: string | null
          contact_location?: string | null
          contact_phone?: string | null
          contact_wechat?: string | null
          created_at?: string | null
          custom_domain?: string | null
          custom_domain_verification_token?: string | null
          custom_domain_verified?: boolean | null
          custom_website_url?: string | null
          font?: string | null
          font_body?: string | null
          font_heading?: string | null
          homepage_layout_draft?: Json | null
          homepage_layout_published?: Json | null
          id?: string
          invoice_template?: string
          is_published?: boolean | null
          logo_url?: string | null
          primary_color?: string | null
          published_builder_data?: Json | null
          secondary_color?: string | null
          template_config?: Json | null
          template_type?: string | null
          theme_name?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "website_settings_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: true
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      website_settings_private: {
        Row: {
          builder_data: Json | null
          company_id: string
          created_at: string | null
          dns_status: string | null
          dns_verified_at: string | null
          domain_registered_at: string | null
          id: string
          last_checked_at: string | null
          netlify_dns_records: Json | null
          netlify_domain_id: string | null
          published_builder_data: Json | null
          ssl_last_attempt_at: string | null
          ssl_provisioned_at: string | null
          ssl_status: string | null
          updated_at: string | null
        }
        Insert: {
          builder_data?: Json | null
          company_id: string
          created_at?: string | null
          dns_status?: string | null
          dns_verified_at?: string | null
          domain_registered_at?: string | null
          id?: string
          last_checked_at?: string | null
          netlify_dns_records?: Json | null
          netlify_domain_id?: string | null
          published_builder_data?: Json | null
          ssl_last_attempt_at?: string | null
          ssl_provisioned_at?: string | null
          ssl_status?: string | null
          updated_at?: string | null
        }
        Update: {
          builder_data?: Json | null
          company_id?: string
          created_at?: string | null
          dns_status?: string | null
          dns_verified_at?: string | null
          domain_registered_at?: string | null
          id?: string
          last_checked_at?: string | null
          netlify_dns_records?: Json | null
          netlify_domain_id?: string | null
          published_builder_data?: Json | null
          ssl_last_attempt_at?: string | null
          ssl_provisioned_at?: string | null
          ssl_status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "website_settings_private_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: true
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_low_stock_products: {
        Args: never
        Returns: {
          difference: number
          product_id: string
          product_name: string
          reorder_level: number
          sku: string
          total_quantity: number
        }[]
      }
      get_my_client_company_id: { Args: never; Returns: string }
      get_my_company_id: { Args: never; Returns: string }
      get_user_company_id: { Args: never; Returns: string }
      is_super_admin: { Args: never; Returns: boolean }
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
