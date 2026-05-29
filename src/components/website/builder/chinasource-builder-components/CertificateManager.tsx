'use client';

import { useRef, useState } from 'react';
import { Plus, Trash2, Upload, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { customToast } from '@/utils/toastUtils';
import type { Certificate } from '../chinasource-types';

interface CertificateManagerProps {
  companyId: string;
  certificates: Certificate[];
  onChange: (next: Certificate[]) => void;
  /** Optional close handler when used inside a modal. */
  onClose?: () => void;
}

const BUCKET = 'website_assets'; // bucket assumed; fallback to public storage
const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'];

/** Upload one file to Supabase Storage and return its public URL. */
async function uploadOne(companyId: string, file: File): Promise<string> {
  if (file.size > MAX_BYTES) throw new Error('File too large (max 5 MB)');
  if (!ALLOWED.includes(file.type)) throw new Error('Unsupported file type');

  const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const path = `certificates/${companyId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    upsert: false,
    contentType: file.type,
  });
  if (error) throw error;

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

export default function CertificateManager({ companyId, certificates, onChange, onClose }: CertificateManagerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [labelDraft, setLabelDraft] = useState<Record<number, string>>({});

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      const uploaded: Certificate[] = [];
      for (let i = 0; i < files.length; i++) {
        const url = await uploadOne(companyId, files[i]);
        uploaded.push({ url, label: files[i].name.replace(/\.[a-z]+$/i, '') });
      }
      onChange([...certificates, ...uploaded]);
      customToast({ variant: 'default', title: 'Uploaded', description: `Added ${uploaded.length} certificate(s).` });
    } catch (err) {
      customToast({
        variant: 'destructive',
        title: 'Upload failed',
        description: err instanceof Error ? err.message : 'Unknown error',
      });
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  function removeAt(i: number) {
    onChange(certificates.filter((_, idx) => idx !== i));
  }

  function setLabel(i: number, value: string) {
    onChange(certificates.map((c, idx) => (idx === i ? { ...c, label: value } : c)));
  }

  return (
    <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[85vh] overflow-y-auto">
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 sticky top-0 bg-white z-10">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Certificates</h2>
          <p className="text-xs text-gray-500">Upload ISO, CE, certifications. Images shown on the public website.</p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <div className="p-6 space-y-4">
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={ALLOWED.join(',')}
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
        <button
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="w-full flex flex-col items-center justify-center gap-2 px-4 py-8 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-gray-400 hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          <Upload className="w-6 h-6" />
          <span className="text-sm font-medium">
            {uploading ? 'Uploading…' : 'Click to upload (PNG, JPG, WebP, SVG — max 5 MB each)'}
          </span>
        </button>

        {certificates.length === 0 ? (
          <p className="text-center text-sm text-gray-400 py-8">No certificates yet.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {certificates.map((c, i) => (
              <div key={i} className="relative bg-gray-50 rounded-xl border border-gray-200 p-3 flex flex-col items-center">
                <button
                  onClick={() => removeAt(i)}
                  className="absolute top-2 right-2 p-1.5 bg-white border border-gray-200 rounded-full hover:bg-red-50 hover:border-red-300 transition-colors"
                  aria-label="Remove"
                >
                  <Trash2 className="w-3.5 h-3.5 text-gray-600" />
                </button>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={c.url} alt={c.label || `Certificate ${i + 1}`} className="w-full h-32 object-contain" />
                <input
                  type="text"
                  value={labelDraft[i] ?? c.label ?? ''}
                  onChange={(e) => setLabelDraft({ ...labelDraft, [i]: e.target.value })}
                  onBlur={(e) => setLabel(i, e.target.value)}
                  placeholder="Label (e.g. ISO 9001)"
                  className="mt-2 w-full text-xs text-center px-2 py-1 border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

/** Small button that opens the certificate manager. */
export function CertificateManagerButton({
  companyId,
  certificates,
  onChange,
}: {
  companyId: string;
  certificates: Certificate[];
  onChange: (next: Certificate[]) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 border border-gray-300 rounded-lg"
        type="button"
      >
        <Plus className="w-4 h-4" />
        Certificates {certificates.length > 0 && <span className="text-xs text-gray-400">({certificates.length})</span>}
      </button>
      {open && (
        <div className="fixed inset-0 z-[200] bg-black/50 flex items-center justify-center p-4" onClick={() => setOpen(false)}>
          <div onClick={(e) => e.stopPropagation()}>
            <CertificateManager
              companyId={companyId}
              certificates={certificates}
              onChange={onChange}
              onClose={() => setOpen(false)}
            />
          </div>
        </div>
      )}
    </>
  );
}
