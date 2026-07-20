"use client"

import { Collapsible } from "@base-ui/react/collapsible"
import { ChevronDownIcon, HelpCircleIcon } from "lucide-react"

import { cn } from "@/lib/utils"

interface VehicleType {
  label: string
  description: string
}

const VEHICLE_TYPES: VehicleType[] = [
  {
    label: "Citadine",
    description:
      "Petite voiture compacte et maniable, 3 à 5 portes (ex. Renault Clio, Peugeot 208, Toyota Yaris).",
  },
  {
    label: "Berline",
    description:
      "Voiture familiale à coffre séparé, 4 à 5 places (ex. Peugeot 508, Volkswagen Passat, BMW Série 3).",
  },
  {
    label: "SUV",
    description:
      "Véhicule surélevé de type crossover ou 4x4 (ex. Peugeot 3008, Dacia Duster, Nissan Qashqai).",
  },
  {
    label: "Monospace 5 places",
    description:
      "Véhicule spacieux à une seule rangée de sièges à l'arrière (ex. Citroën C4 Picasso, Renault Scénic).",
  },
  {
    label: "Monospace 7 places",
    description:
      "Grand monospace à trois rangées de sièges (ex. Renault Espace, Volkswagen Sharan, Ford Galaxy).",
  },
  {
    label: "Utilitaire",
    description:
      "Fourgon ou véhicule de société, avec ou sans espace de chargement (ex. Renault Kangoo, Trafic, Citroën Jumpy).",
  },
]

interface VehicleHelpProps {
  className?: string
}

function VehicleHelp({ className }: VehicleHelpProps) {
  return (
    <Collapsible.Root
      data-slot="vehicle-help"
      className={cn("flex w-full flex-col", className)}
    >
      <Collapsible.Trigger
        data-slot="vehicle-help-trigger"
        className="group/vehicle-help inline-flex w-fit items-center gap-1.5 rounded-lg px-1 py-1 text-left text-sm font-medium text-primary underline-offset-4 transition-colors outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        <HelpCircleIcon className="size-4 shrink-0" aria-hidden="true" />
        Un doute sur ton type de véhicule ? regarde ici
        <ChevronDownIcon
          className="size-4 shrink-0 transition-transform duration-200 group-aria-expanded/vehicle-help:rotate-180"
          aria-hidden="true"
        />
      </Collapsible.Trigger>

      <Collapsible.Panel
        data-slot="vehicle-help-panel"
        keepMounted
        className="h-[var(--collapsible-panel-height)] overflow-hidden transition-[height] duration-300 ease-out will-change-[height] data-ending-style:h-0 data-starting-style:h-0 motion-reduce:transition-none"
      >
        <div className="mt-2 rounded-xl border border-border bg-muted/40 p-4">
          <p className="mb-3 text-sm text-muted-foreground">
            Voici comment reconnaître chaque type de véhicule pour choisir le
            support adapté à ta prestation.
          </p>
          <dl className="flex flex-col gap-3">
            {VEHICLE_TYPES.map((vehicle) => (
              <div key={vehicle.label}>
                <dt className="text-sm font-semibold text-foreground">
                  {vehicle.label}
                </dt>
                <dd className="text-sm text-muted-foreground">
                  {vehicle.description}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </Collapsible.Panel>
    </Collapsible.Root>
  )
}

export { VehicleHelp }
