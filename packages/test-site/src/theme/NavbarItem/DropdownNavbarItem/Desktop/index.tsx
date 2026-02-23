/**
 * Swizzled DropdownNavbarItemDesktop
 *
 * Replaces the default CSS :hover control (dropdown--hoverable) with
 * JS-driven show/hide so we can add a hide delay. Without the delay, moving
 * the cursor diagonally from the narrow navbar button toward the wide fixed
 * mega menu briefly leaves both elements, firing mouseleave and closing the
 * panel before the cursor arrives.
 *
 * The 200 ms grace period is invisible to the user but long enough to survive
 * any realistic diagonal traversal to the mega menu.
 */
import React, {useState, useRef, useEffect, useCallback} from 'react';
import clsx from 'clsx';
import NavbarNavLinkOrig from '@theme/NavbarItem/NavbarNavLink';
import NavbarItemOrig from '@theme/NavbarItem';

// Cast away the ReactNode return-type mismatch that exists project-wide
// (same issue as meta/index.tsx). Runtime behaviour is unaffected.
const NavbarNavLink = NavbarNavLinkOrig as React.ComponentType<any>;
const NavbarItem = NavbarItemOrig as React.ComponentType<any>;

const HIDE_DELAY_MS = 200;

export default function DropdownNavbarItemDesktop({
  items,
  position,
  className,
  onClick,
  ...props
}: any) {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);

  // Close when clicking outside the dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent | FocusEvent) => {
      if (
        !dropdownRef.current ||
        dropdownRef.current.contains(event.target as Node)
      ) {
        return;
      }
      setShowDropdown(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    document.addEventListener('focusin', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      document.removeEventListener('focusin', handleClickOutside);
    };
  }, []);

  // Cancel any pending hide timer
  const cancelHide = useCallback(() => {
    if (hideTimerRef.current !== null) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
  }, []);

  const handleMouseEnter = useCallback(() => {
    cancelHide();
    setShowDropdown(true);
  }, [cancelHide]);

  const handleMouseLeave = useCallback(() => {
    hideTimerRef.current = setTimeout(() => {
      setShowDropdown(false);
    }, HIDE_DELAY_MS);
  }, []);

  // Clean up timer on unmount
  useEffect(() => () => cancelHide(), [cancelHide]);

  return (
    <div
      ref={dropdownRef}
      // No dropdown--hoverable: visibility is driven entirely by dropdown--show
      // via JS so the hide delay applies consistently.
      className={clsx('navbar__item', 'dropdown', {
        'dropdown--right': position === 'right',
        'dropdown--show': showDropdown,
      })}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}>
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
            setShowDropdown(!showDropdown);
          }
        }}>
        {props.children ?? props.label}
      </NavbarNavLink>
      <ul
        className="dropdown__menu"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}>
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
