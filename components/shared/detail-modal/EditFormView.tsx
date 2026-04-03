import { Loader2 } from 'lucide-react';
import type { EditForm } from '../types';

export function EditFormView({
  form,
  onChange,
  onSave,
  onCancel,
  saving,
}: {
  form: EditForm;
  onChange: (form: EditForm) => void;
  onSave: () => void;
  onCancel: () => void;
  saving: boolean;
}) {
  return (
    <div className="space-y-5 max-w-2xl mx-auto">
      <InputField
        label="中文标题"
        value={form.titleZh}
        onChange={(value) => onChange({ ...form, titleZh: value })}
      />
      <TextAreaField
        label="中文简介"
        value={form.summaryZh}
        onChange={(value) => onChange({ ...form, summaryZh: value })}
        rows={6}
      />
      <InputField
        label="封面 URL"
        value={form.coverUrl}
        onChange={(value) => onChange({ ...form, coverUrl: value })}
      />
      <TextAreaField
        label="raw_response"
        value={form.rawResponse}
        onChange={(value) => onChange({ ...form, rawResponse: value })}
        rows={12}
      />
      <div className="flex justify-end gap-3 pt-4">
        <button
          onClick={onCancel}
          className="px-4 py-2 text-sm rounded-xl transition-all hover:scale-105 active:scale-95"
          style={{
            background: 'var(--bg-tertiary)',
            color: 'var(--text-primary)',
          }}
        >
          取消
        </button>
        <button
          onClick={onSave}
          disabled={saving}
          className="px-5 py-2 text-sm font-medium rounded-xl transition-all hover:scale-105 active:scale-95 disabled:hover:scale-100 flex items-center gap-2"
          style={{
            background: 'var(--accent-gold)',
            color: 'var(--bg-primary)',
            boxShadow: '0 4px 15px -3px rgba(212,175,55,0.4)',
          }}
        >
          {saving && <Loader2 className="w-4 h-4 animate-spin" />}
          保存
        </button>
      </div>
    </div>
  );
}

function InputField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label
        className="block text-xs font-medium tracking-wide uppercase mb-2"
        style={{ color: 'var(--text-muted)' }}
      >
        {label}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-2.5 text-sm rounded-xl border-none outline-none transition-all focus:ring-2"
        style={{
          background: 'var(--bg-tertiary)',
          color: 'var(--text-primary)',
        }}
        onFocus={(e) => (e.target.style.boxShadow = '0 0 0 2px var(--accent-gold)')}
        onBlur={(e) => (e.target.style.boxShadow = 'none')}
      />
    </div>
  );
}

function TextAreaField({
  label,
  value,
  onChange,
  rows,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  rows: number;
}) {
  return (
    <div>
      <label
        className="block text-xs font-medium tracking-wide uppercase mb-2"
        style={{ color: 'var(--text-muted)' }}
      >
        {label}
      </label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        className="w-full px-4 py-2.5 text-sm rounded-xl border-none outline-none resize-none transition-all leading-relaxed"
        style={{
          background: 'var(--bg-tertiary)',
          color: 'var(--text-primary)',
        }}
        onFocus={(e) => (e.target.style.boxShadow = '0 0 0 2px var(--accent-gold)')}
        onBlur={(e) => (e.target.style.boxShadow = 'none')}
      />
    </div>
  );
}
