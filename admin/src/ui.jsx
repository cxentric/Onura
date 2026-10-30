import React, { createContext, useContext, useState } from 'react';

export const Button = ({ variant = 'primary', size = 'md', className = '', ...props }) => {
  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50',
    danger: 'bg-red-600 text-white hover:bg-red-700',
    ghost: 'text-slate-600 hover:bg-slate-100',
  };
  const sizes = { sm: 'px-2.5 py-1 text-xs', md: 'px-3.5 py-2 text-sm' };
  return (
    <button
      className={`inline-flex items-center justify-center rounded-md font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    />
  );
};

export const Card = ({ title, actions, children, className = '' }) => (
  <section className={`bg-white border border-slate-200 rounded-xl ${className}`}>
    {(title || actions) && (
      <header className="flex items-center justify-between px-5 py-3 border-b border-slate-100">
        <h2 className="font-semibold text-slate-800">{title}</h2>
        <div className="flex items-center gap-2">{actions}</div>
      </header>
    )}
    <div className="p-5">{children}</div>
  </section>
);

export const Badge = ({ tone = 'slate', children }) => {
  const tones = {
    slate: 'bg-slate-100 text-slate-700',
    green: 'bg-green-100 text-green-800',
    amber: 'bg-amber-100 text-amber-800',
    red: 'bg-red-100 text-red-800',
    blue: 'bg-blue-100 text-blue-800',
    purple: 'bg-purple-100 text-purple-800',
  };
  return <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${tones[tone]}`}>{children}</span>;
};

export const ErrorText = ({ error }) => (error ? <p className="text-sm text-red-600">{error}</p> : null);

export const Field = ({ label, hint, children }) => (
  <label className="block text-sm">
    <span className="font-medium text-slate-700">{label}</span>
    <div className="mt-1">{children}</div>
    {hint && <span className="block mt-1 text-xs text-slate-500">{hint}</span>}
  </label>
);

export const inputClass = 'w-full rounded-md border-slate-300 text-sm focus:border-blue-500 focus:ring-blue-500';

// ---- "Why are you doing this?" dialog: every change asks for a reason, which goes in the audit log ----

const ReasonContext = createContext(null);

export const ReasonProvider = ({ children }) => {
  const [request, setRequest] = useState(null);
  const [reason, setReason] = useState('');

  const ask = (options) =>
    new Promise((resolve) => {
      setReason('');
      setRequest({ ...options, resolve });
    });
  const close = (value) => {
    request.resolve(value);
    setRequest(null);
  };

  return (
    <ReasonContext.Provider value={ask}>
      {children}
      {request && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 flex items-center justify-center p-4" role="dialog" aria-modal="true">
          <form
            className="bg-white rounded-xl shadow-xl w-full max-w-md p-5 space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              close(reason.trim());
            }}
          >
            <div>
              <h3 className="font-semibold text-slate-900">{request.title}</h3>
              {request.detail && <p className="mt-1 text-sm text-slate-600">{request.detail}</p>}
            </div>
            <Field label="Reason (saved in the audit log)">
              <textarea autoFocus required rows={2} className={inputClass} value={reason} onChange={(e) => setReason(e.target.value)} />
            </Field>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="secondary" onClick={() => close(null)}>Cancel</Button>
              <Button type="submit" variant={request.danger ? 'danger' : 'primary'}>{request.confirmLabel || 'Confirm'}</Button>
            </div>
          </form>
        </div>
      )}
    </ReasonContext.Provider>
  );
};

/** const askReason = useReason(); const reason = await askReason({ title }); // null if cancelled */
export const useReason = () => useContext(ReasonContext);
