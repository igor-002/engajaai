import * as React from "react";

export function BrandMark({ className, size = 24 }: { className?: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <rect x="2" y="2" width="28" height="28" rx="8" fill="hsl(40 100% 47%)" />
      <path
        d="M10 21V11h12v3h-8v1.5h7V18h-7v1.5h8V22H10z"
        fill="hsl(0 0% 0%)"
      />
    </svg>
  );
}
