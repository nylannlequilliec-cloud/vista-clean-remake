import { describe, expect, it } from "vitest";

import { POST as postDevis } from "@/app/api/devis/route";
import { POST as postReservation } from "@/app/api/reservation/route";

function request(path: string, body: unknown, ip: string) {
  return new Request(`http://localhost${path}`, {
    method: "POST",
    headers: {
      Origin: "http://localhost:3000",
      Host: "localhost:3000",
      "Content-Type": "application/json",
      "X-Forwarded-For": ip,
    },
    body: JSON.stringify(body),
  });
}

describe("API de réservation et de devis", () => {
  it("refuse un payload de réservation avec une option inconnue", async () => {
    const response = await postReservation(
      request(
        "/api/reservation",
        {
          support: "citadine",
          pack: "confort",
          options: ["option-inconnue"],
          lieu: {
            type: "local",
            address: "",
            addressValidated: false,
            noElectricity: false,
          },
          creneauId: "2026-09-10-0900",
        },
        "198.51.100.10",
      ),
    );

    expect(response.status).toBe(400);
  });

  it("échoue fermé tant que le paiement et la disponibilité ne sont pas branchés", async () => {
    const response = await postReservation(
      request(
        "/api/reservation",
        {
          support: "citadine",
          pack: "confort",
          options: ["ozone"],
          lieu: {
            type: "local",
            address: "",
            addressValidated: false,
            noElectricity: false,
          },
          creneauId: "2026-09-10-0900",
        },
        "198.51.100.11",
      ),
    );

    expect(response.status).toBe(503);
  });

  it("n'affiche jamais une confirmation de devis sans remise serveur", async () => {
    const response = await postDevis(
      request(
        "/api/devis",
        {
          support: "demande-specifique",
          devis: {
            prenom: "Jean",
            telephone: "06 12 34 56 78",
            besoin: "Nettoyage d'un canapé",
          },
        },
        "198.51.100.12",
      ),
    );

    expect(response.status).toBe(503);
  });

  it("bloque une requête sans origine browser valide", async () => {
    const blocked = new Request("http://localhost/api/devis", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });

    const response = await postDevis(blocked);
    expect(response.status).toBe(403);
  });
});
