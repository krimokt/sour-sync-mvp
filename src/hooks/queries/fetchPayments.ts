import { supabase } from '@/lib/supabase';

export interface PaymentProfile { id: string; email: string; full_name: string; }
export interface PaymentQuotation { id: string; quotation_id: string; product_name: string; total_price_option1: string; image_url: string | null; }

export interface PaymentRow {
  id: string;
  user_id: string | null;
  total_amount: string;
  method: string;
  status: string;
  proof_url: string | null;
  created_at: string;
  quotation_ids: string[] | null;
  payment_proof: string | null;
  reference_number: string | null;
  profile?: PaymentProfile;
  quotations?: PaymentQuotation[];
}

type RawPayment = {
  id: string; user_id: string | null; total_amount: number | string; method: string; status: string;
  proof_url: string | null; created_at: string; quotation_ids: string[] | string | null;
  payment_proof: string | null; reference_number: string | null;
};

export async function fetchPayments(): Promise<PaymentRow[]> {
  const { data, error } = await supabase
    .from('payments')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  if (!data || data.length === 0) return [];

  const rows = data as unknown as RawPayment[];

  const userIds = [...new Set(rows.map(r => r.user_id).filter(Boolean))] as string[];
  const quotationIds: string[] = [];
  rows.forEach(r => {
    if (Array.isArray(r.quotation_ids)) r.quotation_ids.forEach(id => { if (id) quotationIds.push(id); });
    else if (typeof r.quotation_ids === 'string') quotationIds.push(...r.quotation_ids.split(',').map(s => s.trim()).filter(Boolean));
  });
  const refNumbers = [...new Set(rows.map(r => r.reference_number).filter(Boolean))] as string[];

  const [profilesRes, quotByIdRes, quotByRefRes] = await Promise.all([
    userIds.length > 0 ? supabase.from('profiles').select('id, email, full_name').in('id', userIds) : Promise.resolve({ data: [] as PaymentProfile[], error: null }),
    quotationIds.length > 0 ? supabase.from('quotations').select('id, quotation_id, product_name, total_price_option1, image_url').in('id', [...new Set(quotationIds)]) : Promise.resolve({ data: [] as PaymentQuotation[], error: null }),
    refNumbers.length > 0 ? supabase.from('quotations').select('id, quotation_id, product_name, total_price_option1, image_url').in('quotation_id', refNumbers) : Promise.resolve({ data: [] as PaymentQuotation[], error: null }),
  ]);

  const profilesMap: Record<string, PaymentProfile> = {};
  (profilesRes.data ?? []).forEach((p: PaymentProfile) => { profilesMap[p.id] = p; });

  const quotationsMap: Record<string, PaymentQuotation> = {};
  (quotByIdRes.data ?? []).forEach((q: PaymentQuotation) => { quotationsMap[q.id] = q; });
  (quotByRefRes.data ?? []).forEach((q: PaymentQuotation) => { quotationsMap[q.id] = q; });

  return rows.map(r => {
    const quotations: PaymentQuotation[] = [];
    if (Array.isArray(r.quotation_ids)) r.quotation_ids.forEach(id => { if (quotationsMap[id]) quotations.push(quotationsMap[id]); });
    else if (typeof r.quotation_ids === 'string') r.quotation_ids.split(',').forEach(id => { const q = quotationsMap[id.trim()]; if (q) quotations.push(q); });
    if (quotations.length === 0 && r.reference_number) {
      Object.values(quotationsMap).forEach(q => { if (q.quotation_id === r.reference_number) quotations.push(q); });
    }
    return {
      id: r.id,
      user_id: r.user_id,
      total_amount: String(r.total_amount),
      method: r.method,
      status: r.status,
      proof_url: r.proof_url,
      created_at: r.created_at,
      quotation_ids: Array.isArray(r.quotation_ids) ? r.quotation_ids : (typeof r.quotation_ids === 'string' ? r.quotation_ids.split(',').map(s => s.trim()).filter(Boolean) : null),
      payment_proof: r.payment_proof,
      reference_number: r.reference_number,
      profile: r.user_id ? profilesMap[r.user_id] : undefined,
      quotations: quotations.length > 0 ? quotations : undefined,
    };
  });
}
