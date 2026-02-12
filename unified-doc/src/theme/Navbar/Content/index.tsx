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

// change to '' if you don't use /docs
const DOCS_PREFIX = '/docs';

const defaultItems: Item[] = [
    // {label: 'NetFoundry', to: '/', position: 'left'},
    // {label: 'Downloads', to: '/downloads', position: 'left'},
    // {label: 'Blog', to: '/blog', position: 'left'},
];

const netfoundryDocs = {to: `https://support.netfoundry.io/hc/en-us/categories/360000991011-Docs-Guides`, label: 'NetFoundry SaaS'};
const nfFrontDoorDocs = {to: `${DOCS_PREFIX}/frontdoor/intro`, label: 'Frontdoor'};
const selfHostedDocs = {to: `${DOCS_PREFIX}/selfhosted/intro`, label: 'Self-Hosted'};
const zlanDocs = {to: `${DOCS_PREFIX}/zlan/intro`, label: 'zLAN'};
const ozDocs =  {to: `${DOCS_PREFIX}/openziti/learn/introduction`, label: 'OpenZiti'};
const zrokDocs = {to: `${DOCS_PREFIX}/zrok/getting-started`, label: 'zrok'};

const openZitiNav: Item[] = [
    {
        label: 'OpenZiti Docs',
        to: `${DOCS_PREFIX}/openziti/learn/introduction`,
        position: 'left',
        type: 'dropdown',
        items: [
            netfoundryDocs,
            nfFrontDoorDocs,
            selfHostedDocs,
            zlanDocs,
            zrokDocs,
        ],
    }
];

const selfhostedNav: Item[] = [
    {
        label: 'Self-Hosted Docs',
        to: `${DOCS_PREFIX}/selfhosted/intro`,
        position: 'left',
        type: 'dropdown',
        items: [
            netfoundryDocs,
            nfFrontDoorDocs,
            ozDocs,
            zlanDocs,
            zrokDocs,
        ],
    },
];

const frontdoorNav: Item[] = [
    {
        label: 'Frontdoor Docs',
        to: `${DOCS_PREFIX}/frontdoor/intro`,
        position: 'left',
        type: 'dropdown',
        items: [
            netfoundryDocs,
            selfHostedDocs,
            ozDocs,
            zlanDocs,
            zrokDocs,
        ],
    },
];

const zlanNav: Item[] = [
    {
        label: 'zLAN Docs',
        to: `${DOCS_PREFIX}/zlan/intro`,
        position: 'left',
        type: 'dropdown',
        items: [
            netfoundryDocs,
            nfFrontDoorDocs,
            selfHostedDocs,
            ozDocs,
            zrokDocs,
        ],
    },
];

const zrokNav: Item[] = [
    {
        label: 'zrok Docs',
        to: `${DOCS_PREFIX}/zrok/getting-started`,
        position: 'left',
        type: 'dropdown',
        items: [
            netfoundryDocs,
            nfFrontDoorDocs,
            selfHostedDocs,
            ozDocs,
            zlanDocs,
        ],
    },
    {
        type: 'docsVersionDropdown',
        docsPluginId: 'zrok',
        dropdownItemsBefore: [],
        dropdownItemsAfter: [],
    },
];

const mapNavbar = (p: string): Item[] => {
    if (p.startsWith(`${DOCS_PREFIX}/frontdoor`)) return frontdoorNav;
    if (p.startsWith(`${DOCS_PREFIX}/selfhosted`)) return selfhostedNav;
    if (p.startsWith(`${DOCS_PREFIX}/openziti`))  return openZitiNav;
    if (p.startsWith(`${DOCS_PREFIX}/zlan`))  return zlanNav;
    if (p.startsWith(`${DOCS_PREFIX}/zrok`))  return zrokNav;
    return defaultItems;
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
