/**
 * Swizzled DropdownNavbarItemDesktop
 *
 * Opens on hover.  The panel stays open until the user actually moves their
 * cursor into it — so the gap between the trigger and the fixed panel never
 * causes a flicker.  Once the cursor has entered the panel, leaving it
 * (or clicking outside) closes it normally.
 */
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
  const hasEnteredPanel = useRef(false);
  const [showDropdown, setShowDropdown] = useState(false);

  // Close on click / touch outside
  useEffect(() => {
    const close = (e: MouseEvent | TouchEvent) => {
      if (!dropdownRef.current?.contains(e.target as Node)) {
        setShowDropdown(false);
        hasEnteredPanel.current = false;
      }
    };
    document.addEventListener('mousedown', close);
    document.addEventListener('touchstart', close);
    return () => {
      document.removeEventListener('mousedown', close);
      document.removeEventListener('touchstart', close);
    };
  }, []);

  // Sync: close other open megamenus when this one opens
  useEffect(() => {
    const onOtherOpen = (e: any) => {
      if (e.detail.label !== props.label) {
        setShowDropdown(false);
        hasEnteredPanel.current = false;
      }
    };
    window.addEventListener('nf-megamenu:open', onOtherOpen);
    return () => window.removeEventListener('nf-megamenu:open', onOtherOpen);
  }, [props.label]);

  // Open on hover — reset entry state each time
  const handleMouseEnter = useCallback(() => {
    hasEnteredPanel.current = false;
    window.dispatchEvent(new CustomEvent('nf-megamenu:open', {detail: {label: props.label}}));
    setShowDropdown(true);
    console.log('[mega-menu] popped open:', props.label);
  }, [props.label]);

  // Leaving the trigger: do nothing — the panel stays open until the user
  // either enters it (then leaves) or clicks outside.
  const handleTriggerLeave = useCallback(() => {
    console.log('[mega-menu] trigger leave — hasEnteredPanel:', hasEnteredPanel.current);
  }, []);

  // Once the cursor enters the panel, normal leave/blur can close it
  const handlePanelEnter = useCallback(() => {
    hasEnteredPanel.current = true;
    console.log('[mega-menu] panel focus obtained');
  }, []);

  const handlePanelLeave = useCallback(() => {
    console.log('[mega-menu] panel focus lost — hasEnteredPanel:', hasEnteredPanel.current);
    if (hasEnteredPanel.current) {
      setShowDropdown(false);
      hasEnteredPanel.current = false;
      console.log('[mega-menu] closing — cursor left panel');
    }
  }, []);

  return (
    <div
      ref={dropdownRef}
      className={clsx('navbar__item', 'dropdown', {
        'dropdown--right': position === 'right',
        'dropdown--show':  showDropdown,
      })}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleTriggerLeave}>
      <NavbarNavLink
        aria-haspopup="true"
        aria-expanded={showDropdown}
        role="button"
        href={props.to ? undefined : '#'}
        className={clsx('navbar__link', className)}
        {...props}
        onClick={props.to ? undefined : (e: React.MouseEvent) => e.preventDefault()}
        onKeyDown={(e: React.KeyboardEvent) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            setShowDropdown(prev => !prev);
          }
        }}>
        {props.children ?? props.label}
      </NavbarNavLink>
      <ul
        className="dropdown__menu"
        onMouseEnter={handlePanelEnter}
        onMouseLeave={handlePanelLeave}>
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
