import Link from "next/link";
import { Icon } from "@iconify/react";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  variant?: "light" | "dark";
}

/**
 * Reusable Breadcrumb component with visual + semantic markup.
 * JSON-LD BreadcrumbList is handled separately via generateBreadcrumbJsonLd().
 * 
 * @param items - Array of breadcrumb items (last item is current page, no href needed)
 * @param variant - "light" for white backgrounds, "dark" for hero sections
 */
export default function Breadcrumb({ items, variant = "light" }: BreadcrumbProps) {
  const baseClasses = variant === "dark"
    ? "text-blue-200/60"
    : "text-gray-500";
  const linkClasses = variant === "dark"
    ? "hover:text-white transition-colors"
    : "hover:text-blue-600 transition-colors";
  const activeClasses = variant === "dark"
    ? "text-white font-medium"
    : "text-gray-900 font-medium";
  const separatorClasses = variant === "dark"
    ? "text-blue-200/40"
    : "text-gray-400";

  return (
    <nav aria-label="Breadcrumb" className={`flex items-center gap-1.5 text-sm ${baseClasses} flex-wrap`}>
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <span key={index} className="flex items-center gap-1.5">
            {index > 0 && (
              <Icon icon="mdi:chevron-right" className={`w-4 h-4 flex-shrink-0 ${separatorClasses}`} />
            )}
            {isLast || !item.href ? (
              <span className={`${isLast ? activeClasses : ""} truncate max-w-[200px]`}>
                {item.label}
              </span>
            ) : (
              <Link href={item.href} className={linkClasses}>
                {item.label}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}
