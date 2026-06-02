import React from 'react';
import Link from '@docusaurus/Link';
import clsx from 'clsx';
import {Collapsible, useCollapsible} from '@docusaurus/theme-common';

export type MobilePickerLink = {
  label: string;
  to: string;
  external?: boolean;
  /** Leading icon/logo node (built by the picker, which knows its own art). */
  leading?: React.ReactNode;
  description?: string;
};
export type MobilePickerGroup = {header?: string; headerClass?: string; links: MobilePickerLink[]};

/**
 * Mobile rendering for the navbar pickers (Products / Resources).
 *
 * The desktop pickers render a `.navbar__item` + a fixed-position dropdown panel,
 * which infima hides / mis-styles inside the mobile navbar sidebar (the picker
 * "disappeared" on mobile). When Docusaurus renders a navbar item with `mobile`,
 * the picker delegates here to emit the idiomatic collapsible `.menu__list-item`
 * markup the mobile sidebar expects, while keeping the desktop picker's
 * icon + label + description layout so the two read alike.
 */
export default function MobilePickerMenu({
  label,
  groups,
  className,
}: {
  label: string;
  groups: MobilePickerGroup[];
  className?: string;
}) {
  const {collapsed, toggleCollapsed} = useCollapsible({initialState: true});
  return (
    <li className="menu__list-item">
      <a
        role="button"
        href="#"
        aria-expanded={!collapsed}
        className={clsx('menu__link', 'menu__link--sublist', 'menu__link--sublist-caret', className)}
        onClick={(e) => {
          e.preventDefault();
          toggleCollapsed();
        }}>
        {label}
      </a>
      <Collapsible lazy as="ul" className="menu__list" collapsed={collapsed}>
        {groups.map((group, gi) => (
          <React.Fragment key={gi}>
            {group.header && (
              <li className={clsx('menu__list-item', 'nf-mobile-picker-header', group.headerClass)}>{group.header}</li>
            )}
            {group.links.map((link, li) => (
              <li className="menu__list-item" key={li}>
                <Link
                  className="menu__link nf-mobile-picker-link"
                  to={link.to}
                  {...(link.external ? {target: '_blank', rel: 'noopener noreferrer'} : {})}>
                  {link.leading && <span className="nf-mobile-picker-link__icon">{link.leading}</span>}
                  <span className="nf-mobile-picker-link__text">
                    <strong>{link.label}</strong>
                    {link.description && <span className="nf-mobile-picker-link__desc">{link.description}</span>}
                  </span>
                </Link>
              </li>
            ))}
          </React.Fragment>
        ))}
      </Collapsible>
    </li>
  );
}
