# PropertyMarket

## Current State
- Full-stack property marketplace with Motoko backend and React frontend
- Auth via email/password (authorization component)
- Blob storage for property images/videos
- Property listings: create, delete, view (all & owner's)
- OLX-style inquiries: buyers submit name+phone+message, sellers see in dashboard
- Homepage with About section and team section
- Dashboard with tabs: My Listings, Post Listing, Inquiries
- No search/filter yet
- No edit listing
- No global stats
- No WhatsApp button
- No bottom navigation bar

## Requested Changes (Diff)

### Add
- `updateListing` backend function (owner only)
- `getGlobalStats` backend function returning total users count and total listings count
- Search and filter bar on public listings (by location text search, price range)
- WhatsApp contact button on each property card and detail page (opens wa.me link with seller phone if available, or listing title)
- Global Stats section visible to all: total registered users + total property listings
- Bottom navigation bar on mobile: Home, Search, Post (logged in), Profile/Account
- Dashboard: show only caller's listings with Edit and Delete buttons
- Edit listing modal/form in dashboard

### Modify
- HomePage: add search/filter bar at top of listings section; add global stats banner; add bottom nav
- DashboardPage: show only user's own listings with edit+delete; add edit modal
- PropertyDetailPage: add WhatsApp contact button
- Property cards: add WhatsApp button

### Remove
- Nothing removed

## Implementation Plan
1. Add `updateListing` and `getGlobalStats` to Motoko backend
2. Frontend: update DashboardPage with edit/delete for user's own listings
3. Frontend: add search/filter (location, price range) to public listings view
4. Frontend: add global stats display (total users, total listings)
5. Frontend: add WhatsApp contact button on property cards and detail page
6. Frontend: add bottom navigation bar (Home, Search, Profile)
