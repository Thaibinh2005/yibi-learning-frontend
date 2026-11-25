import React, { useEffect, useState } from 'react'

/**
 * The learner's picture (from Google sign-in), or the first letter of their name when there is none
 * or the picture fails to load. Google's image host refuses some requests that carry a referrer, hence no-referrer.
 */
export const Avatar: React.FC<{ name?: string | null; src?: string | null; className?: string }> = ({ name, src, className = 'h-10 w-10 text-sm' }) => {
  const [broken, setBroken] = useState(false)
  useEffect(() => setBroken(false), [src])
  const initial = name?.trim().charAt(0).toUpperCase() || 'U'

  if (src && !broken) {
    return <img src={src} alt="" referrerPolicy="no-referrer" onError={() => setBroken(true)} className={`shrink-0 rounded-full object-cover ${className}`} />
  }
  return <span aria-hidden="true" className={`grid shrink-0 place-items-center rounded-full bg-brand font-bold text-white ${className}`}>{initial}</span>
}
