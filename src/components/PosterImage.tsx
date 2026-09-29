export function PosterImage({ title, className = '' }: { title: { id: string; name: string; posterColors: [string, string] }; className?: string }) {
  const gradient = `linear-gradient(135deg, ${title.posterColors[0]} 0%, ${title.posterColors[1]} 100%)`;
  const initials = title.name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();

  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={{ background: gradient }}
      role="img"
      aria-label={`${title.name} poster`}
    >
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="font-hero text-3xl text-white/20 select-none">{initials}</span>
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
    </div>
  );
}

export function BackdropImage({ title, className = '' }: { title: { id: string; name: string; backdropColors: [string, string, string] }; className?: string }) {
  const gradient = `linear-gradient(135deg, ${title.backdropColors[0]} 0%, ${title.backdropColors[1]} 50%, ${title.backdropColors[2]} 100%)`;
  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={{ background: gradient }}
      role="img"
      aria-label={`${title.name} backdrop`}
    >
      <div className="absolute inset-0 opacity-30"
        style={{ backgroundImage: 'radial-gradient(circle at 30% 20%, rgba(255,255,255,0.15) 0%, transparent 50%), radial-gradient(circle at 70% 80%, rgba(0,0,0,0.3) 0%, transparent 50%)' }}
      />
    </div>
  );
}

export function Avatar({ colors, name, size = 40 }: { colors: [string, string]; name: string; size?: number }) {
  const initials = name.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase();
  return (
    <div
      className="rounded-full flex items-center justify-center font-semibold text-white shrink-0"
      style={{
        width: size,
        height: size,
        background: `linear-gradient(135deg, ${colors[0]} 0%, ${colors[1]} 100%)`,
        fontSize: size * 0.35,
      }}
    >
      {initials}
    </div>
  );
}
