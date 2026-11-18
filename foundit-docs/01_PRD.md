# PRD - FoundIt

## Problem
Campus lost items are posted in WhatsApp groups or notice boards. Descriptions are vague, posts get buried, and fake claims happen. There is no matching or verification.

## Users
- **Student** - reports lost items, reports found items, claims matches
- **Security Admin** - holds physical items, verifies and approves claims, logs handovers

## Core features (MVP)
1. Register/login with college email domain (configurable `ALLOWED_EMAIL_DOMAIN`)
2. Report **Lost** item: title, description, category, photo (optional), last-seen location + time
3. Report **Found** item: photo (required), category, found location + time, optional secret verification question, "handed to security desk" toggle
4. **Auto-matching**: on every new report, compute embedding and find ranked matches on the opposite type
5. Match page with score, confidence label, score breakdown
6. **Claim flow**: owner answers the finder's verification question -> admin/finder approves or rejects
7. Real-time notifications (new match, claim update)
8. Browse/search with filters: category, date range, location zone, status
9. Admin dashboard: items at desk, pending claims, handover log
10. Auto-expiry of unclaimed items after N days (default 60)

## Phase-2 features
- QR tag per found item for desk handover
- Campus map pin picker (Leaflet)
- In-app chat after claim approval
- Email notifications (Nodemailer)

## Non-goals
- Payments, rewards, public (non-college) access, mobile native app

## Categories
`phone`, `laptop`, `earbuds`, `wallet`, `id-card`, `keys`, `bottle`, `bag`, `book`, `clothing`, `watch`, `glasses`, `other`

## Campus zones (seed list, editable)
Main Gate, Library, Canteen, Admin Block, CS Dept, Mech Dept, Ground, Hostel A, Hostel B, Parking, Auditorium

## Success metrics
- Top-3 match accuracy >= 70% on the evaluation set (see 09)
- Median time from found-report to owner notification < 5 s
