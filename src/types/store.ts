// ============================================
// E-COMMERCE STORE TYPES
// ============================================

export interface StoreUser {
  id: string;
  company_id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  email_verified: boolean;
  is_active: boolean;
  last_login_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserAddress {
  id: string;
  user_id: string;
  type: 'shipping' | 'billing';
  first_name: string | null;
  last_name: string | null;
  company_name: string | null;
  address_line_1: string;
  address_line_2: string | null;
  city: string;
  state: string | null;
  postal_code: string | null;
  country: string;
  phone: string | null;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProductCategory {
  id: string;
  company_id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  parent_id: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  company_id: string;
  category_id: string | null;
  name: string;
  slug: string;
  description: string | null;
  short_description: string | null;
  price: number | null;
  compare_at_price: number | null;
  cost_price: number | null;
  sku: string | null;
  barcode: string | null;
  stock_quantity: number;
  track_inventory: boolean;
  allow_backorder: boolean;
  weight: number | null;
  weight_unit: string;
  images: ProductImage[];
  thumbnail_url: string | null;
  allow_quote: boolean;
  allow_purchase: boolean;
  min_order_quantity: number;
  is_featured: boolean;
  is_active: boolean;
  meta_title: string | null;
  meta_description: string | null;
  tags: string[];
  created_at: string;
  updated_at: string;
  // Relations
  category?: ProductCategory;
}

export interface ProductImage {
  id: string;
  url: string;
  alt: string;
  position: number;
}

export interface Cart {
  id: string;
  company_id: string;
  user_id: string | null;
  session_id: string | null;
  currency: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
  // Computed
  items?: CartItem[];
  subtotal?: number;
  item_count?: number;
}

export interface CartItem {
  id: string;
  cart_id: string;
  product_id: string;
  quantity: number;
  price_at_add: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
  // Relations
  product?: Product;
}

export interface Order {
  id: string;
  company_id: string;
  user_id: string | null;
  order_number: string;
  status: OrderStatus;
  subtotal: number;
  shipping_cost: number;
  tax_amount: number;
  discount_amount: number;
  total: number;
  currency: string;
  
  // Shipping Address
  shipping_first_name: string | null;
  shipping_last_name: string | null;
  shipping_company: string | null;
  shipping_address_1: string | null;
  shipping_address_2: string | null;
  shipping_city: string | null;
  shipping_state: string | null;
  shipping_postal_code: string | null;
  shipping_country: string | null;
  shipping_phone: string | null;
  
  // Billing Address
  billing_first_name: string | null;
  billing_last_name: string | null;
  billing_company: string | null;
  billing_address_1: string | null;
  billing_address_2: string | null;
  billing_city: string | null;
  billing_state: string | null;
  billing_postal_code: string | null;
  billing_country: string | null;
  billing_phone: string | null;
  
  // Payment
  payment_method: PaymentMethod | null;
  payment_status: PaymentStatus;
  stripe_payment_intent_id: string | null;
  stripe_charge_id: string | null;
  
  // Tracking
  tracking_number: string | null;
  tracking_url: string | null;
  shipping_carrier: string | null;
  shipped_at: string | null;
  delivered_at: string | null;
  
  // Notes
  customer_notes: string | null;
  admin_notes: string | null;
  
  created_at: string;
  updated_at: string;
  
  // Relations
  items?: OrderItem[];
  user?: StoreUser;
  payment_proofs?: PaymentProof[];
}

export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded' | 'partial';
export type PaymentMethod = 'bank_transfer' | 'stripe' | 'paypal' | 'cod';

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name: string;
  product_sku: string | null;
  product_image: string | null;
  quantity: number;
  unit_price: number;
  total_price: number;
  notes: string | null;
  created_at: string;
  // Relations
  product?: Product;
}

export interface BankAccount {
  id: string;
  company_id: string;
  bank_name: string;
  account_name: string;
  account_number: string | null;
  iban: string | null;
  swift_code: string | null;
  routing_number: string | null;
  branch_name: string | null;
  branch_address: string | null;
  currency: string;
  instructions: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface PaymentProof {
  id: string;
  order_id: string;
  user_id: string;
  file_url: string;
  file_name: string | null;
  file_size: number | null;
  amount_claimed: number | null;
  transaction_reference: string | null;
  payment_date: string | null;
  status: 'pending' | 'approved' | 'rejected';
  admin_notes: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface QuoteRequest {
  id: string;
  company_id: string;
  user_id: string | null;
  product_id: string | null;
  name: string;
  email: string;
  phone: string | null;
  company_name: string | null;
  product_name: string | null;
  product_url: string | null;
  quantity: number | null;
  description: string | null;
  attachments: { url: string; name: string }[];
  status: 'new' | 'reviewing' | 'quoted' | 'accepted' | 'declined' | 'expired';
  quoted_price: number | null;
  quote_notes: string | null;
  valid_until: string | null;
  assigned_to: string | null;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserFavorite {
  id: string;
  user_id: string;
  product_id: string;
  created_at: string;
  product?: Product;
}

// ============================================
// API RESPONSE TYPES
// ============================================

export interface StoreAuthResponse {
  success: boolean;
  user?: StoreUser;
  token?: string;
  error?: string;
}

export interface CartResponse {
  success: boolean;
  cart?: Cart;
  error?: string;
}

export interface CheckoutResponse {
  success: boolean;
  order?: Order;
  client_secret?: string; // For Stripe
  error?: string;
}



