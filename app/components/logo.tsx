/**
 * Фирменный знак НейроХудожник.
 * Источник: neuroartist-api-gateway-web/public/logo.svg.
 */
export function LogoMark({ size = 24 }: { size?: number }) {
  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size}
      fill="none"
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g clipPath="url(#na-logo-clip)">
        <path d="M100 0H0V100H100V0Z" fill="#E6F0CE" />
        <path
          d="M16.6667 54.9051C16.6667 36.0877 31.5905 20.8333 50 20.8333C68.4093 20.8333 83.3333 36.0877 83.3333 54.9051V100H16.6667V54.9051Z"
          fill="#6FA31B"
        />
      </g>
      <defs>
        <clipPath id="na-logo-clip">
          <rect fill="white" height="100" rx="40" width="100" />
        </clipPath>
      </defs>
    </svg>
  )
}
