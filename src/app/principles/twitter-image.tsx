import { ImageResponse } from "next/og";
import { PrinciplesShareCard } from "@/lib/principles-share-card";

export const alt =
  "How posts get seen. RoutineX does not give posts a minimum audience.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function TwitterImage() {
  return new ImageResponse(<PrinciplesShareCard />, { ...size });
}
