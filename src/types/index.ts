import { Prisma } from "@prisma/client";

export type InviteWithRelations = Prisma.InviteGetPayload<{
  include: {
    sender: true;
    circle: true;
    _count: {
      select: { rsvps: true };
    };
  };
}>;

export type CircleWithRelations = Prisma.CircleGetPayload<{
  include: {
    _count: {
      select: { members: true };
    };
    owner: true;
  };
}>;

export type CircleDetails = Prisma.CircleGetPayload<{
  include: {
    members: {
      include: {
        user: true;
      };
    };
    invites: {
      include: {
        _count: {
          select: { rsvps: true };
        };
      };
    };
    owner: true;
  };
}>;

export type InviteDetails = Prisma.InviteGetPayload<{
  include: {
    sender: true;
    circle: {
      include: {
        members: {
          include: { user: true };
        };
      };
    };
    rsvps: {
      include: { user: true };
    };
    feedItems: {
      include: { user: true };
    };
    mediaItems: true;
  };
}>;
