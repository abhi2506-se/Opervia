import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { assertCanAccessProposal, toApiError } from "@/lib/authz";
import { writeAuditLog } from "@/lib/audit";
import { triggerCommission } from "@/lib/commissions";

const updateSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  amount: z.number().nonnegative().optional(),
  status: z
    .enum([
      "DRAFT",
      "READY",
      "SENT",
      "VIEWED",
      "ACCEPTED",
      "REJECTED",
      "CHANGE_REQUESTED",
      "EXPIRED",
      "CANCELLED",
    ])
    .optional(),
});

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { proposal } = await assertCanAccessProposal(id);
    const full = await prisma.proposal.findUnique({
      where: { id },
      include: { agent: { include: { user: true } }, lead: true, client: true, document: true, emailMessages: true },
    });
    return NextResponse.json({ proposal: full ?? proposal });
  } catch (err) {
    const { status, message } = toApiError(err);
    return NextResponse.json({ error: message }, { status });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { session, proposal } = await assertCanAccessProposal(id);
    const body = await req.json();
    const data = updateSchema.parse(body);

    const updated = await prisma.proposal.update({
      where: { id },
      data: {
        ...(data.title ? { title: data.title } : {}),
        ...(data.amount !== undefined ? { amount: data.amount } : {}),
        ...(data.status ? { status: data.status } : {}),
        ...(data.status === "SENT" ? { sentAt: new Date() } : {}),
        ...(data.status && ["ACCEPTED", "REJECTED", "CHANGE_REQUESTED"].includes(data.status)
          ? { respondedAt: new Date() }
          : {}),
      },
    });

    if (data.status && data.status !== proposal.status) {
      await writeAuditLog({
        actorId: session.user.id,
        actorRole: session.user.role,
        action: "proposal.status_changed",
        entityType: "Proposal",
        entityId: proposal.id,
        description: `${session.user.name} changed Proposal status`,
        previousValue: { status: proposal.status },
        newValue: { status: updated.status },
      });

      // Commission auto-trigger — only on genuine acceptance, never on send,
      // view, or any other transition (spec section 20).
      if (data.status === "ACCEPTED" && updated.amount) {
        await triggerCommission({
          agentId: updated.agentId,
          sourceType: "PROPOSAL_ACCEPTED",
          sourceId: updated.id,
          baseAmount: Number(updated.amount),
          actorId: session.user.id,
          actorRole: session.user.role,
          actorName: session.user.name,
        });
      }
    }

    return NextResponse.json({ proposal: updated });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed", details: err.flatten() }, { status: 400 });
    }
    const { status, message } = toApiError(err);
    return NextResponse.json({ error: message }, { status });
  }
}
