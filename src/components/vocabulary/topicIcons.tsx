import React from 'react'
import {
  Activity, AlarmClock, Amphora, Angry, Apple, Baby, Backpack, Banknote, BatteryCharging, Bed,
  BedDouble, Beef, Beer, Bike, Bird, BookOpen, Bot, Brain, Briefcase, BriefcaseBusiness, Brush,
  Building, Building2, Bus, CakeSlice, Calculator, CalendarClock, CalendarDays, Camera, Car,
  CarTaxiFront, Carrot, ChartColumn, ChefHat, Clapperboard, ClipboardCheck, CloudSun, Code, Coffee,
  Compass, ConciergeBell, CookingPot, CreditCard, Diamond, Drama, Droplets, Dumbbell, Factory,
  FerrisWheel, FileHeart, FileSignature, Fish, Flower, Flower2, Footprints, Frown, Gamepad2, Gavel,
  Gem, Gift, GlassWater, Globe, GraduationCap, Guitar, Hammer, Hand, HandHeart, Handshake, Hash,
  Headset, Heart, HeartCrack, HeartHandshake, HeartPulse, Hospital, Hotel, Hourglass, House, IdCard,
  Lamp, Landmark, Languages, Laptop, Laugh, Leaf, Library, Lightbulb, LockKeyhole, Luggage, Map as MapIcon,
  MapPinned, Megaphone, MessagesSquare, Mic, Microscope, MonitorPlay, Mountain, MountainSnow, Music2,
  Network, Newspaper, Orbit, Package, Palette, PartyPopper, PawPrint, PenLine, Pencil, PersonStanding,
  PiggyBank, Pill, Plane, Plug, Presentation, Recycle, RefreshCcw, Rocket, Sailboat, Salad, Sandwich,
  Satellite, Scale, School, ScrollText, Search, Share2, ShieldCheck, ShieldPlus, Shirt, ShoppingBag,
  ShoppingBasket, ShoppingCart, Signpost, Smartphone, Smile, Sofa, Soup, Sparkles, Sprout, Squirrel,
  Star, Stethoscope, Syringe, Tag, Target, Tent, Thermometer, ThumbsDown, Ticket, Tornado, TrafficCone,
  TrainFront, TreePalm, TreePine, Trees, TrendingUp, Trophy, User, UserRound, Users, UsersRound,
  Utensils, UtensilsCrossed, Volleyball, Wallet, Waves, Weight, Wrench, Zap
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

/**
 * Topics store an emoji (topics.icon). Emoji look different on every system, so the page shows a lucide icon of the
 * same meaning instead; an emoji not listed here falls back to a book.
 */
const BY_EMOJI: Record<string, LucideIcon> = {
  '👋': Hand, '👤': User, '⏰': AlarmClock, '📅': CalendarDays, '☀️': CloudSun, '🔢': Hash,
  '🧍': PersonStanding, '🧑‍🦰': UserRound, '👨‍👩‍👧‍👦': Users, '🌳': Network, '🤝': Handshake, '❤️': Heart,
  '💍': Diamond, '👶': Baby, '⏳': Hourglass, '🌟': Star, '👿': ThumbsDown, '😄✨': Laugh,
  '😢💔': HeartCrack, '😡💥': Angry, '😨': Frown, '😲🔍': Search, '🧠': Brain, '🙏': HeartHandshake,
  '🗣️': MessagesSquare, '🎉': PartyPopper, '🎁': Gift, '🕊️': Bird, '🌐': Globe, '🏘️': Building,
  '❤️🤝': HandHeart, '🌠🎯': Target,
  '🏠': House, '🛋️': Sofa, '🛏️': Bed, '🍳': CookingPot, '🪴': Sprout, '🔨': Hammer, '📦': Package,
  '🏢': Building2, '🔌': Plug, '💡': Lightbulb, '🧼': Droplets, '🎒': Backpack, '🚶': Footprints,
  '⚡': Zap, '🛌': BedDouble,
  '🍽️': UtensilsCrossed, '🥢': Utensils, '🥟': Soup, '🍎': Apple, '🥦': Carrot, '🥩': Beef,
  '🧂': ChefHat, '🔪': ChefHat, '🍔': Sandwich, '🍰': CakeSlice, '🍵': GlassWater, '🍵🫖': Leaf,
  '☕': Coffee, '🍺': Beer, '🥗': Salad, '🛎️': ConciergeBell,
  '🛒': ShoppingCart, '🧺': ShoppingBasket, '🏷️': Tag, '💳': CreditCard, '💴': Banknote,
  '🔄': RefreshCcw, '👗': Shirt, '👟': Footprints, '💄': Sparkles, '✨': Gem, '🎎': ShoppingBag,
  '💳📱': Wallet,
  '🚏': Bus, '🚕': CarTaxiFront, '🚄': TrainFront, '✈️': Plane, '🚲': Bike, '🚗': Car,
  '🚗🚙': TrafficCone, '🚦': Signpost, '🔧': Wrench, '🎫': Ticket, '🧭': Compass, '🗺️': MapIcon,
  '🧳': Luggage, '🛂': IdCard, '🛃': ShieldCheck, '🏨': Hotel, '🏖️': TreePalm, '🏞️': TreePine,
  '📸': Camera, '🧗': Mountain, '🏕️': Tent, '🎡': FerrisWheel, '🏙️🗺️': MapPinned,
  '🏫': School, '📚': Library, '✏️': Pencil, '👩‍🏫': Presentation, '📝': ClipboardCheck,
  '🎓': GraduationCap, '🏛️': Landmark, '📜': ScrollText, '📖': BookOpen, '💻🎓': MonitorPlay,
  '🗣️🌐': Languages,
  '👨‍💼': BriefcaseBusiness, '💼': Briefcase, '✍️': PenLine, '📊': ChartColumn, '👔': UsersRound,
  '💰': PiggyBank, '⏰🏢': CalendarClock, '📈': TrendingUp, '🏆': Trophy, '⚖️': Scale,
  '🎤': Mic, '🎧': Headset, '📣': Megaphone, '🤝📑': FileSignature, '🧮': Calculator, '🚀': Rocket,
  '💪': HeartPulse, '🤒': Thermometer, '🩺': Stethoscope, '👨‍⚕️': Syringe, '💊': Pill, '🏥': Hospital,
  '🦷': Smile, '📑🏥': FileHeart, '😷': ShieldPlus, '🏃': Activity, '🏋️': Dumbbell, '🧘': Flower,
  '⚖️🏃': Weight, '🥗🏃': Salad,
  '⚽🏀': Volleyball, '🏊': Waves, '👟🏃': Footprints, '🎵🎸': Guitar, '💃': Music2, '🎬': Clapperboard,
  '🎮': Gamepad2, '📰': Newspaper, '🎨': Palette, '🖌️': Brush, '🎭': Drama, '🏮': Lamp, '🏺': Amphora,
  '📱': Smartphone, '💻': Laptop, '🌐💬': Share2, '🤖': Bot, '👨‍💻': Code, '🔒🛡️': LockKeyhole,
  '🔬': Microscope, '🌌🪐': Orbit, '🚀🛰️': Satellite,
  '🌸🌻': Flower2, '🌲🌳': Trees, '🐶🐱': PawPrint, '🦁🐼': Squirrel, '🦜🦋': Bird, '🐬🐳': Fish,
  '⛰️🌊': MountainSnow, '🌊⛵': Sailboat, '🌫️🚯': Factory, '♻️': Recycle, '🌋🌪️': Tornado,
  '⚡🔋': BatteryCharging, '⚖️📜': Gavel,
}

/** Soft tones; a topic always gets the same one. */
const TONES = [
  'bg-rose-50 text-rose-600 border-rose-100',
  'bg-amber-50 text-amber-600 border-amber-100',
  'bg-emerald-50 text-emerald-600 border-emerald-100',
  'bg-sky-50 text-sky-600 border-sky-100',
  'bg-violet-50 text-violet-600 border-violet-100',
  'bg-orange-50 text-orange-600 border-orange-100',
  'bg-teal-50 text-teal-600 border-teal-100',
  'bg-indigo-50 text-indigo-600 border-indigo-100',
]

export const topicIcon = (emoji?: string | null): LucideIcon => (emoji && BY_EMOJI[emoji.trim()]) || BookOpen

export const topicTone = (key: string | number) => {
  const text = String(key)
  let hash = 0
  for (let i = 0; i < text.length; i++) hash = (hash * 31 + text.charCodeAt(i)) >>> 0
  return TONES[hash % TONES.length]
}

/** The topic's icon in its coloured square. */
export const TopicIcon: React.FC<{ emoji?: string | null; toneKey: string | number; size?: 'md' | 'lg'; className?: string }> = ({ emoji, toneKey, size = 'md', className = '' }) => {
  const Icon = topicIcon(emoji)
  const box = size === 'lg' ? 'h-16 w-16 sm:h-20 sm:w-20' : 'h-14 w-14 sm:h-16 sm:w-16'
  const glyph = size === 'lg' ? 'h-8 w-8 sm:h-10 sm:w-10' : 'h-7 w-7 sm:h-8 sm:w-8'
  return (
    <span className={`grid shrink-0 place-items-center rounded-2xl border ${box} ${topicTone(toneKey)} ${className}`} aria-hidden="true">
      <Icon className={glyph} strokeWidth={1.75} />
    </span>
  )
}
