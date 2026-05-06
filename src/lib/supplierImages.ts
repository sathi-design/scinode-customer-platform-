/**
 * Supplier Images — single source of truth for all dashboard/project imagery.
 *
 * All images live in /public/images/supplier/ and are served as static assets.
 * Always import from this file; never hardcode image URLs in components.
 *
 * Image index:
 *  01 — Pesticide spraying in field               (Agrochemical)
 *  02 — Agro lab — plant + orange beaker          (Agrochemical lab)
 *  03 — Fertilizer granules on gloved hand        (Agrochemical)
 *  04 — Green liquid beaker in crop field         (Agrochemical)
 *  05 — Lab weighing & mixing chemicals           (Industrial Chemical)
 *  06 — Pharma bioreactor / manufacturing equip  (Pharmaceutical)
 *  07 — Chemist examining blue-liquid flask       (Pharmaceutical)
 *  08 — Amber liquid flask in gloved hand         (Industrial Chemical)
 *  09 — Scientist pipetting colorful beakers      (Industrial Chemical)
 *  10 — Industrial chemical plant at sunset       (Industrial Chemical)
 *  11 — Stainless-steel bioreactor vessels        (Pharmaceutical)
 *  12 — Large industrial factory / plant          (Industrial Chemical)
 *  13 — Blue-liquid lab scientist                 (Pharmaceutical)
 *  14 — Pharma pills poured from bottle           (Pharmaceutical)
 *  15 — Scientist with vials & microscope         (Specialty Chemical)
 *  16 — Orange & amber lab flasks                 (Specialty Chemical)
 *  17 — Blue test-tube rack                       (Specialty Chemical)
 *  18 — Brown amber vials & capsules              (Pharmaceutical)
 */

const BASE = "/images/supplier";

export const SUPPLIER_IMAGES = {
  /** Agro / field / crop images */
  agro: [
    `${BASE}/supplier-01.png`, // pesticide spraying
    `${BASE}/supplier-02.png`, // agro lab orange beaker
    `${BASE}/supplier-03.png`, // fertilizer granules
    `${BASE}/supplier-04.png`, // green liquid in field
  ],

  /** Industrial chemical plant / factory images */
  industrial: [
    `${BASE}/supplier-05.png`, // lab mixing
    `${BASE}/supplier-08.png`, // amber flask
    `${BASE}/supplier-09.png`, // colorful beakers
    `${BASE}/supplier-10.png`, // industrial plant sunset
    `${BASE}/supplier-12.png`, // factory
  ],

  /** Pharmaceutical / biotech images */
  pharma: [
    `${BASE}/supplier-06.png`, // bioreactor
    `${BASE}/supplier-07.png`, // blue flask chemist
    `${BASE}/supplier-11.png`, // stainless bioreactors
    `${BASE}/supplier-13.png`, // blue liquid scientist
    `${BASE}/supplier-14.png`, // pills
    `${BASE}/supplier-18.png`, // vials & capsules
  ],

  /** Specialty chemical / lab images */
  specialty: [
    `${BASE}/supplier-15.png`, // vials + microscope
    `${BASE}/supplier-16.png`, // orange flasks
    `${BASE}/supplier-17.png`, // blue test tubes
  ],

  /** All 18 images in order — use when you need a general pool */
  all: Array.from({ length: 18 }, (_, i) => `${BASE}/supplier-${String(i + 1).padStart(2, "0")}.png`),
} as const;

/**
 * Pick an image by cycling through a category array using any index.
 * This ensures images rotate predictably across lists.
 *
 * @example
 * // Get the 3rd industrial image (wraps around if index > length)
 * supplierImage("industrial", 2)
 */
export function supplierImage(
  category: keyof typeof SUPPLIER_IMAGES,
  index: number,
): string {
  const pool = SUPPLIER_IMAGES[category] as readonly string[];
  return pool[index % pool.length];
}
