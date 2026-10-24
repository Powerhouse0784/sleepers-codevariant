import { Rocket, CalendarDays, Lightbulb, User, Settings, TriangleAlert, type LucideIcon } from "lucide-react";
import type { CatId } from "@/features/knowledge/articles";
export const CAT_ICON: Record<CatId, LucideIcon> = { start: Rocket, events: CalendarDays, ideas: Lightbulb, account: User, features: Settings, fix: TriangleAlert };
/** Gradient icon chip used on category tiles and article rows. */
export const chip = (c: string) => ({ background: `linear-gradient(145deg, ${c}, color-mix(in srgb, ${c} 62%, #000))`, boxShadow: `inset 0 1px 0 rgba(255,255,255,.4), 0 8px 18px -8px ${c}` });
