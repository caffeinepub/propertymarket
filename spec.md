# PropertyMarket

## Current State
Full property marketplace with listings, inquiries, ads, user profiles, and media upload. No save/like feature exists.

## Requested Changes (Diff)

### Add
- `savedListings` map in backend: `Principal -> [Nat]` (list of saved listing IDs per user)
- `saveListing(listingId)` -- adds to user's saved list
- `unsaveListing(listingId)` -- removes from user's saved list
- `getSavedListings()` -- returns user's saved listing IDs
- `isListingSaved(listingId)` -- returns Bool
- Heart/bookmark toggle button on PropertyCard and PropertyDetailPage
- "Saved Properties" tab in Dashboard

### Modify
- PropertyCard: add save/heart icon button (top-right of card)
- DashboardPage: add a "Saved" tab showing saved listings
- PropertyDetailPage: add save button

### Remove
- Nothing

## Implementation Plan
1. Update main.mo with savedListings map and 4 new functions
2. Regenerate backend bindings
3. Add useQueries hooks for save/unsave/getSaved/isSaved
4. Update PropertyCard with heart button
5. Update DashboardPage with Saved tab
6. Update PropertyDetailPage with save button
