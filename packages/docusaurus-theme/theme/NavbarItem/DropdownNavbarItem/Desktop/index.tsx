import React, {useState, useRef, useEffect, useCallback} from 'react';
import clsx from 'clsx';
import NavbarNavLinkOrig from '@theme/NavbarItem/NavbarNavLink';
import NavbarItemOrig from '@theme/NavbarItem';

const NavbarNavLink = NavbarNavLinkOrig as React.ComponentType<any>;
const NavbarItem    = NavbarItemOrig    as React.ComponentType<any>;

export default function DropdownNavbarItemDesktop({
  items,
  position,
  className,
  onClick,
  ...props
}: any) {
  const dropdownRef     = useRef<HTMLDivElement>(null);
  const [showDropdown, setShowDropdown] = useState(false);

  // Close on click / touch outside
  useEffect(() => {
    const close = (e: MouseEvent | TouchEvent) => {
      if (!dropdownRef.current?.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', close);
    document.addEventListener('touchstart', close);
    return () => {
      document.removeEventListener('mousedown', close);
      document.removeEventListener('touchstart', close);
    };
  }, []);

  // Close when a NavbarPicker opens
  useEffect(() => {
    const onOtherOpen = () => setShowDropdown(false);
    window.addEventListener('nf-picker:open', onOtherOpen);
    return () => window.removeEventListener('nf-picker:open', onOtherOpen);
  }, []);

  const handleClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setShowDropdown(prev => !prev);
  }, []);

  return (
    <div
      ref={dropdownRef}
      className={clsx('navbar__item', 'dropdown', {
        'dropdown--right': position === 'right',
        'dropdown--show':  showDropdown,
      })}>
      <NavbarNavLink
        aria-haspopup="true"
        aria-expanded={showDropdown}
        role="button"
        href={props.to ? undefined : '#'}
        className={clsx('navbar__link', className)}
        {...props}
        onClick={props.to ? undefined : handleClick}
        onKeyDown={(e: React.KeyboardEvent) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            setShowDropdown(prev => !prev);
          }
        }}>
        {props.children ?? props.label}
      </NavbarNavLink>
      <ul className="dropdown__menu">
        {items.map((childItemProps: any, i: number) => (
          <NavbarItem
            isDropdownItem
            activeClassName="dropdown__link--active"
            {...childItemProps}
            key={i}
          />
        ))}
      </ul>
    </div>
  );
}
