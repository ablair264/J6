/* Shared small components used across landing page sections */

export const Arrow = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path d="M1 7h12M7 1l6 6-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export function BentoMedia({ src, alt, gradient, aspect = "16/9" }: {
  src: string; alt: string; gradient: string; aspect?: string;
}) {
  return (
    <div className="bc-media">
      <div className="bc-media-inner" style={{ aspectRatio: aspect, background: gradient }}>
        <img
          src={src}
          alt={alt}
          loading="lazy"
          style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top left", display: "block" }}
        />
      </div>
    </div>
  );
}
