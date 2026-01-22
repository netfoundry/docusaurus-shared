export type NavbarItem = {
    label: string;
    href?: string;
    to?: string;
    type?: string;
    position?: 'left' | 'right';
    sidebarId?: string;
};

export const NavbarItems: NavbarItem[] = [
    {
        type: 'docSidebar',
        sidebarId: 'tutorialSidebar',
        position: 'left',
        label: 'Docs',
    },
    {
        href: 'https://github.com/facebook/docusaurus',
        label: 'GitHub',
        position: 'right',
    },
];