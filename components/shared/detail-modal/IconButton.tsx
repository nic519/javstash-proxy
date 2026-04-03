import type { ReactNode } from 'react';

export function IconButton({
  onClick,
  disabled,
  color,
  hoverColor,
  title,
  children,
}: {
  onClick: () => void;
  disabled?: boolean;
  color: string;
  hoverColor: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="flex h-10 w-10 items-center justify-center transition-all duration-200 disabled:opacity-40 hover:scale-[1.03] active:scale-[0.97]"
      style={{ color, backgroundColor: 'transparent' }}
      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = hoverColor)}
      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
      title={title}
    >
      {children}
    </button>
  );
}
