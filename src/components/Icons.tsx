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

export const ListIcon = ({ size }: P) => (
  <Icon size={size}>
    <path d="M9 6h11M9 12h11M9 18h11" />
    <path d="M4.5 6h.01M4.5 12h.01M4.5 18h.01" strokeWidth={2.6} />
  </Icon>
);

export const GearIcon = ({ size }: P) => (
  <Icon size={size} weight={2.2}>
    <g transform="translate(1.8 1.8) scale(0.85)">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </g>
  </Icon>
);

export const FilterIcon = ({ size }: P) => (
  <Icon size={size} weight={2.2}>
    <path d="M4 7h16M7 12h10M10 17h4" />
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

export const DisclosureIcon = ({ open }: { open: boolean }) => (
  <span className={open ? 'chevron disclosure open' : 'chevron disclosure'}>
    <Icon size={14} weight={2.6}>
      <path d="M5 9l7 7 7-7" />
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
