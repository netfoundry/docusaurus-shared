import React, {JSX} from 'react';
import {useLocation} from '@docusaurus/router';
import NavbarItem from '@theme/NavbarItem';
import SearchBar from '@theme/SearchBar';
import OriginalNavbarContent from '@theme-original/Navbar/Content';
import NavbarLogo from "@theme/Navbar/Logo";
import ColorModeToggle from '@theme/ColorModeToggle';
import {useColorMode, useThemeConfig} from '@docusaurus/theme-common';
import styles from './index.module.css'

import NavbarMobileSidebarToggle from "@theme/Navbar/MobileSidebar/Toggle";
import {useNavbarMobileSidebar} from "@docusaurus/theme-common/internal";

type Props = React.ComponentProps<typeof OriginalNavbarContent>;
type Item = any;

const DOCS_PREFIX = '/docs';

const productPicker: Item = { type: 'custom-productPicker', position: 'left' };

const sectionLabel = (p: string): string => {
    if (p.startsWith(`${DOCS_PREFIX}/frontdoor`))  return 'Frontdoor';
    if (p.startsWith(`${DOCS_PREFIX}/selfhosted`)) return 'Self-Hosted';
    if (p.startsWith(`${DOCS_PREFIX}/openziti`))   return 'OpenZiti';
    if (p.startsWith(`${DOCS_PREFIX}/zlan`))        return 'zLAN';
    if (p.startsWith(`${DOCS_PREFIX}/zrok`))        return 'zrok';
    return 'Products';
};

const mapNavbar = (p: string): Item[] => {
    return [{...productPicker, label: sectionLabel(p)}];
};

export default function NavbarContent(props: Props): JSX.Element {
    const {pathname} = useLocation();
    const {colorMode, setColorMode} = useColorMode();
    const {colorMode: cmCfg} = useThemeConfig();
    if (pathname.startsWith(`${DOCS_PREFIX}/orig`)) {
        return <OriginalNavbarContent {...props} />;
    }
    const items = mapNavbar(pathname);
    const left = items.filter((i) => i.position !== 'right');
    const right = items.filter((i) => i.position === 'right');

    const mobileSidebar = useNavbarMobileSidebar();

    return (
        <div className="navbar__inner">
            <div className="navbar__items">
                {!mobileSidebar.disabled && <NavbarMobileSidebarToggle />}
                <NavbarLogo />
                {left.map((item, i) => (
                    <NavbarItem {...item} key={`l-${i}`} />
                ))}
            </div>
            <div className="navbar__items navbar__items--right">
                {!cmCfg?.disableSwitch && (
                    <ColorModeToggle value={colorMode} onChange={setColorMode} />
                )}
                {right.map((item, i) => (
                    <NavbarItem {...item} key={`r-${i}`} />
                ))}
                <SearchBar />
            </div>
        </div>
    );
}
