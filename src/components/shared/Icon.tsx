"use client";

import { forwardRef, type SVGProps } from "react";
import {
  User,
  UserCircle,
  UserPlus,
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  BatteryFull,
  Bell,
  Calendar,
  Camera,
  CameraOff,
  Smartphone,
  SmartphoneNfc,
  Settings,
  Check,
  CheckCircle,
  Square,
  CheckSquare,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Clock,
  X,
  ArrowLeftRight,
  DollarSign,
  MousePointerClick,
  Trash2,
  Building2,
  MailCheck,
  Mail,
  FilterX,
  Filter,
  Flag,
  History,
  Home,
  Info,
  Zap,
  Loader2,
  LogIn,
  Search,
  SearchX,
  MapPin,
  MemoryStick,
  MessageSquare,
  ExternalLink,
  Pencil,
  RefreshCw,
  Send,
  ShieldAlert,
  ShieldCheck,
  Shield,
  Gauge,
  Star,
  StarOff,
  TagsIcon,
  Tag,
  ThumbsDown,
  ThumbsUp,
  TrendingUp,
  Globe,
  Monitor,
  Wifi,
  Bluetooth,
  Signal,
  Nfc,
  Cpu,
  Fingerprint,
  ScanFace,
  Droplets,
  Ruler,
  Scale,
  Palette,
  BatteryCharging,
  Network,
  Lock,
  type LucideIcon,
} from "lucide-react";

// Map MDI icon names to Lucide components
const iconMap: Record<string, LucideIcon> = {
  // User & Account
  "mdi:account": User,
  "mdi:account-circle": UserCircle,
  "mdi:account-plus": UserPlus,

  // Alerts & Status
  "mdi:alert-circle": AlertCircle,
  "mdi:alert-circle-outline": AlertCircle,
  "mdi:alert-outline": AlertTriangle,
  "mdi:check": Check,
  "mdi:check-circle": CheckCircle,
  "mdi:checkbox-blank-outline": Square,
  "mdi:checkbox-marked": CheckSquare,
  "mdi:information-outline": Info,

  // Navigation
  "mdi:arrow-left": ArrowLeft,
  "mdi:arrow-right": ArrowRight,
  "mdi:chevron-left": ChevronLeft,
  "mdi:chevron-right": ChevronRight,
  "mdi:home": Home,
  "mdi:close": X,
  "mdi:open-in-new": ExternalLink,

  // Phone & Device
  "mdi:cellphone": Smartphone,
  "mdi:cellphone-cog": SmartphoneNfc,
  "mdi:cellphone-off": Smartphone,
  "mdi:cellphone-screenshot": Smartphone,

  // Camera
  "mdi:camera": Camera,
  "mdi:camera-off": CameraOff,
  "mdi:camera-enhance": Camera,
  "mdi:camera-front": Camera,

  // Battery & Power
  "mdi:battery-high": BatteryFull,
  "mdi:battery-charging": BatteryCharging,
  "mdi:lightning-bolt": Zap,
  "mdi:flash": Zap,

  // Search & Filter
  "mdi:magnify": Search,
  "mdi:magnify-close": SearchX,
  "mdi:filter-variant": Filter,
  "mdi:filter-off": FilterX,

  // Communication
  "mdi:email-check": MailCheck,
  "mdi:email-fast": Mail,
  "mdi:message-text-outline": MessageSquare,
  "mdi:send": Send,
  "mdi:bell-outline": Bell,

  // Actions
  "mdi:pencil": Pencil,
  "mdi:delete": Trash2,
  "mdi:refresh": RefreshCw,
  "mdi:login": LogIn,
  "mdi:compare": ArrowLeftRight,
  "mdi:cursor-default-click": MousePointerClick,
  "mdi:loading": Loader2,

  // Data & Content
  "mdi:calendar": Calendar,
  "mdi:clock-outline": Clock,
  "mdi:history": History,
  "mdi:clipboard-text-clock": ClipboardList,
  "mdi:flag": Flag,
  "mdi:domain": Building2,
  "mdi:web": Globe,
  "mdi:map-marker": MapPin,

  // Rating & Feedback
  "mdi:star": Star,
  "mdi:star-off": StarOff,
  "mdi:thumb-up": ThumbsUp,
  "mdi:thumb-down": ThumbsDown,
  "mdi:trending-up": TrendingUp,

  // Tags & Labels
  "mdi:tag-outline": Tag,
  "mdi:tag-off": TagsIcon,

  // Security & Shield
  "mdi:shield-check": ShieldCheck,
  "mdi:shield-alert": ShieldAlert,
  "mdi:shield-crown-outline": Shield,
  "mdi:shield-lock": Lock,

  // Currency
  "mdi:currency-usd": DollarSign,

  // Settings
  "mdi:cog": Settings,

  // Hardware specs (SpecIcon specific)
  "mdi:micro-sd": MemoryStick,
  "mdi:memory": Cpu,
  "mdi:monitor": Monitor,
  "mdi:monitor-shimmer": Monitor,
  "mdi:quality-high": Monitor,
  "mdi:wifi": Wifi,
  "mdi:bluetooth": Bluetooth,
  "mdi:signal-5g": Signal,
  "mdi:nfc": Nfc,
  "mdi:chip": Cpu,
  "mdi:fingerprint": Fingerprint,
  "mdi:face-recognition": ScanFace,
  "mdi:water-check": Droplets,
  "mdi:ruler-square": Ruler,
  "mdi:scale-balance": Scale,
  "mdi:palette": Palette,
  "mdi:access-point": Wifi,
  "mdi:access-point-network": Network,
  "mdi:speedometer": Gauge,
  "mdi:format-list-bulleted": ClipboardList,
};

interface IconProps extends Omit<SVGProps<SVGSVGElement>, "ref"> {
  icon: string;
  width?: number | string;
  height?: number | string;
  className?: string;
}

export const Icon = forwardRef<SVGSVGElement, IconProps>(function Icon(
  { icon, width, height, className, ...rest },
  ref
) {
  const LucideComponent = iconMap[icon];

  if (!LucideComponent) {
    // Fallback: render a generic info icon for unmapped icons
    return (
      <Info
        ref={ref}
        width={width}
        height={height}
        className={className}
        {...rest}
      />
    );
  }

  return (
    <LucideComponent
      ref={ref}
      width={width}
      height={height}
      className={className}
      {...rest}
    />
  );
});

export default Icon;
