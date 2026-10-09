"use client";

import { createContext, useContext, useEffect, useState } from "react";
import clsx from "clsx";

type Tab = { id: string; label: string };

const TabsContext = createContext<{
  active: string;
  setActive: (id: string) => void;
} | null>(null);

/**
 * Schede per la pagina Impostazioni. Le schede non attive restano nella
 * pagina (solo nascoste): così "Salva" invia sempre tutti i campi, come
 * prima, anche quelli delle schede che non stai guardando. La scheda
 * aperta è nell'indirizzo (#homepage...), quindi un link porta dritto lì.
 */
export function SettingsTabs({
  tabs,
  children,
}: {
  tabs: Tab[];
  children: React.ReactNode;
}) {
  const [active, setActiveState] = useState(tabs[0].id);

  useEffect(() => {
    const fromHash = () => {
      const id = window.location.hash.slice(1);
      if (tabs.some((t) => t.id === id)) setActiveState(id);
    };
    fromHash();
    window.addEventListener("hashchange", fromHash);
    return () => window.removeEventListener("hashchange", fromHash);
  }, [tabs]);

  function setActive(id: string) {
    setActiveState(id);
    window.history.replaceState(window.history.state, "", `#${id}`);
  }

  return (
    <TabsContext.Provider value={{ active, setActive }}>
      <div
        role="tablist"
        aria-label="Sezioni delle impostazioni"
        className="flex gap-1 overflow-x-auto border-b border-border-strong"
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            id={`tab-${tab.id}`}
            aria-selected={active === tab.id}
            aria-controls={`pannello-${tab.id}`}
            onClick={() => setActive(tab.id)}
            className={clsx(
              "relative min-h-11 shrink-0 px-4 text-sm font-medium transition-colors",
              active === tab.id
                ? "text-foreground after:absolute after:inset-x-3 after:-bottom-px after:h-0.5 after:bg-accent"
                : "text-foreground-muted hover:text-foreground",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {children}
    </TabsContext.Provider>
  );
}

export function useSettingsTab() {
  return useContext(TabsContext);
}

export function SettingsTabPanel({
  tab,
  children,
}: {
  tab: string;
  children: React.ReactNode;
}) {
  const ctx = useContext(TabsContext);
  const visible = !ctx || ctx.active === tab;
  return (
    <div
      role="tabpanel"
      id={`pannello-${tab}`}
      aria-labelledby={`tab-${tab}`}
      data-settings-tab={tab}
      hidden={!visible}
      className="flex flex-col gap-4"
    >
      {children}
    </div>
  );
}
