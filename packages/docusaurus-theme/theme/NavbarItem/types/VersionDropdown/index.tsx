import React from 'react';
import {useLocation} from 'react-router-dom';
import {useVersions, useActiveDocContext} from '@docusaurus/plugin-content-docs/client';
import NavbarItemOrig from '@theme/NavbarItem';

const NavbarItem = NavbarItemOrig as React.ComponentType<any>;

const BANNER_ORDER: Record<string, number> = {unreleased: 0, none: 1, unmaintained: 2};

type Props = {
    pathPrefix: string;
    docsPluginId: string;
    position?: 'left' | 'right';
};

export default function VersionDropdown({pathPrefix, docsPluginId, position}: Props) {
    const {pathname} = useLocation();
    const versions = useVersions(docsPluginId);
    const activeDocContext = useActiveDocContext(docsPluginId);

    if (!pathname.startsWith(pathPrefix)) return null;

    const sorted = [...versions].sort(
        (a, b) => (BANNER_ORDER[a.banner ?? 'none'] ?? 1) - (BANNER_ORDER[b.banner ?? 'none'] ?? 1)
    );

    const items = sorted.map((version) => {
        const doc = version.docs.find((d) => d.id === version.mainDocId) ?? version.docs[0];
        return {label: version.label, to: doc?.path ?? version.path, autoAddBaseUrl: false};
    });

    const label = activeDocContext?.activeVersion?.label ?? 'Version';

    return <NavbarItem type="dropdown" label={label} items={items} position={position} className="nf-picker-trigger" />;
}
