import React from 'react';
import Link from '@docusaurus/Link';
import clsx from 'clsx';
import {useThemeConfig} from '@docusaurus/theme-common';
import NavbarPicker from '../../NavbarPicker';
import MobilePickerMenu from '../../MobilePickerMenu';
import {subsitePickerColumns} from '../../../../src/products';

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
  /** Set by Docusaurus when rendered inside the mobile navbar sidebar. */
  mobile?: boolean;
};

const HEADER_CLASSES = ['picker-header--nf-tertiary', 'picker-header--nf-primary', 'picker-header--nf-secondary'];

export default function ProductPicker({label = 'Products', className, mobile}: Props) {
  const themeConfig = useThemeConfig() as any;
  const supplied = themeConfig?.netfoundry?.productPickerColumns as PickerColumn[] | undefined;
  const baseColumns: PickerColumn[] = supplied && supplied.length ? supplied : subsitePickerColumns;
  const resolvedColumns: PickerColumn[] = baseColumns.map((col, i) => ({...col, headerClass: HEADER_CLASSES[i] ?? ''}));

  if (mobile) {
    return (
      <MobilePickerMenu
        label={label}
        className={className}
        groups={resolvedColumns.map((col) => ({
          header: col.header,
          headerClass: col.headerClass,
          links: col.links.map((link) => ({
            label: link.label,
            to: link.to,
            description: link.description,
            leading: (link.logo || link.logoDark) ? (
              <>
                {link.logo && <img src={link.logo} className={clsx('picker-logo', link.logoDark && 'picker-logo--light')} alt="" />}
                {link.logoDark && <img src={link.logoDark} className="picker-logo picker-logo--dark" alt="" />}
              </>
            ) : null,
          })),
        }))}
      />
    );
  }

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
