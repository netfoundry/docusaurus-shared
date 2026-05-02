import React from 'react';
import Link from '@docusaurus/Link';
import clsx from 'clsx';
import {useThemeConfig} from '@docusaurus/theme-common';
import {useLocation} from 'react-router-dom';
import NavbarPicker from '../../NavbarPicker';
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
};

const HEADER_CLASSES = ['picker-header--nf-tertiary', 'picker-header--nf-primary', 'picker-header--nf-secondary'];

function pathLabel(pathname: string, columns: PickerColumn[], fallback: string): string {
  for (const col of columns) {
    for (const link of col.links) {
      const parts = link.to.replace(/^https?:\/\/[^/]+/, '').split('/').filter(Boolean);
      if (parts.length >= 2) {
        const prefix = '/' + parts.slice(0, 2).join('/');
        if (pathname.startsWith(prefix)) return link.label;
      }
    }
  }
  return fallback;
}

export default function ProductPicker({label = 'Products', className}: Props) {
  const themeConfig = useThemeConfig() as any;
  const {pathname} = useLocation();
  const supplied = themeConfig?.netfoundry?.productPickerColumns as PickerColumn[] | undefined;
  const baseColumns: PickerColumn[] = supplied && supplied.length ? supplied : subsitePickerColumns;
  const resolvedColumns: PickerColumn[] = baseColumns.map((col, i) => ({...col, headerClass: HEADER_CLASSES[i] ?? ''}));
  const resolvedLabel = pathLabel(pathname, resolvedColumns, label);

  return (
    <NavbarPicker label={resolvedLabel} className={className}>
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
