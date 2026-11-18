# Security & Privacy

## Auth
- bcrypt (cost 12), password min 8 chars
- Access JWT 15 min; refresh JWT 7 days in httpOnly + Secure + SameSite=Strict cookie; refresh rotation
- Registration restricted to `ALLOWED_EMAIL_DOMAIN`; optional email verification link (Phase 5)
- Admin accounts created only via seed script / env-listed emails, never self-service

## Authorization
- Owner-only: edit item, view that item's matches, dismiss matches
- Finder or admin: approve/reject claims for their found item
- Admin-only: `/admin/*`
- Enforce in middleware + service layer (never trust the client's role)

## Claim verification (anti-fraud)
- Finder sets optional question + answer at report time. Answer is normalized and stored as a bcrypt/sha256 hash; plaintext never stored.
- Question text is only shown to a user who started a claim on that item.
- Server computes `answerCorrect`; finder/admin sees result, never the stored answer.
- Max 3 claim attempts per user per item; then locked and flagged for admin.
- Admin handover requires `idChecked=true`.

## Privacy
- Public item responses exclude reporter email/phone/department; show first name only.
- No chat or contact exchange until a claim is approved.
- Item images: strip EXIF (sharp does this by default when resizing without `withMetadata`) to remove GPS.
- Images of ID cards / documents: category `id-card` shows blurred thumbnail publicly; full image only to owner/admin.

## Hardening
- Helmet, CORS allowlist, Zod on all inputs, mongo-sanitize, file type sniffing (jpeg/png/webp), 5 MB cap
- Rate limits per doc 04
- Never log tokens, passwords, or answers
- Dependency audit in CI
