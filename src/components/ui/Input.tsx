import { useState, InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export default function Input({
  label,
  type = 'text',
  error,
  id,
  className = '',
  onFocus,
  onBlur,
  ...props
}: InputProps) {
  const [focused, setFocused] = useState(false);

  return (
    <div className={`relative ${className}`}>
      {label && (
        <label
          htmlFor={id}
          className={`block text-sm font-medium mb-1.5 transition-colors duration-200 ${
            focused ? 'text-cyan-400' : 'text-slate-400'
          }`}
        >
          {label}
        </label>
      )}
      <input
        id={id}
        type={type}
        className={`w-full px-4 py-2.5 bg-white/5 border rounded-xl text-white placeholder-slate-500 transition-all duration-200 focus:outline-none focus:bg-white/10 ${
          error
            ? 'border-red-500 focus:ring-2 focus:ring-red-500/30'
            : 'border-white/10 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20'
        }`}
        onFocus={(e) => {
          setFocused(true);
          if (onFocus) onFocus(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          if (onBlur) onBlur(e);
        }}
        {...props}
      />
      {error && (
        <p className="mt-1 text-xs text-red-400 animate-fade-in">{error}</p>
      )}
    </div>
  );
}
