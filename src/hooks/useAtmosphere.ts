"use client";

import { useAtmosphereContext } from "@/components/AtmosphereProvider";

export function useAtmosphere() {
  return useAtmosphereContext();
}

export default useAtmosphere;
