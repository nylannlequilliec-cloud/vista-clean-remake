// Feature: devis-questionnaire — Task 9.7
// Tests de composants et d'accessibilité des composants de présentation
// réutilisables du Tunnel (SupportCard, OptionItem, ProgressBar,
// StepNavigation, VehicleHelp, StickyRecap).
//
// Couvre : opérabilité clavier, rôles ARIA (radio / checkbox / step),
// aria-checked / aria-current / aria-live, focus, distinction d'état non
// chromatique (icône Check / attributs ARIA), infobulle d'option, aide
// véhicule.
//
// Requirements: 2.2, 2.3, 2.4, 3.6, 6.9, 16.1, 16.2, 16.4, 16.5, 16.6
//
// Remarque : les primitives @base-ui/react (Tooltip, Collapsible) utilisent des
// portails/animations qui se comportent mal sous jsdom. Les assertions portent
// donc sur le déclencheur et ses attributs ARIA (accessible name, aria-expanded)
// plutôt que sur le popup rendu.

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { OptionItem } from "@/components/devis/option-item";
import { ProgressBar, type StepMeta } from "@/components/devis/progress-bar";
import { StepNavigation } from "@/components/devis/step-navigation";
import { StickyRecap } from "@/components/devis/sticky-recap";
import { SupportCard } from "@/components/devis/support-card";
import { VehicleHelp } from "@/components/devis/vehicle-help";
import { OPTIONS, SUPPORTS } from "@/lib/devis/pricing";
import type {
  OptionDef,
  PricingBreakdown,
  TunnelState,
} from "@/lib/devis/types";

// ─── Fixtures ───────────────────────────────────────────────────────────────

const support = SUPPORTS[0]; // "citadine" — Citadine

const optionNoInfo: OptionDef = OPTIONS[0];

const optionWithInfo: OptionDef = {
  id: "traitement-cuir",
  category: "TRAITEMENT",
  label: "Traitement du cuir",
  price: 50,
  info: "Nettoyage et nourrissage en profondeur des surfaces en cuir.",
};

const steps: StepMeta[] = [
  { number: 1, label: "Lavage" },
  { number: 2, label: "Pack" },
  { number: 3, label: "Options" },
  { number: 4, label: "Lieu" },
  { number: 5, label: "Paiement" },
];

// ─── SupportCard ──────────────────────────────────────────────────────────────

describe("SupportCard", () => {
  it("expose role=radio et aria-checked reflétant la sélection", () => {
    const { rerender } = render(
      <SupportCard support={support} selected={false} onSelect={() => {}} />,
    );

    const radio = screen.getByRole("radio", { name: /citadine/i });
    expect(radio).toHaveAttribute("aria-checked", "false");

    rerender(
      <SupportCard support={support} selected onSelect={() => {}} />,
    );
    expect(
      screen.getByRole("radio", { name: /citadine/i }),
    ).toHaveAttribute("aria-checked", "true");
  });

  it("appelle onSelect avec l'id du support au clic", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(
      <SupportCard support={support} selected={false} onSelect={onSelect} />,
    );

    await user.click(screen.getByRole("radio", { name: /citadine/i }));
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect).toHaveBeenCalledWith(support.id);
  });

  it("est opérable au clavier (focus + Entrée)", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(
      <SupportCard support={support} selected={false} onSelect={onSelect} />,
    );

    await user.tab();
    const radio = screen.getByRole("radio", { name: /citadine/i });
    expect(radio).toHaveFocus();

    await user.keyboard("{Enter}");
    expect(onSelect).toHaveBeenCalledWith(support.id);
  });

  it("porte un libellé accessible non vide", () => {
    render(
      <SupportCard support={support} selected={false} onSelect={() => {}} />,
    );
    expect(
      screen.getByRole("radio", { name: support.label }),
    ).toBeInTheDocument();
  });
});

// ─── OptionItem ────────────────────────────────────────────────────────────────

describe("OptionItem", () => {
  it("expose role=checkbox et aria-checked reflétant la sélection", () => {
    const { rerender } = render(
      <OptionItem option={optionNoInfo} selected={false} onToggle={() => {}} />,
    );

    const checkbox = screen.getByRole("checkbox", { name: new RegExp(optionNoInfo.label, "i") });
    expect(checkbox).toHaveAttribute("aria-checked", "false");

    rerender(
      <OptionItem option={optionNoInfo} selected onToggle={() => {}} />,
    );
    expect(
      screen.getByRole("checkbox", { name: new RegExp(optionNoInfo.label, "i") }),
    ).toHaveAttribute("aria-checked", "true");
  });

  it("bascule via onToggle au clic avec l'id de l'option", async () => {
    const user = userEvent.setup();
    const onToggle = vi.fn();
    render(
      <OptionItem option={optionNoInfo} selected={false} onToggle={onToggle} />,
    );

    await user.click(
      screen.getByRole("checkbox", { name: new RegExp(optionNoInfo.label, "i") }),
    );
    expect(onToggle).toHaveBeenCalledTimes(1);
    expect(onToggle).toHaveBeenCalledWith(optionNoInfo.id);
  });

  it("affiche le prix formaté de l'option", () => {
    render(
      <OptionItem option={optionNoInfo} selected={false} onToggle={() => {}} />,
    );
    // Le prix est rendu via formatEuro ; on vérifie la présence du montant.
    expect(
      screen.getByText((content) => content.includes(String(optionNoInfo.price))),
    ).toBeInTheDocument();
  });

  it("rend un déclencheur d'infobulle avec un nom accessible quand l'option a une info", () => {
    render(
      <OptionItem option={optionWithInfo} selected={false} onToggle={() => {}} />,
    );

    // Assertion sur le déclencheur (et son accessible name), pas sur le popup.
    expect(
      screen.getByRole("button", {
        name: `Plus d'informations sur ${optionWithInfo.label}`,
      }),
    ).toBeInTheDocument();
  });

  it("ne rend pas de déclencheur d'infobulle sans info", () => {
    render(
      <OptionItem option={optionNoInfo} selected={false} onToggle={() => {}} />,
    );
    expect(
      screen.queryByRole("button", {
        name: /Plus d'informations sur/i,
      }),
    ).not.toBeInTheDocument();
  });
});

// ─── ProgressBar ───────────────────────────────────────────────────────────────

describe("ProgressBar", () => {
  it("rend les cinq étapes", () => {
    render(
      <ProgressBar
        steps={steps}
        activeIndex={0}
        completed={[false, false, false, false, false]}
        reachable={[true, false, false, false, false]}
        onSelectStep={() => {}}
      />,
    );
    expect(screen.getAllByRole("button")).toHaveLength(5);
  });

  it("marque l'étape active avec aria-current=step", () => {
    render(
      <ProgressBar
        steps={steps}
        activeIndex={1}
        completed={[true, false, false, false, false]}
        reachable={[true, true, false, false, false]}
        onSelectStep={() => {}}
      />,
    );

    const active = screen.getByRole("button", { name: /Étape 2 sur 5 : Pack/i });
    expect(active).toHaveAttribute("aria-current", "step");
  });

  it("annonce l'étape complétée dans le nom accessible (indice non chromatique)", () => {
    render(
      <ProgressBar
        steps={steps}
        activeIndex={1}
        completed={[true, false, false, false, false]}
        reachable={[true, true, false, false, false]}
        onSelectStep={() => {}}
      />,
    );
    expect(
      screen.getByRole("button", { name: /Lavage.*complétée/i }),
    ).toBeInTheDocument();
  });

  it("désactive les étapes non accessibles", () => {
    render(
      <ProgressBar
        steps={steps}
        activeIndex={0}
        completed={[false, false, false, false, false]}
        reachable={[true, true, false, false, false]}
        onSelectStep={() => {}}
      />,
    );

    const disabled = screen.getByRole("button", { name: /Étape 4 sur 5 : Lieu/i });
    expect(disabled).toBeDisabled();
    expect(disabled).toHaveAttribute("aria-disabled", "true");
  });

  it("appelle onSelectStep au clic sur une étape accessible", async () => {
    const user = userEvent.setup();
    const onSelectStep = vi.fn();
    render(
      <ProgressBar
        steps={steps}
        activeIndex={1}
        completed={[true, false, false, false, false]}
        reachable={[true, true, false, false, false]}
        onSelectStep={onSelectStep}
      />,
    );

    await user.click(screen.getByRole("button", { name: /Étape 1 sur 5 : Lavage/i }));
    expect(onSelectStep).toHaveBeenCalledWith(0);
  });

  it("ne déclenche pas onSelectStep sur une étape non accessible", async () => {
    const user = userEvent.setup();
    const onSelectStep = vi.fn();
    render(
      <ProgressBar
        steps={steps}
        activeIndex={0}
        completed={[false, false, false, false, false]}
        reachable={[true, false, false, false, false]}
        onSelectStep={onSelectStep}
      />,
    );

    await user.click(screen.getByRole("button", { name: /Étape 3 sur 5 : Options/i }));
    expect(onSelectStep).not.toHaveBeenCalled();
  });

  it("expose une région live annonçant l'étape courante", () => {
    const { container } = render(
      <ProgressBar
        steps={steps}
        activeIndex={2}
        completed={[true, true, false, false, false]}
        reachable={[true, true, true, false, false]}
        onSelectStep={() => {}}
      />,
    );

    const live = container.querySelector('[aria-live="polite"]');
    expect(live).not.toBeNull();
    expect(live).toHaveTextContent("Étape 3 sur 5 : Options");
  });
});

// ─── StepNavigation ──────────────────────────────────────────────────────────

describe("StepNavigation", () => {
  it("masque « Retour » quand canGoBack est faux", () => {
    render(
      <StepNavigation
        canGoBack={false}
        onNext={() => {}}
        onPrev={() => {}}
      />,
    );
    expect(
      screen.queryByRole("button", { name: /Retour/i }),
    ).not.toBeInTheDocument();
  });

  it("affiche « Retour » quand canGoBack est vrai", () => {
    render(
      <StepNavigation canGoBack onNext={() => {}} onPrev={() => {}} />,
    );
    expect(
      screen.getByRole("button", { name: /Retour/i }),
    ).toBeInTheDocument();
  });

  it("appelle onNext au clic sur le bouton principal", async () => {
    const user = userEvent.setup();
    const onNext = vi.fn();
    render(
      <StepNavigation canGoBack onNext={onNext} onPrev={() => {}} />,
    );

    await user.click(screen.getByRole("button", { name: /Continuer/i }));
    expect(onNext).toHaveBeenCalledTimes(1);
  });

  it("appelle onPrev au clic sur « Retour »", async () => {
    const user = userEvent.setup();
    const onPrev = vi.fn();
    render(
      <StepNavigation canGoBack onNext={() => {}} onPrev={onPrev} />,
    );

    await user.click(screen.getByRole("button", { name: /Retour/i }));
    expect(onPrev).toHaveBeenCalledTimes(1);
  });

  it("adapte le libellé sur la dernière étape", () => {
    render(
      <StepNavigation
        canGoBack
        isLastStep
        onNext={() => {}}
        onPrev={() => {}}
      />,
    );
    expect(
      screen.getByRole("button", { name: /Réserver mon lavage/i }),
    ).toBeInTheDocument();
  });
});

// ─── VehicleHelp ─────────────────────────────────────────────────────────────

describe("VehicleHelp", () => {
  it("affiche le libellé exact du déclencheur", () => {
    render(<VehicleHelp />);
    expect(
      screen.getByRole("button", {
        name: /Un doute sur ton type de véhicule \? regarde ici/i,
      }),
    ).toBeInTheDocument();
  });

  it("bascule l'état de divulgation (aria-expanded) au clic", async () => {
    const user = userEvent.setup();
    render(<VehicleHelp />);

    const trigger = screen.getByRole("button", {
      name: /Un doute sur ton type de véhicule \? regarde ici/i,
    });
    expect(trigger).toHaveAttribute("aria-expanded", "false");

    await user.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "true");

    await user.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "false");
  });
});

// ─── StickyRecap ─────────────────────────────────────────────────────────────

describe("StickyRecap", () => {
  const prixState: TunnelState = {
    support: "citadine",
    pack: "confort",
    options: ["coffre"],
    lieu: { type: "local", address: "", addressValidated: false, noElectricity: false },
    creneauId: null,
    devis: { prenom: "", telephone: "", besoin: "" },
  };

  const prixPricing: PricingBreakdown = {
    mode: "prix",
    packPrice: 99,
    optionsTotal: 20,
    optionLines: [{ label: "Coffre", amount: 20 }],
    fraisDeplacement: 0,
    supplementGroupeElectrogene: 0,
    total: 119,
    acompte: 17.85,
  };

  it("affiche le détail chiffré en Mode_Prix", () => {
    render(<StickyRecap state={prixState} pricing={prixPricing} />);
    // Le détail est rendu (desktop + mobile), on vérifie la présence du libellé.
    expect(screen.getAllByText(/Prix total/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Acompte/i).length).toBeGreaterThan(0);
  });

  it("affiche « Tarification sur devis » en Mode_Devis", () => {
    const devisState: TunnelState = {
      ...prixState,
      support: "utilitaire",
      pack: null,
      options: [],
    };
    const devisPricing: PricingBreakdown = {
      ...prixPricing,
      mode: "devis",
      total: 0,
      acompte: 0,
    };

    render(<StickyRecap state={devisState} pricing={devisPricing} />);
    expect(
      screen.getAllByText(/Tarification sur devis/i).length,
    ).toBeGreaterThan(0);
    expect(screen.queryByText(/Prix total/i)).not.toBeInTheDocument();
  });
});
