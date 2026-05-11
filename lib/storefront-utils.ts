import type { Producto } from "@/types";

export const applianceCategories = [
  { key: "all", label: "Todos los aparatos" },
  { key: "monitor", label: "Monitores" },
  { key: "ventilador", label: "Ventiladores" },
  { key: "desfibrilador", label: "Desfibriladores" },
  { key: "oximetro", label: "Oxímetros" },
  { key: "infusion", label: "Bombas de infusión" },
];

export function getSearchBlob(producto: Producto) {
  return `${producto.nombre} ${producto.modelo ?? ""} ${producto.descripcion ?? ""} ${producto.categoria ?? ""}`.toLowerCase();
}

export function matchesCategory(producto: Producto, category: string) {
  if (category === "all") return true;

  const blob = getSearchBlob(producto);
  const keywords: Record<string, string[]> = {
    monitor: ["monitor", "monitores", "signos vitales"],
    ventilador: ["ventilador", "respirador"],
    desfibrilador: ["desfibrilador"],
    oximetro: ["oximetro", "oxímetro", "saturacion"],
    infusion: ["bomba", "infusion", "infusión"],
  };

  return (keywords[category] ?? []).some((keyword) => blob.includes(keyword));
}

export function isMedicalAppliance(producto: Producto) {
  const blob = getSearchBlob(producto);
  const allowed = [
    "monitor",
    "ventilador",
    "desfibrilador",
    "oximetro",
    "bomba",
    "infusion",
    "ecografo",
    "ultrasonido",
    "electrocardiografo",
    "esterilizador",
    "aspirador",
  ];
  const blocked = [
    "medicamento",
    "medicina",
    "tableta",
    "capsula",
    "vestimenta",
    "uniforme",
    "bata",
    "guante",
    "mascarilla",
    "mascara",
  ];

  return allowed.some((word) => blob.includes(word)) && !blocked.some((word) => blob.includes(word));
}

export function isBlockedClientProduct(producto: Producto) {
  const blob = getSearchBlob(producto);
  const blocked = [
    "medicamento",
    "medicina",
    "tableta",
    "capsula",
    "vestimenta",
    "uniforme",
    "bata",
    "guante",
    "mascarilla",
    "mascara",
  ];

  return blocked.some((word) => blob.includes(word));
}

function safeText(text: string) {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export function getProductImageSrc(producto: Producto) {
  if (producto.imagen_url) return producto.imagen_url;

  const title = safeText(producto.nombre);
  const subtitle = safeText(producto.modelo ?? "Equipo médico");
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 560">
      <defs>
        <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#0f172a"/>
          <stop offset="100%" stop-color="#1d4ed8"/>
        </linearGradient>
      </defs>
      <rect width="800" height="560" rx="40" fill="url(#g)"/>
      <circle cx="640" cy="110" r="130" fill="rgba(255,255,255,0.08)"/>
      <circle cx="120" cy="460" r="160" fill="rgba(255,255,255,0.07)"/>
      <rect x="68" y="82" width="664" height="396" rx="28" fill="rgba(255,255,255,0.10)" stroke="rgba(255,255,255,0.20)"/>
      <rect x="118" y="130" width="220" height="220" rx="28" fill="rgba(255,255,255,0.14)"/>
      <path d="M170 236h118M228 178v116" stroke="white" stroke-width="16" stroke-linecap="round"/>
      <text x="380" y="220" fill="white" font-size="34" font-family="Arial, sans-serif" font-weight="700">${title}</text>
      <text x="380" y="270" fill="rgba(255,255,255,0.80)" font-size="22" font-family="Arial, sans-serif">${subtitle}</text>
      <text x="380" y="330" fill="rgba(255,255,255,0.70)" font-size="18" font-family="Arial, sans-serif">Airlytics Store</text>
    </svg>
  `;

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

export function getProductPriceLabel(producto: Producto) {
  const value = getProductPriceValue(producto);
  return value === null ? "Consultar" : `$${productorCurrency(value)}`;
}

export function getProductPriceValue(producto: Producto) {
  return typeof producto.precio === "number" ? producto.precio : null;
}

function productorCurrency(value: number) {
  return new Intl.NumberFormat("es-MX", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}
