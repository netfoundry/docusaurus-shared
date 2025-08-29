import React from 'react';
import {useLocation} from '@docusaurus/router';
import NavbarItem from '@theme/NavbarItem';
import SearchBar from '@theme/SearchBar';
import OriginalNavbarContent from '@theme-original/Navbar/Content';
import NavbarLogo from "@theme/Navbar/Logo";
import ColorModeToggle from '@theme/ColorModeToggle';
import {useColorMode, useThemeConfig} from '@docusaurus/theme-common';
import styles from './index.module.css'

type Props = React.ComponentProps<typeof OriginalNavbarContent>;
type Item = any;

// change to '' if you don't use /docs
const DOCS_PREFIX = '/docs';

const unifiedNav: Item[] = [
    // {label: 'NetFoundry', to: '/', position: 'left'},
    // {label: 'Downloads', to: '/downloads', position: 'left'},
    // {label: 'Blog', to: '/blog', position: 'left'},
];

const openZitiNav: Item[] = [
    {
        label: 'OpenZiti Docs',
        position: 'left',
        type: 'dropdown',
        items: [
            {to: `https://support.netfoundry.io/hc/en-us/categories/360000991011-Docs-Guides`, label: 'NetFoundry SaaS'},
            {to: `${DOCS_PREFIX}/frontdoor/intro`, label: 'Frontdoor'},
            {to: `${DOCS_PREFIX}/onprem/intro`, label: 'On-Prem'},
            {to: `${DOCS_PREFIX}/openziti/learn/introduction`, label: 'OpenZiti'},
            {to: `${DOCS_PREFIX}/zlan/learn`, label: 'zLan'},
        ],
    }
];

const onpremNav: Item[] = [
    {
        label: 'On-Prem Docs',
        position: 'left',
        type: 'dropdown',
        items: [
            {to: `https://support.netfoundry.io/hc/en-us/categories/360000991011-Docs-Guides`, label: 'NetFoundry SaaS'},
            {to: `${DOCS_PREFIX}/frontdoor/intro`, label: 'Frontdoor'},
            {to: `${DOCS_PREFIX}/onprem/intro`, label: 'On-Prem'},
            {to: `${DOCS_PREFIX}/openziti/learn/introduction`, label: 'OpenZiti'},
            {to: `${DOCS_PREFIX}/zlan/learn`, label: 'zLan'},
        ],
    },
];

const frontdoorNav: Item[] = [
    {
        label: 'Frontdoor Docs',
        position: 'left',
        type: 'dropdown',
        items: [
            {to: `https://support.netfoundry.io/hc/en-us/categories/360000991011-Docs-Guides`, label: 'NetFoundry SaaS'},
            {to: `${DOCS_PREFIX}/frontdoor/intro`, label: 'Frontdoor'},
            {to: `${DOCS_PREFIX}/onprem/intro`, label: 'On-Prem'},
            {to: `${DOCS_PREFIX}/openziti/learn/introduction`, label: 'OpenZiti'},
            {to: `${DOCS_PREFIX}/zlan/learn`, label: 'zLan'},
        ],
    },
];

const zlanNav: Item[] = [
    {
        label: 'zLan Docs',
        position: 'left',
        type: 'dropdown',
        items: [
            {to: `https://support.netfoundry.io/hc/en-us/categories/360000991011-Docs-Guides`, label: 'NetFoundry SaaS'},
            {to: `${DOCS_PREFIX}/frontdoor/intro`, label: 'Frontdoor'},
            {to: `${DOCS_PREFIX}/onprem/intro`, label: 'On-Prem'},
            {to: `${DOCS_PREFIX}/openziti/learn/introduction`, label: 'OpenZiti'},
            {to: `${DOCS_PREFIX}/zlan/learn`, label: 'zLan'},
        ],
    },
];

const mapNavbar = (p: string): Item[] => {
    if (p.startsWith(`${DOCS_PREFIX}/frontdoor`)) return frontdoorNav;
    if (p.startsWith(`${DOCS_PREFIX}/onprem`))    return onpremNav;
    if (p.startsWith(`${DOCS_PREFIX}/openziti`))  return openZitiNav;
    if (p.startsWith(`${DOCS_PREFIX}/zlan`))  return zlanNav;
    return unifiedNav;
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
    return (
        <div className="navbar__inner">
            <NavbarLogo />
            <div className="navbar__items navbar__items--left">
                {left.map((item, i) => <NavbarItem {...item} key={`l-${i}`} />)}
            </div>
            <div className="navbar__items navbar__items--right">
                {!cmCfg?.disableSwitch && (
                    <ColorModeToggle
                        value={colorMode}
                        onChange={setColorMode}
                    />
                )}
                {right.map((item, i) => <NavbarItem {...item} key={`r-${i}`} />)}
                <SearchBar/>
            </div>
        </div>
    );
}
