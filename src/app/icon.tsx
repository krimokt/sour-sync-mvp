import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const size = { width: 32, height: 32 }
export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 24,
          background: 'linear-gradient(135deg, #06b6d4 0%, #0f7aff 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '6px',
        }}
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 100 100"
          fill="none"
        >
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
      </div>
    ),
    size
  )
}
