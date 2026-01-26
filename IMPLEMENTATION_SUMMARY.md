# Limit-usage Auto-approve Invite Links - Implementation Summary

## Overview
This feature adds the ability to generate specific invite links that allow a set number of people to join circles immediately without requiring manual approval. Links expire once the usage limit is reached.

## Database Changes

### Circle Table
- Added `isInviteLinkEnabled` (Boolean, default: true) - allows owners to disable the general persistent invite link

### CircleMember Table
- Added `status` field (String, default: "ACTIVE") - tracks member approval status
  - `PENDING`: Awaiting owner approval (from general invite link)
  - `ACTIVE`: Approved member (from limited invite link or owner approval)

### New Table: CircleInviteLink
- `id`: Unique identifier
- `circleId`: Foreign key to Circle
- `code`: Unique invite code
- `maxUses`: Maximum number of uses allowed
- `usedCount`: Current usage count (default: 0)
- `expiresAt`: Optional expiration timestamp
- `createdAt`: Creation timestamp
- `creatorId`: Foreign key to User (who created the link)

## Server Actions

### Limited Invite Links
- `createLimitedInviteLink(circleId, maxUses)`: Creates a new limited invite link
- `getLimitedInviteLinks(circleId)`: Lists all active limited links for a circle (owner only)
- `revokeLimitedInviteLink(linkId)`: Deletes a specific limited link

### Circle Settings
- `updateCircleSettings(circleId, settings)`: Updates circle settings (e.g., isInviteLinkEnabled)

### Member Management
- `approveMember(memberId)`: Changes member status from PENDING to ACTIVE
- `rejectMember(memberId)`: Removes a pending member

### Updated Actions
- `joinCircleByCode(code)`: Enhanced to:
  1. Check CircleInviteLink table first
  2. If found and valid, add member with ACTIVE status and increment usage count
  3. Otherwise, check Circle.inviteCode
  4. Verify isInviteLinkEnabled flag
  5. Add member with PENDING status if using general link

- `getCircleByInviteCode(code)`: Returns circle info with metadata indicating link type

## Frontend Components

### New UI Components
- **Tabs**: Tabbed interface component (based on Radix UI)
- **Switch**: Toggle switch component (based on Radix UI)
- **MemberApprovalButtons**: Approve/reject buttons for pending members

### Enhanced Components

#### InviteMemberDialog
Redesigned with tabbed interface:

**Tab 1: General Link**
- Toggle switch to enable/disable the general invite link
- Shows current general invite link
- Copy button for quick sharing
- Regenerate link option
- Visual indication when link is disabled
- Note: "Members joining via this link will need approval"

**Tab 2: Limited Links**
- Creation form:
  - Number input for max uses (min: 1)
  - "Generate Link" button
  - Helper text: "People joining with this link will be approved automatically"
- Active links list:
  - Shows unique code for each link
  - Usage statistics (e.g., "2/5 joined")
  - Progress bar for visual usage tracking
  - Copy button for quick sharing
  - Revoke button to invalidate the link
  - Empty state message when no links exist

#### Circle Page ([id]/page.tsx)
- Separated members into two sections:
  - **Pending Approval** (shown to owners only):
    - Amber-themed card for visibility
    - Shows pending members with approve/reject buttons
    - Only visible when there are pending members
  - **Active Members**:
    - Shows all active members
    - Displays member role

#### Invite Page ([code]/page.tsx)
- Enhanced to show different messages based on link type:
  - Limited link: "✓ You will be approved automatically" (green)
  - General link: "⏳ Your request will need owner approval" (amber)

## User Flow

### Creating a Limited Invite Link
1. Owner opens "Invite Members" dialog
2. Switches to "Limited Links" tab
3. Enters the number of people allowed (e.g., 5)
4. Clicks "Generate Link"
5. New link appears in the active links list
6. Owner can copy and share the link

### Joining via Limited Link
1. User clicks on limited invite link
2. Sees circle details with "✓ You will be approved automatically" message
3. Clicks "Join Circle"
4. Immediately added to circle with ACTIVE status
5. Link usage count increments
6. User redirected to circle page

### Joining via General Link
1. User clicks on general invite link
2. Sees circle details with "⏳ Your request will need owner approval" message
3. Clicks "Join Circle"
4. Added to circle with PENDING status
5. User redirected to circle page (may see limited access until approved)

### Approving Members (Owner)
1. Owner views circle page
2. Sees "Pending Approval" card with pending members
3. Clicks approve (✓) or reject (✗) button
4. Member status updates accordingly

### Disabling General Invite Link
1. Owner opens "Invite Members" dialog
2. On "General Link" tab, toggles off "Enable Invite Link"
3. General invite link becomes disabled
4. New join attempts via that link will fail with error
5. Limited invite links continue to work

## Security Considerations
- All actions verify user authentication
- Owner-only actions verify ownership before execution
- Limited link usage is enforced with atomic increment operations
- Transaction used for join + increment to prevent race conditions
- Disabled general links are checked before accepting new members

## Migration
A database migration file has been created at:
`prisma/migrations/20260126123447_add_limited_invite_links/migration.sql`

This migration:
1. Adds `isInviteLinkEnabled` column to Circle table
2. Adds `status` column to CircleMember table
3. Creates CircleInviteLink table
4. Sets up proper foreign key constraints
5. Creates unique index on `code` field

## Testing Recommendations
1. Create a limited invite link with max uses = 2
2. Join with 2 different users (both should be auto-approved)
3. Attempt to join with a 3rd user (should fail)
4. Disable general invite link
5. Attempt to join via general link (should fail)
6. Re-enable general invite link
7. Join via general link (should require approval)
8. Approve/reject pending members
9. Revoke a limited invite link (should fail subsequent joins)

## Future Enhancements
- Add expiration time support for limited links
- Add analytics dashboard for link usage
- Allow members to see their pending status
- Email notifications for pending approvals
- Bulk approve/reject for multiple pending members
