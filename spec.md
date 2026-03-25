# PropertyMarket – Admin, Privacy & Chat System

## Current State
- Property listings with title, location, price, description, mediaIds
- Authorization (admin/user/guest roles)
- Blob storage for images/videos
- Like/save listings
- Inquiry system (buyer name + phone → seller)
- Ad banners
- Fixed top header nav

## Requested Changes (Diff)

### Add
- `phone` field on PropertyListing (private — only returned to admin)
- `isApproved` status field on PropertyListing (admin must approve before public)
- `approveListing` backend function (admin only)
- `AdminPropertyListing` type that includes phone (returned only to admin)
- `Message` type: id, senderId, senderName, propertyId (optional), content, timestamp, isRead, adminReply
- `sendMessageToAdmin` — any logged-in user sends message to admin (with optional property reference)
- `getMyMessages` — user views their own messages + admin replies
- `getAllMessages` — admin views all messages
- `replyToMessage` — admin replies to a specific message
- `getAdminPropertyListings` — admin-only: returns all listings WITH phone numbers
- Admin Panel page: lists all properties (with phone), approve/delete, view all messages, reply
- "Contact Owner" button on each listing → opens modal to send message to admin referencing property
- Seller phone number field in post-property form (stored privately)

### Modify
- `getAllListings` → only returns approved listings (filter `isApproved == true`)
- `createListing` → accepts phone field, stores it; sets `isApproved = false` by default
- `PropertyListing` public type → no phone field exposed
- Admin panel in Profile/top-bar 3-dot menu for admin users

### Remove
- Old inquiry system (replace with admin-mediated messaging)

## Implementation Plan
1. Rewrite `main.mo` with new PropertyListing type (public without phone), AdminPropertyListing (with phone), Message type, approval workflow, admin messaging
2. Update frontend:
   - Post Property form: add phone field
   - Property cards/detail: "Contact Owner" button → send message to admin
   - Admin Panel page: approve/delete listings (with phone visible), message inbox + reply
   - Profile 3-dot menu: show "Admin Panel" link for admins
   - Chat/Messages page: user sees their messages + admin replies
