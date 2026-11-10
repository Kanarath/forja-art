// Navegación principal. `match` decide qué enlace se marca como activo.
export interface NavItem { label: string; href: string; accent?: "pixel" | "voxel" | "fundamentos" }

export const NAV: NavItem[] = [
  { label: "Taller", href: "" },
  { label: "Pixel Forge", href: "pixel/", accent: "pixel" },
  { label: "Voxel Forge", href: "voxel/", accent: "voxel" },
  { label: "Fundamentos", href: "fundamentos/", accent: "fundamentos" },
  { label: "Labs", href: "labs/" },
  { label: "Forge Tools", href: "tools/" },
  { label: "Portfolio", href: "portfolio/" },
  { label: "Logros", href: "logros/" },
];
