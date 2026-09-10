import { resolveMode } from "@/lib/devis/mode";
import { devisRequestSchema } from "@/lib/devis/api-schema";
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
  const parsed = devisRequestSchema.safeParse(payload);
  if (!parsed.success || resolveMode(parsed.data?.support) !== "devis") {
    return jsonError("demande invalide", 400);
  }

  // Aucun fournisseur d'e-mail/CRM n'est configuré dans ce dépôt. Ne jamais
  // prétendre qu'une demande est envoyée tant qu'elle n'est pas réellement
  // remise à un service serveur sécurisé.
  return jsonError("service de devis non configuré", 503);
}
