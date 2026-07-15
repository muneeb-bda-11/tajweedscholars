import React from "react";
import {
  Baby,
  GraduationCap,
  BookOpen,
  Bookmark,
  Languages,
  HeartHandshake,
  Compass,
  BadgeCheck,
  LineChart,
  Menu,
  X,
  Clock,
  Check,
  ChevronDown,
  ChevronUp,
  Phone,
  Mail,
  MapPin,
  Calendar,
  DollarSign,
  Globe,
  ArrowRight,
  Lock,
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  MessageSquare,
  AudioLines,
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
  RefreshCw,
  ClipboardList,
  UserCheck,
  Route,
  Instagram,
  Facebook,
  Youtube,
  Music2,
  Linkedin
} from "lucide-react";

const iconMap = {
  Baby,
  GraduationCap,
  BookOpen,
  Bookmark,
  Languages,
  HeartHandshake,
  Compass,
  BadgeCheck,
  LineChart,
  Menu,
  X,
  Clock,
  Check,
  ChevronDown,
  ChevronUp,
  Phone,
  Mail,
  MapPin,
  Calendar,
  DollarSign,
  Globe,
  ArrowRight,
  Lock,
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  MessageSquare,
  AudioLines,
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
  RefreshCw,
  ClipboardList,
  UserCheck,
  Route,
  Instagram,
  Facebook,
  Youtube,
  Music2,
  Linkedin
};

export type IconName = keyof typeof iconMap;

interface IconProps {
  name: string;
  className?: string;
  size?: number;
}

export const Icon: React.FC<IconProps> = ({ name, className = "", size = 24 }) => {
  const IconComponent = iconMap[name as IconName] || BookOpen; // Fallback to BookOpen if not found
  return <IconComponent className={className} size={size} />;
};
