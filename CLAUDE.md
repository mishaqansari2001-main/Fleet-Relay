# FleetRelay Development Guidelines

## Project Overview
FleetRelay is a fleet support ticketing platform for trucking/logistics companies. It auto-creates tickets from Telegram Business Account DMs and Group Chats, with operators managing tickets via a web dashboard. Integrates with ZippyELD for real-time driver/vehicle data enrichment.

## Branding
- **Product Name**: FleetRelay
- **Logo Style**: "Fleet" in text color, "Relay" in primary green (#0B8841)
- **No emojis anywhere in the UI**

---

## Tech Stack

| Layer      | Choice                            |
| ---------- | --------------------------------- |
| Framework  | Next.js 15 (App Router)           |
| Styling    | Tailwind CSS 4                    |
| Components | shadcn/ui                         |
| Animation  | Framer Motion (landing page only) |
| 3D         | Spline (landing page only)        |
| Icons      | Phosphor Icons (ONLY)             |
| Fonts      | Geist Sans (body/headings) + Geist Mono (data/code) via next/font |
| Testing    | Playwright                        |

### Important Stack Rules
- **Phosphor Icons only** — do NOT use Lucide, Heroicons, or any other icon library
- **Framer Motion** is restricted to the landing/marketing page. Dashboard uses CSS transitions only
- **Spline** is restricted to the landing/marketing page. Never in the dashboard
- **No emojis** in any UI text, buttons, labels, or notifications

---

## DESIGN SYSTEM: "Graphite"

Near-black charcoal with emerald green (#0B8841) accents. High-contrast, data-focused, zero distraction. Inspired by Linear, Bloomberg, and Vercel.

### Color Tokens

#### Light Mode
```
--background:       #F6F7F8     /* Page background — cool gray */
--surface:          #FFFFFF     /* Cards, modals, panels */
--surface-alt:      #EEF0F2     /* Alternating rows, secondary surfaces */
--border:           #DFE2E6     /* Default borders */
--border-strong:    #C0C6CE     /* Emphasized borders */

--text:             #111318     /* Primary text — near black */
--text-secondary:   #454B55     /* Secondary/muted text */
--text-tertiary:    #7C8490     /* Placeholder, disabled text */

--primary:          #0B8841     /* Primary green — main actions, links */
--primary-hover:    #097435     /* Hover state */
--primary-text:     #FFFFFF     /* Text on primary backgrounds */

--success:          #0B8841     /* Success states (matches primary) */
--warning:          #C07D10     /* Warning states */
--danger:           #CD2B31     /* Error, destructive, urgent */
--info:             #3B7DD8     /* Informational */

--badge-bg:         #EEF0F2     /* Badge/chip backgrounds */
--input-bg:         #FFFFFF     /* Input field backgrounds */
```

#### Dark Mode
```
--background:       #0A0B0D     /* Page background — near black */
--surface:          #111316     /* Cards, modals, panels */
--surface-alt:      #18191E     /* Alternating rows, secondary surfaces */
--border:           #222429     /* Default borders */
--border-strong:    #32353C     /* Emphasized borders */

--text:             #ECEDEE     /* Primary text — near white */
--text-secondary:   #8B8F96     /* Secondary/muted text */
--text-tertiary:    #55585F     /* Placeholder, disabled text */

--primary:          #2EAD5E     /* Primary green — brighter for dark bg */
--primary-hover:    #38C06B     /* Hover state */
--primary-text:     #0A0B0D     /* Text on primary backgrounds */

--success:          #2EAD5E     /* Success states */
--warning:          #F5D90A     /* Warning states */
--danger:           #E5484D     /* Error, destructive, urgent */
--info:             #5B9EF0     /* Informational */

--badge-bg:         #18191E     /* Badge/chip backgrounds */
--input-bg:         #111316     /* Input field backgrounds */
```

### Tailwind Mappings

| Token           | Light Tailwind                     | Dark Tailwind                     |
| --------------- | ---------------------------------- | --------------------------------- |
| Background      | `bg-[#F6F7F8]`                     | `bg-[#0A0B0D]`                    |
| Surface         | `bg-white`                         | `bg-[#111316]`                    |
| Border          | `border-[#DFE2E6]`                 | `border-[#222429]`                |
| Primary         | `text-[#0B8841]` / `bg-[#0B8841]` | `text-[#2EAD5E]` / `bg-[#2EAD5E]`|
| Primary hover   | `hover:bg-[#097435]`               | `hover:bg-[#38C06B]`              |
| Text            | `text-[#111318]`                   | `text-[#ECEDEE]`                  |
| Text muted      | `text-[#454B55]`                   | `text-[#8B8F96]`                  |
| Text tertiary   | `text-[#7C8490]`                   | `text-[#55585F]`                  |
| Warning         | `text-[#C07D10]`                   | `text-[#F5D90A]`                  |
| Danger          | `text-[#CD2B31]`                   | `text-[#E5484D]`                  |

### Typography
- **Headings & Body**: Geist Sans — loaded via `next/font/local` or CDN
- **Data, Code, Monospace**: Geist Mono
- **Weights**: 400 (body), 500 (medium), 600 (semibold), 700 (bold)
- **Letter spacing**: Tight on headings (`-0.03em` to `-0.05em`), normal on body

### Spacing & Layout
- Use Tailwind spacing scale consistently
- Card padding: `p-4` to `p-6`
- Section gaps: `space-y-4` to `space-y-6`
- Dashboard max-width: `max-w-7xl`

### Border Radius
- Cards: `rounded-lg` or `rounded-xl`
- Buttons: `rounded-lg`
- Inputs: `rounded-lg`
- Badges: `rounded-full`
- Avatars: `rounded-full`

### Shadows
- Light mode: `shadow-sm` (subtle, minimal)
- Dark mode: Avoid shadows, rely on borders for depth

---

## CORE PRINCIPLES

### 1. Minimal, Functional, Modern & Professional
- Every element must earn its place on the screen
- No decorative noise — only functional UI
- Enterprise-grade, not startup-candy
- Think Linear, Vercel, Stripe — serious software for serious operations

### 2. Never Break Functionality
- Core features must always work
- Test after every change
- If unsure, ask before changing

### 3. Ask Questions First
For major UI changes, ALWAYS ask clarifying questions before implementing.

### 4. Polish Over Features
Better to have fewer, polished features than many rough ones.

---

## MANDATORY WORKFLOWS

### Frontend/UI Work
**ALWAYS** use the `/frontend-design` skill when:
- Creating new components or pages
- Modifying existing UI
- Styling changes
- Layout adjustments
- Any visual work

This is mandatory, no exceptions.

### Icons
- **ONLY use Phosphor Icons** (`@phosphor-icons/react`)
- Import style: `import { Truck, MagnifyingGlass } from '@phosphor-icons/react'`
- Default weight: `regular` for UI, `bold` for emphasis
- Size: Match context (16px inline, 20px buttons, 24px headers)

---

## COMPONENT STANDARDS

### Cards
```jsx
// GOOD — Clean, minimal
<Card className="bg-white dark:bg-[#111316] border-[#DFE2E6] dark:border-[#222429] shadow-sm dark:shadow-none">
  <CardContent className="p-6">
    {/* Content */}
  </CardContent>
</Card>

// BAD — Over-styled
<Card className="bg-gradient-to-r border-2 shadow-xl ring-4">
```

### Buttons
```jsx
// Primary
<Button className="bg-[#0B8841] hover:bg-[#097435] text-white">
  Save Changes
</Button>

// Secondary
<Button variant="outline" className="border-[#DFE2E6] dark:border-[#222429]">
  Cancel
</Button>

// Destructive — MUST have confirmation dialog
<Button variant="outline" className="text-[#CD2B31] border-[#CD2B31]/20 hover:bg-[#CD2B31]/5">
  Delete
</Button>
```

### Status Badges
```
Resolved:    green (#0B8841 light / #2EAD5E dark)
Open:        amber (#C07D10 light / #F5D90A dark)
Urgent:      red (#CD2B31 light / #E5484D dark)
In Progress: primary green
DM:          neutral/tertiary
```

---

## FORBIDDEN PATTERNS

### DO NOT USE
- Emojis anywhere in UI
- Lucide, Heroicons, or any icon library other than Phosphor
- Gradient backgrounds on cards or surfaces
- Excessive shadows (shadow-xl, shadow-2xl)
- Animated borders or glows
- Decorative elements with no function
- Colored icon containers/backgrounds (looks cheap)
- Multiple competing visual elements
- Framer Motion in dashboard (CSS transitions only)

### Code Quality
- No over-engineering — only make changes that are directly requested
- No unnecessary abstractions for one-time operations
- No backwards-compatibility hacks
- No comments unless logic is non-obvious
- Secure code — no XSS, injection, or OWASP vulnerabilities

---

## CONFIRMATION DIALOGS

**REQUIRED** for all destructive actions (delete, disconnect, reset). Use AlertDialog from shadcn/ui.

---

## FILE STRUCTURE (Planned)

```
fleetrelay/
├── app/                    # Next.js App Router
│   ├── (dashboard)/        # Dashboard layout group
│   │   ├── tickets/
│   │   ├── drivers/
│   │   └── settings/
│   ├── (marketing)/        # Landing page layout group
│   └── api/                # API routes
├── components/
│   ├── ui/                 # shadcn/ui components
│   └── ...                 # Feature components
├── lib/                    # Utilities, config
├── public/                 # Static assets
└── tests/                  # Playwright tests
```

---

## BEFORE EVERY COMMIT

1. Does it look professional and minimal?
2. Is everything properly aligned?
3. Does it match the Graphite design system?
4. Are all async operations handled with loading states?
5. Are errors handled gracefully?
6. Are destructive actions protected with confirmation dialogs?
7. Are only Phosphor Icons used?
8. Are there zero emojis in the UI?
