import { NextResponse } from "next/server";

import { reservationRequestSchema } from "@/lib/devis/api-schema";
import { computeTotal } from "@/lib/devis/calculations";
import { getSupport } from "@/lib/devis/pricing";
import {
  allowRequest,
  hasValidSameOrigin,
  jsonError,
  readJsonBody,
} from "@/lib/security/request";

export async function POST(request: Request) {
  if (!hasValidSameOrigin(request)) return jsonError("origine invalide", 403);
  if (!allowRequest(request)) return jsonError("trop de demandes", 429);

  const payload = await readJsonBody(request);
  const parsed = reservationRequestSchema.safeParse(payload);
  if (!parsed.success) return jsonError("réservation invalide", 400);

  const input = parsed.data;
  const support = getSupport(input.support);
  if (!support || support.mode !== "prix") {
    return jsonError("support non réservable", 400);
  }
  if (input.lieu.type === "domicile") {
    if (!input.lieu.address || !input.lieu.addressValidated) {
      return jsonError("adresse non validée", 400);
    }
  }

  const pricing = computeTotal({
    ...input,
    devis: { prenom: "", telephone: "", besoin: "" },
  });
  if (pricing.mode !== "prix" || pricing.total <= 0) {
    return jsonError("tarification invalide", 400);
  }

  // Le paiement et la disponibilité doivent être branchés ici, côté serveur,
  // avec recalcul du prix, verrouillage transactionnel du créneau et clé
  // d'idempotence côté prestataire. En l'absence de ces intégrations, on
  // échoue explicitement au lieu de confirmer une réservation fictive.
  return NextResponse.json(
    { error: "service de réservation non configuré" },
    {
      status: 503,
      headers: {
        "Cache-Control": "no-store",
        "X-Content-Type-Options": "nosniff",
      },
    },
  );
}
