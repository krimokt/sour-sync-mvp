'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { 
  FileCheck, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Download,
  Loader2,
  ExternalLink
} from 'lucide-react';
import { PaymentProof, Order } from '@/types/store';

interface PaymentProofWithOrder extends PaymentProof {
  order?: Order;
}

export default function PaymentProofsPage() {
  const params = useParams();
  const companySlug = params.companySlug as string;

  const [proofs, setProofs] = useState<PaymentProofWithOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [selectedProof, setSelectedProof] = useState<PaymentProofWithOrder | null>(null);
  const [processing, setProcessing] = useState<string | null>(null);
  const [adminNotes, setAdminNotes] = useState('');

  useEffect(() => {
    fetchProofs();
  }, [companySlug, filter]);

  const fetchProofs = async () => {
    try {
      const response = await fetch(
        `/api/admin/${companySlug}/payment-proofs?status=${filter === 'all' ? '' : filter}`
      );
      if (response.ok) {
        const data = await response.json();
        setProofs(data.proofs || []);
      }
    } catch (error) {
      console.error('Error fetching payment proofs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReview = async (proofId: string, status: 'approved' | 'rejected') => {
    setProcessing(proofId);

    try {
      const response = await fetch(`/api/admin/${companySlug}/payment-proofs/${proofId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, admin_notes: adminNotes }),
      });

      if (response.ok) {
        fetchProofs();
        setSelectedProof(null);
        setAdminNotes('');
      }
    } catch (error) {
      console.error('Error reviewing payment proof:', error);
    } finally {
      setProcessing(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
            <CheckCircle2 className="w-3 h-3" />
            Approved
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
            <XCircle className="w-3 h-3" />
            Rejected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
            <Clock className="w-3 h-3" />
            Pending
          </span>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payment Proofs</h1>
          <p className="text-gray-600 mt-1">
            Review and approve customer payment submissions
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
          {(['pending', 'approved', 'rejected', 'all'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                filter === f
                  ? 'bg-white shadow text-gray-900'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Proofs List */}
      {proofs.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <FileCheck className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Payment Proofs</h3>
          <p className="text-gray-500">
            {filter === 'pending' 
              ? 'No pending payment proofs to review.'
              : `No ${filter} payment proofs found.`}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Submitted
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {proofs.map((proof) => (
                <tr key={proof.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <p className="font-medium text-gray-900">
                      {proof.order?.order_number || 'N/A'}
                    </p>
                    <p className="text-sm text-gray-500">
                      ${proof.order?.total.toFixed(2) || '0.00'}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-gray-900">
                      {proof.order?.shipping_first_name} {proof.order?.shipping_last_name}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    {proof.amount_claimed ? (
                      <p className="font-medium text-gray-900">
                        ${proof.amount_claimed.toFixed(2)}
                      </p>
                    ) : (
                      <p className="text-gray-500">Not specified</p>
                    )}
                    {proof.transaction_reference && (
                      <p className="text-xs text-gray-500">
                        Ref: {proof.transaction_reference}
                      </p>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(proof.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(proof.status)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <a
                        href={proof.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        title="View Proof"
                      >
                        <ExternalLink className="w-4 h-4 text-gray-600" />
                      </a>
                      {proof.status === 'pending' && (
                        <button
                          onClick={() => setSelectedProof(proof)}
                          className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
                        >
                          Review
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Review Modal */}
      {selectedProof && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h2 className="text-lg font-semibold">Review Payment Proof</h2>
              <button
                onClick={() => {
                  setSelectedProof(null);
                  setAdminNotes('');
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Order Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-2">Order Details</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Order Number</p>
                    <p className="font-medium">{selectedProof.order?.order_number}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Order Total</p>
                    <p className="font-medium">${selectedProof.order?.total.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Claimed Amount</p>
                    <p className="font-medium">
                      {selectedProof.amount_claimed 
                        ? `$${selectedProof.amount_claimed.toFixed(2)}`
                        : 'Not specified'}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Transaction Ref</p>
                    <p className="font-medium">
                      {selectedProof.transaction_reference || 'Not provided'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Payment Proof Image */}
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Payment Proof</h3>
                <div className="border rounded-lg overflow-hidden">
                  {selectedProof.file_url.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                    <img
                      src={selectedProof.file_url}
                      alt="Payment proof"
                      className="w-full max-h-96 object-contain bg-gray-100"
                    />
                  ) : (
                    <div className="p-8 text-center bg-gray-50">
                      <FileCheck className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-600">{selectedProof.file_name || 'Document'}</p>
                      <a
                        href={selectedProof.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 mt-2 text-blue-600 hover:underline"
                      >
                        <Download className="w-4 h-4" />
                        Download File
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Admin Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Admin Notes (optional)
                </label>
                <textarea
                  rows={3}
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Add notes about this review..."
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 px-6 py-4 border-t bg-gray-50">
              <button
                onClick={() => handleReview(selectedProof.id, 'rejected')}
                disabled={processing === selectedProof.id}
                className="flex items-center gap-2 px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 disabled:opacity-50"
              >
                {processing === selectedProof.id ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <XCircle className="w-4 h-4" />
                )}
                Reject
              </button>
              <button
                onClick={() => handleReview(selectedProof.id, 'approved')}
                disabled={processing === selectedProof.id}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {processing === selectedProof.id ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-4 h-4" />
                )}
                Approve Payment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

