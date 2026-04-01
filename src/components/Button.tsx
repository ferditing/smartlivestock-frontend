/**
 * SmartLivestock — Button
 * One reusable <Button> component that covers every button style in the system.
 *
 * Usage examples:
 *   <Button>Save</Button>
 *   <Button variant="danger" size="sm">Delete</Button>
 *   <Button variant="outline" icon={<Plus />}>Add Animal</Button>
 *   <Button variant="primary" loading>Saving…</Button>
 *   <Button variant="ghost" iconOnly><Bell /></Button>
 *   <Button as="a" href="/login">Go to login</Button>
 *   <QuickActionTile color="green" icon={<PawPrint />}>Add Animal</QuickActionTile>
 */

import { forwardRef, type ButtonHTMLAttributes, type AnchorHTMLAttributes, type ReactNode } from "react";
import { Loader2 } from "lucide-react";

/* ── Types ─────────────────────────────────────────────────────────────── */

type Variant =
  | "primary"
  | "secondary"
  | "danger"
  | "blue"
  | "amber"
  | "outline"
  | "outline-blue"
  | "outline-red"
  | "ghost"
  | "ghost-green"
  | "link"
  | "link-gray";

type Size = "xs" | "sm" | "md" | "lg" | "xl";

interface ButtonBaseProps {
  variant?: Variant;
  size?: Size;
  icon?: ReactNode;          // icon shown left of label
  iconRight?: ReactNode;     // icon shown right of label
  iconOnly?: boolean;        // square icon-only button
  loading?: boolean;         // shows spinner, disables button
  wide?: boolean;            // full-width
  pill?: boolean;            // rounded-full corners
  children?: ReactNode;
  className?: string;
}

/* Support rendering as <button> OR <a> via `as` prop */
type ButtonProps =
  | (ButtonBaseProps & ButtonHTMLAttributes<HTMLButtonElement> & { as?: "button" })
  | (ButtonBaseProps & AnchorHTMLAttributes<HTMLAnchorElement>  & { as: "a" });

/* ── Class maps ─────────────────────────────────────────────────────────── */

const VARIANT_CLASSES: Record<Variant, string> = {
  "primary":     "btn-primary",
  "secondary":   "btn-secondary",
  "danger":      "btn-danger",
  "blue":        "btn-blue",
  "amber":       "btn-amber",
  "outline":     "btn-outline",
  "outline-blue":"btn-outline-blue",
  "outline-red": "btn-outline-red",
  "ghost":       "btn-ghost",
  "ghost-green": "btn-ghost-green",
  "link":        "btn-link",
  "link-gray":   "btn-link-gray",
};

const SIZE_CLASSES: Record<Size, string> = {
  xs: "btn-xs",
  sm: "btn-sm",
  md: "",          // default — no extra class needed
  lg: "btn-lg",
  xl: "btn-xl",
};

/* ── Component ──────────────────────────────────────────────────────────── */

const Button = forwardRef<HTMLButtonElement | HTMLAnchorElement, ButtonProps>(
  (props, ref) => {
    const {
      variant = "primary",
      size = "md",
      icon,
      iconRight,
      iconOnly = false,
      loading = false,
      wide = false,
      pill = false,
      children,
      className = "",
      as: Tag = "button",
      ...rest
    } = props;

    const classes = [
      "btn",
      VARIANT_CLASSES[variant],
      SIZE_CLASSES[size],
      iconOnly ? "btn-icon" : "",
      wide     ? "btn-wide" : "",
      pill     ? "btn-pill" : "",
      className,
    ].filter(Boolean).join(" ");

    const content = (
      <>
        {loading
          ? <Loader2 className="w-4 h-4 animate-spin flex-shrink-0" />
          : icon
          ? <span className="flex-shrink-0">{icon}</span>
          : null}
        {!iconOnly && children && (
          <span>{children}</span>
        )}
        {!loading && iconRight && (
          <span className="flex-shrink-0">{iconRight}</span>
        )}
      </>
    );

    if (Tag === "a") {
      return (
        <a
          ref={ref as React.Ref<HTMLAnchorElement>}
          className={classes}
          {...(rest as AnchorHTMLAttributes<HTMLAnchorElement>)}
        >
          {content}
        </a>
      );
    }

    return (
      <button
        ref={ref as React.Ref<HTMLButtonElement>}
        className={classes}
        disabled={loading || (rest as ButtonHTMLAttributes<HTMLButtonElement>).disabled}
        {...(rest as ButtonHTMLAttributes<HTMLButtonElement>)}
      >
        {content}
      </button>
    );
  }
);

Button.displayName = "Button";
export default Button;

/* ══════════════════════════════════════════════════════════════════════════
   QuickActionTile — the icon grid tiles used on dashboards
   Usage:
     <QuickActionTile color="green" icon={<PawPrint className="w-6 h-6" />} onClick={…}>
       Add Animal
     </QuickActionTile>
══════════════════════════════════════════════════════════════════════════ */

type TileColor =
  | "green" | "blue" | "purple" | "amber"
  | "red"   | "teal" | "rose"   | "indigo"
  | "gradient-green";

interface QuickActionTileProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  color?: TileColor;
  icon: ReactNode;
  size?: "sm" | "md" | "lg";
  children: ReactNode;
}

const TILE_COLOR_CLASSES: Record<TileColor, string> = {
  "green":          "qa-tile-green",
  "blue":           "qa-tile-blue",
  "purple":         "qa-tile-purple",
  "amber":          "qa-tile-amber",
  "red":            "qa-tile-red",
  "teal":           "qa-tile-teal",
  "rose":           "qa-tile-rose",
  "indigo":         "qa-tile-indigo",
  "gradient-green": "qa-tile-gradient-green",
};

const TILE_SIZE_CLASSES: Record<"sm" | "md" | "lg", string> = {
  sm: "qa-tile-sm",
  md: "",
  lg: "qa-tile-lg",
};

export function QuickActionTile({
  color = "green",
  icon,
  size = "md",
  children,
  className = "",
  disabled,
  ...rest
}: QuickActionTileProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      className={[
        "qa-tile",
        TILE_COLOR_CLASSES[color],
        TILE_SIZE_CLASSES[size],
        className,
      ].filter(Boolean).join(" ")}
      {...rest}
    >
      {icon}
      <span className="leading-tight px-0.5">{children}</span>
    </button>
  );
}