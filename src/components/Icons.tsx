import type { ReactNode } from 'react';

function Icon({ size = 22, weight = 2, children }: { size?: number; weight?: number; children: ReactNode }) {
  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={weight}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {children}
    </svg>
  );
}

type P = { size?: number };

export const SearchIcon = ({ size }: P) => (
  <Icon size={size} weight={2.2}>
    <circle cx="11" cy="11" r="7" />
    <path d="M20 20l-3.6-3.6" />
  </Icon>
);

export const HomeIcon = ({ size }: P) => (
  <Icon size={size}>
    <path d="M4 11l8-7 8 7v8a1 1 0 0 1-1 1h-4v-6h-6v6H5a1 1 0 0 1-1-1v-8z" />
  </Icon>
);

export const GridIcon = ({ size }: P) => (
  <Icon size={size}>
    <rect x="4" y="4" width="7" height="7" rx="2" />
    <rect x="13" y="4" width="7" height="7" rx="2" />
    <rect x="4" y="13" width="7" height="7" rx="2" />
    <rect x="13" y="13" width="7" height="7" rx="2" />
  </Icon>
);

export const BookmarkIcon = ({ size, filled }: P & { filled?: boolean }) => (
  <svg
    aria-hidden="true"
    width={size ?? 22}
    height={size ?? 22}
    viewBox="0 0 24 24"
    fill={filled ? 'currentColor' : 'none'}
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M7 4h10a1 1 0 0 1 1 1v15l-6-4-6 4V5a1 1 0 0 1 1-1z" />
  </svg>
);

export const BackIcon = ({ size }: P) => (
  <Icon size={size} weight={2.4}>
    <path d="M15 5l-7 7 7 7" />
  </Icon>
);

export const ChevronIcon = () => (
  <span className="chevron">
    <Icon size={14} weight={2.6}>
      <path d="M9 5l7 7-7 7" />
    </Icon>
  </span>
);

export const SpeakerIcon = ({ size }: P) => (
  <Icon size={size}>
    <path d="M4 9.5v5h3.5L12 18V6L7.5 9.5H4z" />
    <path d="M15.5 9a4 4 0 0 1 0 6" />
    <path d="M18 6.5a7.5 7.5 0 0 1 0 11" />
  </Icon>
);

export const WarningIcon = ({ size }: P) => (
  <Icon size={size} weight={2.2}>
    <path d="M12 4l9 16H3l9-16z" />
    <path d="M12 10v4" />
    <path d="M12 17v.4" />
  </Icon>
);

export const ClearIcon = ({ size }: P) => (
  <Icon size={size} weight={2.4}>
    <path d="M6 6l12 12M18 6L6 18" />
  </Icon>
);
