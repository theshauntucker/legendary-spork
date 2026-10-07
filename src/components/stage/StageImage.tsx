import { fallbackSrc, srcSet, type StageAsset } from "@/lib/stage-assets";

/**
 * A <picture> for the generated stage photography: webp with a jpg fallback,
 * a sizes hint so phones pull the 1000w file, and explicit dimensions so the
 * layout never shifts while the image lands. An optional portrait asset is
 * served below the lg breakpoint via media queries, so phones only download
 * the crop that suits them.
 */
export default function StageImage({
  asset,
  portrait,
  sizes = "100vw",
  priority = false,
  className = "",
  decorative = true,
}: {
  asset: StageAsset;
  portrait?: StageAsset;
  sizes?: string;
  priority?: boolean;
  className?: string;
  decorative?: boolean;
}) {
  const mq = "(max-width: 1023px)";
  return (
    <picture>
      {portrait && <source type="image/webp" media={mq} srcSet={srcSet(portrait, "webp")} sizes={sizes} />}
      {portrait && <source type="image/jpeg" media={mq} srcSet={srcSet(portrait, "jpg")} sizes={sizes} />}
      <source type="image/webp" srcSet={srcSet(asset, "webp")} sizes={sizes} />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={fallbackSrc(asset)}
        srcSet={srcSet(asset, "jpg")}
        sizes={sizes}
        width={asset.w}
        height={asset.h}
        alt={decorative ? "" : asset.alt}
        className={className}
        fetchPriority={priority ? "high" : undefined}
        loading={priority ? "eager" : "lazy"}
        decoding={priority ? "sync" : "async"}
        draggable={false}
      />
    </picture>
  );
}
