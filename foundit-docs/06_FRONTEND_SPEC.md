# Frontend Spec

## Design
Clean, trustworthy, mobile-first (most students report from phones). Tailwind; one accent colour, large tap targets, skeleton loaders, toasts for feedback. Light + dark mode.

## Routes
| Path | Page | Access |
|---|---|---|
| / | Landing: hero, "I lost something" / "I found something" CTAs, recent found items, image-search box | public |
| /login, /register | Auth | public |
| /browse | Grid + filters (type tabs, category chips, zone, date range, search) | auth |
| /report/lost | Lost form | auth |
| /report/found | Found form | auth |
| /items/:id | Item detail + matches (if owner) + claim button | auth |
| /my-items | My reports with status badges and match counts | auth |
| /claims | Tabs: My claims / Incoming claims | auth |
| /notifications | List | auth |
| /admin | Stats, desk items, claim queue, handover form, log | admin |

## Key components
- `ImageUploader` - drag/drop + camera capture, preview, client-side compress (max 1024 px), blur/dark warning
- `ItemCard` - image, title, zone, relative time, status badge
- `MatchCard` - side-by-side photos, score ring, confidence chip, expandable breakdown bars (image/text/location/time)
- `ClaimModal` - shows verification question, answer input, proof note
- `ZoneSelect`, `CategoryChips`, `DateTimePicker`
- `NotificationBell` - unread count, dropdown, socket-driven
- `StatusBadge`, `EmptyState`, `ConfirmDialog`

## Flows
1. **Report found** -> upload photo -> choose category/zone/time -> optional secret question + answer -> "handed to security desk?" -> submit -> success screen "We're checking for matching lost reports"
2. **Report lost** -> same minus verification -> success screen shows instant top matches if any (poll `/items/:id/matches` for ~10 s)
3. **Search by image** (landing) -> upload photo -> top-10 similar found items, no login needed for results preview (limited fields)
4. **Match view** -> ranked cards -> "This is mine" -> claim modal -> pending state -> notification on approve with pickup instructions
5. **Admin** -> pending claim -> view answer correctness, ID check checkbox -> handover -> log

## State/data
TanStack Query for server state (keys per resource); Zustand for auth token and theme; Socket connected after login, invalidates relevant queries on events.

## Accessibility
Labels on all inputs, focus rings, alt text from item title, keyboard-navigable modals.
