import { prisma } from "@/lib/prisma";

export type NotificationType =
  | "PROJECT_SUBMITTED"
  | "PROJECT_STATUS_CHANGED"
  | "PROJECT_NEEDS_INFORMATION"
  | "PROJECT_REJECTED"
  | "PROJECT_ON_HOLD"
  | "PROJECT_CANCELLED"
  | "AGENT_ASSIGNED"
  | "PROPOSAL_SENT"
  | "PROPOSAL_ACCEPTED"
  | "PROPOSAL_REJECTED";

export async function notifyUser(params: {
  userId: string;
  type: NotificationType;
  title: string;
  body?: string;
  entityType?: string;
  entityId?: string;
}) {
  return prisma.notification.create({
    data: {
      userId: params.userId,
      type: params.type,
      title: params.title,
      body: params.body,
      metadata: params.entityType ? { entityType: params.entityType, entityId: params.entityId } : undefined,
    },
  });
}

/** Notifies every active Admin — used for events that need admin attention (new requests, escalations). */
export async function notifyAdmins(params: {
  type: NotificationType;
  title: string;
  body?: string;
  entityType?: string;
  entityId?: string;
}) {
  const admins = await prisma.user.findMany({ where: { role: "ADMIN", status: "ACTIVE" }, select: { id: true } });
  if (admins.length === 0) return;
  await prisma.notification.createMany({
    data: admins.map((a) => ({
      userId: a.id,
      type: params.type,
      title: params.title,
      body: params.body,
      metadata: params.entityType ? { entityType: params.entityType, entityId: params.entityId } : undefined,
    })),
  });
}

/** Notify the client's login user (if they have one) and the assigned agent's user, given a Project. */
export async function notifyProjectParticipants(
  projectId: string,
  params: { type: NotificationType; title: string; body?: string; excludeUserId?: string }
) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: { client: { include: { user: true } }, assignedAgent: { include: { user: true } } },
  });
  if (!project) return;

  const recipients = [project.client.user?.id, project.assignedAgent?.user?.id].filter(
    (id): id is string => !!id && id !== params.excludeUserId
  );
  if (recipients.length === 0) return;

  await prisma.notification.createMany({
    data: recipients.map((userId) => ({
      userId,
      type: params.type,
      title: params.title,
      body: params.body,
      metadata: { entityType: "Project", entityId: projectId },
    })),
  });
}
