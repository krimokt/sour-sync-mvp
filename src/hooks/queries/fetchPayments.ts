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

const PAYMENT_COLUMNS = `
  id, user_id, total_amount, method, status, proof_url,
  created_at, quotation_ids, payment_proof, reference_number,
  profile:profiles(id, email, full_name)
`;

type RawPayment = {
  id: string; user_id: string | null; total_amount: number | string; method: string; status: string;
  proof_url: string | null; created_at: string; quotation_ids: string[] | string | null;
  payment_proof: string | null; reference_number: string | null;
  profile?: PaymentProfile | null;
};

const normalizeIds = (raw: string[] | string | null): string[] =>
  Array.isArray(raw) ? raw.filter(Boolean)
    : typeof raw === 'string' ? raw.split(',').map(s => s.trim()).filter(Boolean)
    : [];

export async function fetchPayments({
  companyId,
  limit = 50,
  offset = 0,
}: { companyId: string; limit?: number; offset?: number }): Promise<PaymentRow[]> {
  const { data, error } = await supabase
    .from('payments')
    .select(PAYMENT_COLUMNS)
    .eq('company_id', companyId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw error;
  if (!data || data.length === 0) return [];

  const rows = data as unknown as RawPayment[];

  // Collect all quotation IDs referenced (one round-trip instead of two)
  const quotationIds = new Set<string>();
  const refNumbers = new Set<string>();
  for (const r of rows) {
    normalizeIds(r.quotation_ids).forEach(id => quotationIds.add(id));
    if (r.reference_number) refNumbers.add(r.reference_number);
  }

  const quotationsMap: Record<string, PaymentQuotation> = {};
  if (quotationIds.size > 0 || refNumbers.size > 0) {
    // Single query combining id + quotation_id matches via OR
    const filters: string[] = [];
    if (quotationIds.size > 0) filters.push(`id.in.(${[...quotationIds].join(',')})`);
    if (refNumbers.size > 0) filters.push(`quotation_id.in.(${[...refNumbers].join(',')})`);
    const { data: qData } = await supabase
      .from('quotations')
      .select('id, quotation_id, product_name, total_price_option1, image_url')
      .eq('company_id', companyId)
      .or(filters.join(','));
    (qData ?? []).forEach((q: unknown) => {
      const qt = q as PaymentQuotation;
      if (qt?.id) quotationsMap[qt.id] = qt;
    });
  }

  return rows.map(r => {
    const ids = normalizeIds(r.quotation_ids);
    const quotations: PaymentQuotation[] = [];
    for (const id of ids) if (quotationsMap[id]) quotations.push(quotationsMap[id]);
    if (quotations.length === 0 && r.reference_number) {
      for (const q of Object.values(quotationsMap)) {
        if (q.quotation_id === r.reference_number) quotations.push(q);
      }
    }
    return {
      id: r.id,
      user_id: r.user_id,
      total_amount: String(r.total_amount),
      method: r.method,
      status: r.status,
      proof_url: r.proof_url,
      created_at: r.created_at,
      quotation_ids: ids.length > 0 ? ids : null,
      payment_proof: r.payment_proof,
      reference_number: r.reference_number,
      profile: r.profile ?? undefined,
      quotations: quotations.length > 0 ? quotations : undefined,
    };
  });
}
