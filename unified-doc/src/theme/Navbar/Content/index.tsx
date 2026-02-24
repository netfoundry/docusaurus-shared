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

const productPicker: Item = {
    type: 'custom-productPicker',
    position: 'left',
    label: 'Products',
    columns: [
        {
            header: 'Managed Cloud',
            headerClass: 'picker-header--managed',
            links: [
                { label: 'NetFoundry Console', to: '#', logo: 'https://raw.githubusercontent.com/netfoundry/branding/refs/heads/main/images/svg/icon/netfoundry-icon-color.svg', description: 'Cloud-managed orchestration and global fabric control.' },
                { label: 'Frontdoor', to: `${DOCS_PREFIX}/frontdoor/intro`, logo: '/docs/img/frontdoor-sm-logo.svg', description: 'Secure application access gateway.' },
            ],
        },
        {
            header: 'Open Source',
            headerClass: 'picker-header--opensource',
            links: [
                { label: 'OpenZiti', to: `${DOCS_PREFIX}/openziti/learn/introduction`, logo: '/docs/img/openziti-sm-logo.svg', description: 'Programmable zero-trust mesh infrastructure.' },
                { label: 'zrok', to: `${DOCS_PREFIX}/zrok/getting-started`, logo: '/docs/img/zrok-1.0.0-rocket-purple.svg', logoDark: '/docs/img/zrok-1.0.0-rocket-green.svg', description: 'Secure peer-to-peer sharing built on OpenZiti.' },
            ],
        },
        {
            header: 'Your own infrastructure',
            headerClass: 'picker-header--infra',
            links: [
                { label: 'Self-Hosted', to: `${DOCS_PREFIX}/selfhosted/intro`, logo: '/docs/img/onprem-sm-logo.svg', description: 'Deploy the full stack in your own environment.' },
                { label: 'zLAN', to: `${DOCS_PREFIX}/zlan/intro`, logo: '/docs/img/zlan-logo.svg', description: 'Zero-trust access for OT networks.' },
            ],
        },
    ],
};

const defaultItems: Item[] = [
    // {label: 'NetFoundry', to: '/', position: 'left'},
    // {label: 'Downloads', to: '/downloads', position: 'left'},
    // {label: 'Blog', to: '/blog', position: 'left'},
];

const netfoundryDocs = {to: `https://support.netfoundry.io/hc/en-us/categories/360000991011-Docs-Guides`, label: 'NetFoundry SaaS'};
const nfFrontDoorDocs = {to: `${DOCS_PREFIX}/frontdoor/intro`, label: 'Frontdoor'};
const onPremDocs = {to: `${DOCS_PREFIX}/selfhosted/intro`, label: 'Self-Hosted'};
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
            onPremDocs,
            zlanDocs,
            zrokDocs,
        ],
    }
];

const onpremNav: Item[] = [
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
            onPremDocs,
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
            onPremDocs,
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
            onPremDocs,
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
    let items: Item[] = [];
    if (p.startsWith(`${DOCS_PREFIX}/frontdoor`)) items = frontdoorNav;
    else if (p.startsWith(`${DOCS_PREFIX}/selfhosted`)) items = onpremNav;
    else if (p.startsWith(`${DOCS_PREFIX}/openziti`))  items = openZitiNav;
    else if (p.startsWith(`${DOCS_PREFIX}/zlan`))  items = zlanNav;
    else if (p.startsWith(`${DOCS_PREFIX}/zrok`))  items = zrokNav;
    else items = defaultItems;
    return [productPicker, ...items];
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
