import React from 'react';
import OriginalNavbar from '@theme-original/Navbar';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';

export default function NavbarWrapper(props) {
    const { siteConfig } = useDocusaurusContext();
    const navbar = siteConfig.themeConfig?.navbar;

    // Clone existing items and add your own dynamically
    const newItems = [
        ...navbar.items,
        { label: 'Dynamic', to: '/dynamic', position: 'left' },
    ];

    const newNavbar = { ...navbar, items: newItems };

    return <OriginalNavbar {...props} navbar={newNavbar} />;
}
