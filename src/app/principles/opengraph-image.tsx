import { ImageResponse } from "next/og";
import { PrinciplesShareCard } from "@/lib/principles-share-card";

export const alt =
  "How posts get seen. Posts aren't given a guaranteed audience.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(<PrinciplesShareCard />, { ...size });
}
