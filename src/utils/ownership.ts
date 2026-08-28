import { Request } from "express";
import { AppError } from "./appError";

/**
 * Throws 403 unless the logged-in user (req.user, set by VerifyToken)
 * is an ADMIN or owns the resource identified by `resourceOwnerId`.
 *
 * Use this in controllers/services for any endpoint that takes a
 * userId / ownerId from the URL or a loaded resource, to close
 * IDOR / broken object-level authorization gaps.
 */
export function assertOwnerOrAdmin(req: Request, resourceOwnerId: string) {
  const requester = req.user;

  if (!requester) {
    throw new AppError("Unauthorized", 401);
  }

  if (requester.role === "ADMIN") return;

  if (requester.id !== resourceOwnerId) {
    throw new AppError(
      "Forbidden: You do not have permission to access this resource",
      403
    );
  }
}
