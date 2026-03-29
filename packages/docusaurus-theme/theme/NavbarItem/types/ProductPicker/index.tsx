import React from 'react';
import Link from '@docusaurus/Link';
import clsx from 'clsx';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import {useThemeConfig} from '@docusaurus/theme-common';
import NavbarPicker from '../../NavbarPicker';

export type PickerLink = {
  label: string;
  to: string;
  logo?: string;
  logoDark?: string;
  description?: string;
};

export type PickerColumn = {
  header: string;
  headerClass?: string;
  links: PickerLink[];
};

type Props = {
  label?: string;
  position?: 'left' | 'right';
  className?: string;
};

const HEADER_CLASSES = ['picker-header--nf-tertiary', 'picker-header--nf-secondary', 'picker-header--nf-primary'];
const NF_LOGO_DEFAULT = 'https://raw.githubusercontent.com/netfoundry/branding/refs/heads/main/images/svg/icon/netfoundry-icon-color.svg';

const buildDefaultColumns = (img: string, consoleLogo: string): PickerColumn[] => [
  {
    header: 'Managed Cloud',
    headerClass: HEADER_CLASSES[0],
    links: [
      { label: 'NetFoundry Console', to: '#',                  logo: consoleLogo,                          description: 'Cloud-managed orchestration and global fabric control.' },
      { label: 'Frontdoor',          to: '/docs/frontdoor',    logo: `${img}/frontdoor-sm-logo.svg`,       description: 'Secure application access gateway.' },
    ],
  },
  {
    header: 'Open Source',
    headerClass: HEADER_CLASSES[1],
    links: [
      { label: 'OpenZiti', to: '/docs/openziti', logo: `${img}/openziti-sm-logo.svg`,                                                          description: 'Programmable zero-trust mesh infrastructure.' },
      { label: 'zrok',     to: '/docs/zrok',     logo: `${img}/zrok-1.0.0-rocket-purple.svg`, logoDark: `${img}/zrok-1.0.0-rocket-green.svg`, description: 'Secure peer-to-peer sharing built on OpenZiti.' },
    ],
  },
  {
    header: 'Your own infrastructure',
    headerClass: HEADER_CLASSES[2],
    links: [
      { label: 'Self-Hosted', to: '/docs/selfhosted', logo: `${img}/onprem-sm-logo.svg`,    description: 'Deploy the full stack in your own environment.' },
      { label: 'zLAN',        to: '/docs/zlan',        logo: `${img}/zlan/zlan-logo.svg`,   description: 'Zero-trust access for OT networks.' },
    ],
  },
];

export default function ProductPicker({label = 'Products', className}: Props) {
  const {siteConfig} = useDocusaurusContext();
  const themeConfig = useThemeConfig() as any;
  const consoleLogo = themeConfig?.netfoundry?.consoleLogo ?? NF_LOGO_DEFAULT;
  const img = `${siteConfig.url}${siteConfig.baseUrl}img`;
  const columns: PickerColumn[] = (themeConfig?.netfoundry?.productPickerColumns ?? [])
    .map((col: any, i: number) => ({...col, headerClass: HEADER_CLASSES[i] ?? ''}));
  const resolvedColumns = columns.length ? columns : buildDefaultColumns(img, consoleLogo);

  return (
    <NavbarPicker label={label} className={className}>
      <div className="picker-content">
        {resolvedColumns.map((col, i) => (
          <div key={i} className="picker-column">
            <span className={clsx('picker-header', col.headerClass)}>{col.header}</span>
            {col.links.map((link, j) => (
              <Link key={j} to={link.to} className="picker-link">
                {link.logo && <img src={link.logo} className={clsx('picker-logo', link.logoDark && 'picker-logo--light')} alt="" />}
                {link.logoDark && <img src={link.logoDark} className="picker-logo picker-logo--dark" alt="" />}
                <div className="picker-text">
                  <strong>{link.label}</strong>
                  {link.description && <span>{link.description}</span>}
                </div>
              </Link>
            ))}
          </div>
        ))}
      </div>
    </NavbarPicker>
  );
}
