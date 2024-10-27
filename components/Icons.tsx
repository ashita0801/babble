import React from 'react';

interface IconProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
}

export const VectorIcon: React.FC<IconProps> =  ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <line x1="4" y1="4" x2="4" y2="20" />
<line x1="8" y1="2" x2="8" y2="22" />
<line x1="12" y1="8" x2="12" y2="16" />
<line x1="16" y1="6" x2="16" y2="18" />
<line x1="20" y1="2" x2="20" y2="22" />
<line x1="24" y1="10" x2="24" y2="14" />
  </svg>
);

export const ThreeCirclesIcon: React.FC<IconProps> =   ({ className }: { className?: string }) => (
  <svg
  className={className}
  width="24"
  height="24"
  viewBox="0 0 24 24"
  fill="none"
  xmlns="http://www.w3.org/2000/svg"
>
  {/* Central point where lines connect */}
  <circle cx="12" cy="12" r="1" fill="currentColor" />

  {/* Hollow circles positioned around the center */}
  <circle cx="12" cy="4" r="3.5" stroke="currentColor" strokeWidth="1" fill="none" />
  <circle cx="4" cy="18" r="3.5" stroke="currentColor" strokeWidth="1" fill="none" />
  <circle cx="20" cy="18" r="3.5" stroke="currentColor" strokeWidth="1" fill="none" />

  {/* Lines connecting each circle to the central point with rounded endpoints */}
  <line x1="12" y1="11" x2="12" y2="7.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
  <line x1="11.5" y1="12" x2="7" y2="16" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
  <line x1="12.5" y1="12" x2="17" y2="15" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
</svg>

);