# Acceptance Criteria Checklist

## Public Access
- [ ] Guest can browse catalog (search, filter by category/difficulty/tags, sort, paginate)
- [ ] Guest can view asset detail page (previews, description, versions)
- [ ] Guest cannot download (must be logged in)

## Authentication
- [ ] User can register with name, email, password
- [ ] User can log in and receive JWT access + refresh tokens
- [ ] Access token expires after 15 minutes, refresh token after 30 days
- [ ] Refresh token rotation with reuse detection
- [ ] User can log out (clears refresh token)

## Downloads
- [ ] Logged-in user can download via signed URL (120s TTL)
- [ ] Download count is incremented on each download
- [ ] Download events are logged with hashed IP

## Collections
- [ ] User can create collections
- [ ] User can add assets to collections
- [ ] User can remove assets from collections
- [ ] User can view their collections and collection contents

## Admin
- [ ] Admin can create assets (saved as draft)
- [ ] Admin can edit asset metadata
- [ ] Admin can publish/unpublish assets
- [ ] Admin can upload previews (image/video/gif)
- [ ] Admin can upload versions (zip with metadata)
- [ ] Admin dashboard shows stats

## Events & Analytics
- [ ] Page view events are recorded (VIEW_ASSET)
- [ ] Download events are recorded (DOWNLOAD_ATTEMPT, DOWNLOAD_SUCCESS)
- [ ] Custom events can be posted via /v1/events

## Security
- [ ] Helmet security headers on API
- [ ] CORS restricted to APP_ORIGIN
- [ ] Rate limiting on sensitive routes (auth, downloads, events)
- [ ] CSP headers on frontend
- [ ] No sensitive data in client bundle
- [ ] IP addresses stored as SHA-256 hashes, never raw
- [ ] httpOnly cookies for refresh tokens with sameSite strict
