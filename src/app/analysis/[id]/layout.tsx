import type { ReactNode } from "react";
import { AtmosphereProvider } from "@/components/AtmosphereProvider";

export default function AnalysisLayout({ children }: { children: ReactNode }) {
  return <AtmosphereProvider atmosphere="showtime">{children}</AtmosphereProvider>;
}
