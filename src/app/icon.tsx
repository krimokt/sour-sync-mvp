export default function Icon() {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="100" height="100" rx="12" fill="url(#gradient)" />
      <defs>
        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#06b6d4" />
          <stop offset="100%" stopColor="#0f7aff" />
        </linearGradient>
      </defs>
      <path
        d="M 35 40 L 35 35 A 15 15 0 0 1 50 20 A 15 15 0 0 1 65 35 L 65 48 L 58 41 M 65 48 L 72 41"
        stroke="white"
        strokeWidth="7.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M 65 60 L 65 65 A 15 15 0 0 1 50 80 A 15 15 0 0 1 35 65 L 35 52 L 28 59 M 35 52 L 42 59"
        stroke="white"
        strokeWidth="7.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

