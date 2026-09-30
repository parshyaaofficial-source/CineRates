import { useState } from 'react';

export function PosterImage({
  title,
  className = '',
}: {
  title: { id: string; name: string; posterColors: [string, string]; posterUrl?: string };
  className?: string;
}) {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const gradient = `linear-gradient(135deg, ${title.posterColors?.[0] || '#1E293B'} 0%, ${title.posterColors?.[1] || '#0F172A'} 100%)`;
  const initials = (title.name || '')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase() || 'WN';

  const hasImage = Boolean(title.posterUrl && !imageError);

  return (
    <div
      className={`relative overflow-hidden bg-ink-900 ${className}`}
      style={{ background: gradient }}
      role="img"
      aria-label={`${title.name} poster`}
    >
      {/* Image Layer */}
      {title.posterUrl && !imageError && (
        <img
          src={title.posterUrl}
          alt={title.name}
          loading="lazy"
          onLoad={() => setImageLoaded(true)}
          onError={() => setImageError(true)}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
        />
      )}

      {/* Fallback Initials when no image or loading */}
      {(!hasImage || !imageLoaded) && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-hero text-3xl text-white/20 select-none">{initials}</span>
        </div>
      )}

      {/* Gradient Vignette Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
    </div>
  );
}

export function BackdropImage({
  title,
  className = '',
}: {
  title: { id: string; name: string; backdropColors: [string, string, string]; backdropUrl?: string };
  className?: string;
}) {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const gradient = `linear-gradient(135deg, ${title.backdropColors?.[0] || '#0F172A'} 0%, ${title.backdropColors?.[1] || '#1E1B4B'} 50%, ${title.backdropColors?.[2] || '#020617'} 100%)`;

  return (
    <div
      className={`relative overflow-hidden bg-ink-950 ${className}`}
      style={{ background: gradient }}
      role="img"
      aria-label={`${title.name} backdrop`}
    >
      {/* Actual Backdrop Photo */}
      {title.backdropUrl && !imageError && (
        <img
          src={title.backdropUrl}
          alt={title.name}
          loading="eager"
          onLoad={() => setImageLoaded(true)}
          onError={() => setImageError(true)}
          className={`absolute inset-0 w-full h-full object-cover object-top transition-opacity duration-700 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
        />
      )}

      {/* Ambient Radial Mesh (Always subtle behind or in fallback) */}
      <div
        className="absolute inset-0 opacity-30 pointer-events-none"
        style={{
          backgroundImage:
            'radial-gradient(circle at 30% 20%, rgba(255,255,255,0.15) 0%, transparent 50%), radial-gradient(circle at 70% 80%, rgba(0,0,0,0.4) 0%, transparent 50%)',
        }}
      />
    </div>
  );
}

export function Avatar({ colors, name, size = 40 }: { colors: [string, string]; name: string; size?: number }) {
  const initials = (name || '')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase() || 'U';

  return (
    <div
      className="rounded-full flex items-center justify-center font-semibold text-white shrink-0 shadow-sm"
      style={{
        width: size,
        height: size,
        background: `linear-gradient(135deg, ${colors?.[0] || '#7C5CFF'} 0%, ${colors?.[1] || '#22D3EE'} 100%)`,
        fontSize: size * 0.35,
      }}
    >
      {initials}
    </div>
  );
}
