import type { ComponentProps, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";

type IconButtonProps = Omit<ComponentProps<typeof Button>, "children"> & {
  icon?: IconSvgElement;
  label?: ReactNode;
  loading?: boolean;
  stretch?: boolean;
};

export function IconButton({
  icon,
  label,
  loading = false,
  stretch = false,
  className,
  disabled,
  size,
  type = "button",
  variant = "surface",
  ...props
}: IconButtonProps) {
  const hasLabel = label !== undefined && label !== null && label !== "";
  const iconSlot = hasLabel ? "inline-start" : undefined;

  return (
    <Button
      aria-busy={loading || undefined}
      className={cn(stretch && "flex-1", className)}
      disabled={disabled || loading}
      size={size || (hasLabel ? "default" : "icon")}
      type={type}
      variant={variant}
      {...props}
    >
      {loading ? (
        <Spinner data-icon={iconSlot} />
      ) : (
        icon && (
          <HugeiconsIcon
            aria-hidden="true"
            data-icon={iconSlot}
            icon={icon}
            strokeWidth={1.8}
          />
        )
      )}

      {hasLabel && <span>{label}</span>}
    </Button>
  );
}

export type { IconButtonProps };
