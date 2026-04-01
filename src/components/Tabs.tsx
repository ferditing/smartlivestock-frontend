/**
 * SmartLivestock — Tabs
 * Reusable tab component supporting 4 visual styles, role colours,
 * badges, icons, vertical layout, and controlled/uncontrolled mode.
 *
 * ── Quick usage ─────────────────────────────────────────────────
 *
 *  // Uncontrolled (manages its own state)
 *  <Tabs defaultTab="animals" style="underline">
 *    <Tab id="animals" label="My Animals" icon={<PawPrint />} badge={3} />
 *    <Tab id="appointments" label="Appointments" />
 *    <Tab id="reports" label="Reports" disabled />
 *  </Tabs>
 *
 *  // Controlled
 *  const [tab, setTab] = useState("pending");
 *  <Tabs activeTab={tab} onTabChange={setTab} style="pill" color="blue">
 *    <Tab id="pending"  label="Pending"  badge={12} />
 *    <Tab id="approved" label="Approved" badge={4}  />
 *    <Tab id="rejected" label="Rejected" />
 *  </Tabs>
 *
 *  // Render tab panel content
 *  <TabPanel activeTab={tab} tabId="pending">
 *    <p>Pending content here</p>
 *  </TabPanel>
 *
 * ── Full list of props ─────────────────────────────────────────
 *  style:   "underline" | "pill" | "card" | "solid"
 *  color:   "green" | "blue" | "amber" | "purple" | "red" | "teal"
 *  size:    "sm" | "md" | "lg"
 *  vertical: boolean  — stacks tabs in a column
 *  stretch:  boolean  — tabs fill equal width
 * ───────────────────────────────────────────────────────────────
 */

import {
  useState, createContext, useContext, useId,
  type ReactNode, type ReactElement,
} from "react";

/* ── Types ──────────────────────────────────────────────────────── */

type TabStyle = "underline" | "pill" | "card" | "solid";
type TabColor = "green" | "blue" | "amber" | "purple" | "red" | "teal";
type TabSize  = "sm" | "md" | "lg";

interface TabsContextValue {
  activeTab: string;
  setTab: (id: string) => void;
}
const TabsCtx = createContext<TabsContextValue>({ activeTab: "", setTab: () => {} });

/* ── Tabs container ─────────────────────────────────────────────── */

interface TabsProps {
  /** Which tab is active (controlled mode) */
  activeTab?: string;
  /** Default active tab id (uncontrolled mode) */
  defaultTab?: string;
  /** Called when user clicks a tab */
  onTabChange?: (id: string) => void;
  /** Visual style */
  style?: TabStyle;
  /** Accent colour */
  color?: TabColor;
  /** Size */
  size?: TabSize;
  /** Stack tabs vertically */
  vertical?: boolean;
  /** Tabs stretch to fill container width */
  stretch?: boolean;
  /** Extra class on the wrapper */
  className?: string;
  children: ReactNode;
}

export function Tabs({
  activeTab: controlledTab,
  defaultTab = "",
  onTabChange,
  style = "underline",
  color = "green",
  size = "md",
  vertical = false,
  stretch = false,
  className = "",
  children,
}: TabsProps) {
  const [internalTab, setInternalTab] = useState(
    defaultTab || getFirstTabId(children)
  );
  const active = controlledTab ?? internalTab;

  const setTab = (id: string) => {
    if (!controlledTab) setInternalTab(id);
    onTabChange?.(id);
  };

  /* Build class string */
  const wrapClass = [
    "tabs",
    `tabs-${style}`,
    color !== "green" ? `tabs-${color}` : "",
    size !== "md"     ? `tabs-${size}`  : "",
    vertical          ? "tabs-vertical"  : "",
    stretch           ? "w-full"         : "",
    className,
  ].filter(Boolean).join(" ");

  return (
    <TabsCtx.Provider value={{ activeTab: active, setTab }}>
      <div className={wrapClass} role="tablist">
        {children}
      </div>
    </TabsCtx.Provider>
  );
}

/* ── Single Tab button ──────────────────────────────────────────── */

interface TabProps {
  /** Unique identifier — must match TabPanel's tabId */
  id: string;
  label: string;
  icon?: ReactNode;
  /** Number or string shown in a pill badge */
  badge?: number | string;
  disabled?: boolean;
  className?: string;
}

export function Tab({ id, label, icon, badge, disabled, className = "" }: TabProps) {
  const { activeTab, setTab } = useContext(TabsCtx);
  const isActive = activeTab === id;

  return (
    <button
      type="button"
      role="tab"
      aria-selected={isActive}
      aria-controls={`tabpanel-${id}`}
      disabled={disabled}
      onClick={() => !disabled && setTab(id)}
      className={["tab", isActive ? "active" : "", className].filter(Boolean).join(" ")}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      <span>{label}</span>
      {badge !== undefined && (
        <span className="tab-badge">{badge}</span>
      )}
    </button>
  );
}

/* ── Tab Panel (content area) ───────────────────────────────────── */

interface TabPanelProps {
  /** Must match Tab's id */
  tabId: string;
  /** Currently active tab id (must be passed when used outside Tabs) */
  activeTab?: string;
  children: ReactNode;
  className?: string;
  /** Keep DOM mounted even when hidden (default true — better for forms) */
  keepMounted?: boolean;
}

export function TabPanel({
  tabId,
  activeTab: externalTab,
  children,
  className = "",
  keepMounted = true,
}: TabPanelProps) {
  /* Support both inside-Tabs context and standalone usage */
  const ctx = useContext(TabsCtx);
  const active = externalTab ?? ctx.activeTab;
  const isActive = active === tabId;

  if (!keepMounted && !isActive) return null;

  return (
    <div
      role="tabpanel"
      id={`tabpanel-${tabId}`}
      hidden={!isActive}
      className={["animate-fadeIn", isActive ? "block" : "hidden", className].filter(Boolean).join(" ")}
    >
      {children}
    </div>
  );
}

/* ── FilterBar + FilterChip ─────────────────────────────────────── */

/**
 * Horizontal chip row for filtering lists (e.g. "All · Pending · Approved")
 *
 *  <FilterBar value={status} onChange={setStatus}>
 *    <FilterChip value="all">All</FilterChip>
 *    <FilterChip value="pending" badge={12} color="amber">Pending</FilterChip>
 *    <FilterChip value="approved" color="green">Approved</FilterChip>
 *    <FilterChip value="rejected" color="red">Rejected</FilterChip>
 *  </FilterBar>
 */

interface FilterBarProps {
  value: string;
  onChange: (v: string) => void;
  className?: string;
  children: ReactNode;
}

export function FilterBar({ value, onChange, className = "", children }: FilterBarProps) {
  return (
    <div className={`filter-bar ${className}`}>
      {/* Clone children injecting isActive + onClick */}
      {Array.isArray(children)
        ? children.map(child =>
            isFilterChipEl(child)
              ? { ...child, props: { ...child.props, _active: value === child.props.value, _onChange: onChange } }
              : child
          )
        : children}
    </div>
  );
}

function isFilterChipEl(el: unknown): el is ReactElement<FilterChipProps> {
  return !!el && typeof el === "object" && (el as ReactElement).type === FilterChip;
}

type FilterChipColor = "green" | "blue" | "amber" | "red" | "purple" | "teal";
interface FilterChipProps {
  value: string;
  color?: FilterChipColor;
  badge?: number | string;
  children: ReactNode;
  className?: string;
  /** injected by FilterBar — do not pass manually */
  _active?: boolean;
  _onChange?: (v: string) => void;
}

const CHIP_ACTIVE_CLASS: Record<FilterChipColor, string> = {
  green:  "active",
  blue:   "active-blue",
  amber:  "active-amber",
  red:    "active-red",
  purple: "active-purple",
  teal:   "active-teal",
};

export function FilterChip({
  value,
  color = "green",
  badge,
  children,
  className = "",
  _active,
  _onChange,
}: FilterChipProps) {
  const activeClass = _active ? CHIP_ACTIVE_CLASS[color] : "";
  return (
    <button
      type="button"
      onClick={() => _onChange?.(value)}
      className={["filter-chip", activeClass, className].filter(Boolean).join(" ")}
    >
      {children}
      {badge !== undefined && (
        <span className={`ml-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold leading-none ${
          _active ? "bg-white/25 text-white" : "bg-gray-100 text-gray-500"
        }`}>
          {badge}
        </span>
      )}
    </button>
  );
}

/* ── Helpers ─────────────────────────────────────────────────────── */

function getFirstTabId(children: ReactNode): string {
  const arr = Array.isArray(children) ? children : [children];
  for (const child of arr) {
    if (child && typeof child === "object" && "props" in (child as object)) {
      const props = (child as ReactElement<TabProps>).props;
      if (props?.id) return props.id;
    }
  }
  return "";
}

/* ── Default export convenience ─────────────────────────────────── */
export default Tabs;