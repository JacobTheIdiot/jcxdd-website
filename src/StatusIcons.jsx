
function StatusIcon({ status, className }) {
  const props = {
    className,
    viewBox: '0 0 24 24',
    'aria-label': status,
    role: 'img',
  }

  return (
    <svg {...props}>
      {/* Dark badge behind the status symbol */}
      <circle cx="12" cy="12" r="12" fill="#000000" />

      {status === 'online' && (
        <circle cx="12" cy="12" r="7" fill="#23a55a" />

      )}

      {status === 'idle' && (
        <>
          <circle cx="12" cy="12" r="8" fill="#f0b232" />
          <circle cx="8" cy="7" r="7" fill="#000000" />
        </>
      )}

      {status === 'dnd' && (
        <>
          <circle cx="12" cy="12" r="8" fill="#f23f43" />
          <rect
            x="6"
            y="10"
            width="12"
            height="4"
            rx="2"
            fill="#040404"
          />
        </>
      )}

      {status === 'offline' && (
        <>
          <circle cx="12" cy="12" r="8" fill="#80848e" />
          <circle cx="12" cy="12" r="4.5" fill="#232428" />
        </>
      )}
    </svg>
  )
}

export default StatusIcon
