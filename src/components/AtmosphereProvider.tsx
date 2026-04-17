"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { atmospheres, type Atmosphere, type AtmosphereTokens } from "@/lib/atmosphere";

type AtmosphereContextValue = {
  atmosphere: Atmosphere;
  tokens: AtmosphereTokens;
  setAtmosphere: (a: Atmosphere) => void;
};

const AtmosphereContext = createContext<AtmosphereContextValue | null>(null);

export function AtmosphereProvider({
  atmosphere: initial = "daytime",
  children,
}: {
  atmosphere?: Atmosphere;
  children: ReactNode;
}) {
  const [atmosphere, setAtmosphere] = useState<Atmosphere>(initial);
  const value = useMemo<AtmosphereContextValue>(
    () => ({ atmosphere, tokens: atmospheres[atmosphere], setAtmosphere }),
    [atmosphere],
  );

  return (
    <AtmosphereContext.Provider value={value}>
      <div data-atmosphere={atmosphere} style={{ minHeight: "100%" }}>
        {children}
      </div>
    </AtmosphereContext.Provider>
  );
}

export function useAtmosphereContext() {
  const ctx = useContext(AtmosphereContext);
  if (!ctx) {
    return {
      atmosphere: "daytime" as Atmosphere,
      tokens: atmospheres.daytime,
      setAtmosphere: () => {},
    } satisfies AtmosphereContextValue;
  }
  return ctx;
}
