package repository

const (
	// Auth Queries
	QuerySyncUser = `
		INSERT INTO "User" (id, name, email, image, "emailVerified")
		VALUES ($1, $2, $3, $4, $5)
		ON CONFLICT (email) DO UPDATE SET
		id = EXCLUDED.id,
		name = EXCLUDED.name,
		email = EXCLUDED.email,
		image = EXCLUDED.image,
		"emailVerified" = EXCLUDED."emailVerified"
	`

	// Circle Queries
	QueryCreateCircle = `
		INSERT INTO "Circle" (id, name, description, "inviteCode", "isInviteLinkEnabled", "ownerId", "createdAt", "updatedAt")
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
	`
	QueryAddMember = `
		INSERT INTO "CircleMember" (id, "circleId", "userId", role, status, "joinedAt")
		VALUES ($1, $2, $3, $4, $5, $6)
	`
	QueryListCircles = `
		SELECT 
			c.*,
			owner.id as owner_id, owner.name as owner_name, owner.email as owner_email, owner.image as owner_image,
			(SELECT count(*)::int FROM "CircleMember" WHERE "circleId" = c.id AND status = 'ACTIVE') as member_count
		FROM "Circle" c
		JOIN "CircleMember" cm_filter ON c.id = cm_filter."circleId"
		JOIN "User" owner ON c."ownerId" = owner.id
		WHERE cm_filter."userId" = $1 AND cm_filter.status = 'ACTIVE'
	`
	QueryGetCircleByID         = `SELECT * FROM "Circle" WHERE id = $1`
	QueryGetCircleOwner        = `SELECT "ownerId" FROM "Circle" WHERE id = $1`
	QueryGetCircleOwnerDetails = `SELECT * FROM "User" WHERE id = $1`
	QueryUpdateInviteCode      = `UPDATE "Circle" SET "inviteCode" = $1 WHERE id = $2`
	QueryGetCircleByInviteCode = `
		SELECT 
			c.*,
			owner.id as owner_id, owner.name as owner_name, owner.email as owner_email, owner.image as owner_image,
			(SELECT count(*)::int FROM "CircleMember" WHERE "circleId" = c.id AND status = 'ACTIVE') as member_count
		FROM "Circle" c
		JOIN "User" owner ON c."ownerId" = owner.id
		WHERE c."inviteCode" = $1
	`
	QueryIsMember         = `SELECT count(*) FROM "CircleMember" WHERE "circleId" = $1 AND "userId" = $2 AND status = 'ACTIVE'`
	QueryDeleteCircle     = `DELETE FROM "Circle" WHERE id = $1`
	QueryGetCircleMembers = `
		SELECT cm.*, u.id "user.id", u.name "user.name", u.email "user.email", u.image "user.image"
		FROM "CircleMember" cm
		JOIN "User" u ON cm."userId" = u.id
		WHERE cm."circleId" = $1 AND cm.status = 'ACTIVE'
	`
	QueryGetCircleEvents = `
		SELECT i.*, 
		(SELECT count(*)::int FROM "RSVP" WHERE "inviteId" = i.id) as rsvp_count
		FROM "Invite" i
		WHERE i."circleId" = $1
		ORDER BY i."eventDate" DESC
	`
	QueryGetPendingMembers = `
		SELECT cm.*, u.id "user.id", u.name "user.name", u.email "user.email", u.image "user.image"
		FROM "CircleMember" cm
		JOIN "User" u ON cm."userId" = u.id
		WHERE cm."circleId" = $1 AND cm.status = 'PENDING'
	`
	QueryUpdateMemberStatus = `UPDATE "CircleMember" SET status = $1 WHERE "circleId" = $2 AND "userId" = $3`
	QueryRemoveMember       = `DELETE FROM "CircleMember" WHERE "circleId" = $1 AND "userId" = $2`
	QueryGetMemberStatus    = `SELECT status FROM "CircleMember" WHERE "circleId" = $1 AND "userId" = $2`

	// Circle settings
	QueryUpdateCircleSettings = `UPDATE "Circle" SET "isInviteLinkEnabled" = $1, "updatedAt" = NOW() WHERE id = $2`

	// Invite link queries
	QueryCreateInviteLink = `
		INSERT INTO "CircleInviteLink" (id, "circleId", code, "maxUses", "usedCount", "expiresAt", "createdAt", "creatorId")
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
	`
	QueryGetInviteLinkByCode = `SELECT * FROM "CircleInviteLink" WHERE code = $1`
	QueryGetInviteLinks      = `SELECT * FROM "CircleInviteLink" WHERE "circleId" = $1 AND "usedCount" < "maxUses" ORDER BY "createdAt" DESC`
	QueryDeleteInviteLink    = `DELETE FROM "CircleInviteLink" WHERE id = $1`
	QueryIncrementInviteLinkUsage = `UPDATE "CircleInviteLink" SET "usedCount" = "usedCount" + 1 WHERE id = $1`

	// Invite Queries
	QueryCreateInvite = `
		INSERT INTO "Invite" (id, title, description, location, "eventDate", "senderId", "circleId", "createdAt", "updatedAt")
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
	`
	QueryListInvites = `
		SELECT DISTINCT
			i.id, i.title, i.description, i.location, i."eventDate", i."senderId", i."circleId", i."createdAt", i."updatedAt",
			sender.id as sender_id, sender.name as sender_name, sender.email as sender_email, sender.image as sender_image,
			circle.id as circle_id, circle.name as circle_name,
			(SELECT count(*)::int FROM "RSVP" WHERE "inviteId" = i.id) as rsvp_count
		FROM "Invite" i
		JOIN "User" sender ON i."senderId" = sender.id
		LEFT JOIN "Circle" circle ON i."circleId" = circle.id
		LEFT JOIN "CircleMember" cm ON i."circleId" = cm."circleId"
		WHERE i."senderId" = $1 OR cm."userId" = $1
		ORDER BY i."eventDate" ASC
	`
	QueryGetInviteByID = `SELECT * FROM "Invite" WHERE id = $1`
	QueryGetSenderID   = `SELECT "senderId" FROM "Invite" WHERE id = $1`
	QueryDeleteInvite  = `DELETE FROM "Invite" WHERE id = $1`
	QueryUpsertRSVP    = `
        INSERT INTO "RSVP" (id, "inviteId", "userId", status, "guestCount", dietary, note, "createdAt", "updatedAt")
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        ON CONFLICT ("inviteId", "userId") DO UPDATE SET
        status = EXCLUDED.status,
        "guestCount" = EXCLUDED."guestCount",
        dietary = EXCLUDED.dietary,
        note = EXCLUDED.note,
        "updatedAt" = NOW()
    `
	QueryGetInviteDetails_Invite        = `SELECT * FROM "Invite" WHERE id = $1`
	QueryGetInviteDetails_Sender        = `SELECT * FROM "User" WHERE id = $1`
	QueryGetInviteDetails_Circle        = `SELECT * FROM "Circle" WHERE id = $1`
	QueryGetInviteDetails_CircleMembers = `
        SELECT cm.*, u.id "user.id", u.name "user.name", u.email "user.email", u.image "user.image"
        FROM "CircleMember" cm
        JOIN "User" u ON cm."userId" = u.id
        WHERE cm."circleId" = $1 AND cm.status = 'ACTIVE'
    `
	QueryGetInviteDetails_RSVPs = `
        SELECT r.*, u.id "user.id", u.name "user.name", u.email "user.email", u.image "user.image"
        FROM "RSVP" r
        JOIN "User" u ON r."userId" = u.id
        WHERE r."inviteId" = $1
    `
	QueryGetInviteDetails_Feed = `
        SELECT f.*, u.id "user.id", u.name "user.name", u.email "user.email", u.image "user.image"
        FROM "EventFeedItem" f
        JOIN "User" u ON f."userId" = u.id
        WHERE f."inviteId" = $1
        ORDER BY f."createdAt" DESC
    `
	QueryGetInviteDetails_Media = `SELECT * FROM "MediaItem" WHERE "inviteId" = $1`

	// Feed Queries
	QueryCreatePost = `
		INSERT INTO "EventFeedItem" (id, "inviteId", "userId", content, type, "createdAt")
		VALUES ($1, $2, $3, $4, $5, $6)
	`
	QueryGetFeed = `
        SELECT * FROM "EventFeedItem" 
        WHERE "inviteId" = $1 
        ORDER BY "createdAt" DESC
    `
)
