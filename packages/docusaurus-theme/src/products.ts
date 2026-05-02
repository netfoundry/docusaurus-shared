/**
 * Canonical NetFoundry product registry and ready-made picker column blocks.
 *
 * Source of truth for everything the product picker shows: labels, logos,
 * descriptions, and the URL each product points at. Two pre-built picker
 * column arrays are exported -- consumers pick one based on whether they're
 * the unified docs site or a standalone subsite.
 */

export type ProductId =
  | 'console'
  | 'frontdoor'
  | 'selfhosted'
  | 'zlan'
  | 'openziti'
  | 'zrok';

export interface Product {
  id: ProductId;
  label: string;
  /** Path under /docs/ -- e.g. `openziti/learn/introduction`. */
  path: string;
  logo: string;
  logoDark?: string;
  description: string;
}

/** Production base where all NetFoundry product docs live. */
export const DOCS_BASE = 'https://netfoundry.io/docs';

const NF_LOGO =
  'https://raw.githubusercontent.com/netfoundry/branding/refs/heads/main/images/svg/icon/netfoundry-icon-color.svg';
const IMG = `${DOCS_BASE}/img`;

export const PRODUCTS: Record<ProductId, Product> = {
  console: {
    id: 'console',
    label: 'NetFoundry Console',
    path: 'platform/intro',
    logo: NF_LOGO,
    description: 'Cloud-managed orchestration and global fabric control.',
  },
  frontdoor: {
    id: 'frontdoor',
    label: 'Frontdoor',
    path: 'frontdoor/intro',
    logo: `${IMG}/frontdoor-sm-logo.svg`,
    description: 'Secure application access gateway.',
  },
  selfhosted: {
    id: 'selfhosted',
    label: 'NetFoundry Self-Hosted',
    path: 'selfhosted/intro',
    logo: `${IMG}/onprem-sm-logo.svg`,
    description: 'Deploy the full stack in your own environment.',
  },
  zlan: {
    id: 'zlan',
    label: 'zLAN',
    path: 'zlan/intro',
    logo: `${IMG}/zlan/zlan-logo.svg`,
    description: 'Zero-trust access for OT networks.',
  },
  openziti: {
    id: 'openziti',
    label: 'OpenZiti',
    path: 'openziti/learn/introduction',
    logo: `${IMG}/openziti-sm-logo.svg`,
    description: 'Programmable zero-trust mesh infrastructure.',
  },
  zrok: {
    id: 'zrok',
    label: 'zrok',
    path: 'zrok/get-started',
    logo: `${IMG}/zrok-1.0.0-rocket-purple.svg`,
    logoDark: `${IMG}/zrok-1.0.0-rocket-green.svg`,
    description: 'Secure peer-to-peer sharing built on OpenZiti.',
  },
};

/** Visual layout of the picker -- order here = order on screen. */
const PICKER_LAYOUT: { header: string; items: ProductId[] }[] = [
  { header: 'Cloud SaaS',              items: ['console',    'frontdoor'] },
  { header: 'Self-Hosted Licensed',    items: ['selfhosted', 'zlan']      },
  { header: 'Self-Hosted Open Source', items: ['openziti',   'zrok']      },
];

export interface PickerLink {
  label: string;
  to: string;
  logo?: string;
  logoDark?: string;
  description?: string;
}

export interface PickerColumn {
  header: string;
  links: PickerLink[];
}

const linkFor = (id: ProductId, prefix: string): PickerLink => {
  const p = PRODUCTS[id];
  return {
    label: p.label,
    to: `${prefix}/${p.path}`,
    logo: p.logo,
    logoDark: p.logoDark,
    description: p.description,
  };
};

/* ------------------------------------------------------------------ */
/* Per-product PickerLink exports.                                    */
/*                                                                    */
/* Two flavours per product:                                          */
/*   <id>Link    -> relative /docs/<path>        (use in unified-doc) */
/*   <id>LinkAbs -> absolute https://netfoundry.io/docs/<path>        */
/*                  (use in standalone subsites)                      */
/*                                                                    */
/* Spread them and override any field you want:                       */
/*   { ...frontdoorLink, description: 'something else' }              */
/*   { ...openzitiLink, to: '/docs/openziti' }                        */
/* ------------------------------------------------------------------ */

export const consoleLink:    PickerLink = linkFor('console',    '/docs');
export const frontdoorLink:  PickerLink = linkFor('frontdoor',  '/docs');
export const selfhostedLink: PickerLink = linkFor('selfhosted', '/docs');
export const zlanLink:       PickerLink = linkFor('zlan',       '/docs');
export const openzitiLink:   PickerLink = linkFor('openziti',   '/docs');
export const zrokLink:       PickerLink = linkFor('zrok',       '/docs');

export const consoleLinkAbs:    PickerLink = linkFor('console',    DOCS_BASE);
export const frontdoorLinkAbs:  PickerLink = linkFor('frontdoor',  DOCS_BASE);
export const selfhostedLinkAbs: PickerLink = linkFor('selfhosted', DOCS_BASE);
export const zlanLinkAbs:       PickerLink = linkFor('zlan',       DOCS_BASE);
export const openzitiLinkAbs:   PickerLink = linkFor('openziti',   DOCS_BASE);
export const zrokLinkAbs:       PickerLink = linkFor('zrok',       DOCS_BASE);

/**
 * Picker columns for the unified docs site at netfoundry.io/docs.
 * Every link is a relative `/docs/<path>` so navigation stays in-site.
 *
 * Drop into `themeConfig.netfoundry.productPickerColumns` as-is, or build
 * your own array using the per-product exports above to override fields.
 */
export const unifiedPickerColumns: PickerColumn[] = [
  { header: 'Cloud SaaS',              links: [consoleLink,    frontdoorLink] },
  { header: 'Self-Hosted Licensed',    links: [selfhostedLink, zlanLink]      },
  { header: 'Self-Hosted Open Source', links: [openzitiLink,   zrokLink]      },
];

/**
 * Picker columns for standalone subsites (ziti-doc, zrok-doc, etc.).
 * Every link points at the absolute prod URL on netfoundry.io/docs.
 */
export const subsitePickerColumns: PickerColumn[] = [
  { header: 'Cloud SaaS',              links: [consoleLinkAbs,    frontdoorLinkAbs] },
  { header: 'Self-Hosted Licensed',    links: [selfhostedLinkAbs, zlanLinkAbs]      },
  { header: 'Self-Hosted Open Source', links: [openzitiLinkAbs,   zrokLinkAbs]      },
];
