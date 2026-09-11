import Image from "next/image";
import { PlaceholderMedia } from "./PlaceholderMedia";

/**
 * Mostra l'immagine reale se c'è (caricata da /admin), altrimenti il
 * placeholder a colore piatto usato finché non ne carichi una.
 */
export function CoverImage({
  src,
  alt,
  index = 0,
  className,
  sizes = "100vw",
  priority = false,
}: {
  src?: string | null;
  alt: string;
  index?: number;
  className?: string;
  sizes?: string;
  priority?: boolean;
}) {
  if (!src) {
    return <PlaceholderMedia index={index} className={className} />;
  }

  return (
    <div className={`relative ${className ?? ""}`}>
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        className="object-cover"
      />
    </div>
  );
}
