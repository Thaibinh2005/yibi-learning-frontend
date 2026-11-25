import {
  Activity, AlarmClock, Apple, BadgeHelp, BookOpen, Brain, Briefcase, BriefcaseBusiness, Building2, CalendarDays,
  Car, ChartColumn, Cloud, CloudSun, Coffee, Compass, Cpu, Dumbbell, Flower, Frown, Gavel, Globe, Hand, Handshake,
  Hash, HeartPulse, Home, House, Landmark, Languages, Lightbulb, Link2, MapPin, Map as MapIcon, MessageCircle,
  MonitorSmartphone, Mountain, Package, Palette, PartyPopper, PawPrint, PenLine, Pin, Plane, PointerIcon, Rabbit,
  School, ScrollText, ShieldCheck, Shirt, ShoppingBag, Smartphone, Smile, Soup, Sparkles, Squirrel, Star, Sun,
  Trees, TrendingUp, Trophy, User, UserRound, Users, UsersRound, UtensilsCrossed, Wallet, Wrench, Zap, Bone,
  Bird, BookText, Leaf,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

/**
 * Path units store an emoji (path_units.icon). Emoji look different on every system, so the roadmap shows a lucide
 * icon of the same meaning; an emoji not listed here falls back to a book.
 */
const BY_EMOJI: Record<string, LucideIcon> = {
  '🏃': Activity, '👥': Users, '💼': Briefcase, '🏠': House, '🎨': Palette, '🌟': Star, '😊': Smile,
  '📜': ScrollText, '⚖️': Gavel, '🧠': Brain, '💰': Wallet, '🛠️': Wrench, '💻': MonitorSmartphone, '📚': BookOpen,
  '📝': PenLine, '📊': ChartColumn, '💪': Dumbbell, '🍲': Soup, '🚗': Car, '🛍️': ShoppingBag, '🌄': Mountain,
  '📈': TrendingUp, '🌦️': CloudSun, '🏥': HeartPulse, '👨‍👩‍👧‍👦': UsersRound, '👤': User, '🌍': Globe,
  '🛡️': ShieldCheck, '🔬': Cpu, '🔗': Link2, '🔤': Languages, '🏘️': Building2, '📦': Package, '😢': Frown,
  '⚽': Trophy, '⚡': Zap, '✨': Sparkles, '⏰': AlarmClock, '🗺️': MapIcon, '👋': Hand, '📌': Pin,
  '👨‍👩‍👧': Home, '📅': CalendarDays, '🦴': Bone, '🦢': Bird, '👕': Shirt, '📍': MapPin, '🔢': Hash,
  '✈️': Plane, '⭐': Star, '🤝': Handshake, '🧘': Flower, '🧭': Compass, '👨‍💼': BriefcaseBusiness, '🌳': Trees,
  '🏫': School, '🐼': Squirrel, '🍎': Apple, '🧑‍🤝‍🧑': UserRound, '📱': Smartphone, '🍚': UtensilsCrossed,
  '🌐': Landmark, '👉': PointerIcon, '✍️': BookText, '🍵': Coffee, '❓': BadgeHelp, '🗣️': MessageCircle,
  '💡': Lightbulb, '🎉': PartyPopper, '⛅': Cloud, '🌤️': Sun, '🐾': PawPrint, '🐇': Rabbit, '🍃': Leaf,
}

export const unitIcon = (emoji?: string | null): LucideIcon => (emoji && BY_EMOJI[emoji.trim()]) || BookOpen
