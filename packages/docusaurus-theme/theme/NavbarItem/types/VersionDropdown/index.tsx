import React from 'react';
import {useLocation} from 'react-router-dom';
import {useVersions, useActiveDocContext} from '@docusaurus/plugin-content-docs/client';
import NavbarItemOrig from '@theme/NavbarItem';

const NavbarItem = NavbarItemOrig as React.ComponentType<any>;

type Props = {
    pathPrefix: string;
    docsPluginId: string;
    position?: 'left' | 'right';
    versionOrder?: Record<string, number>;
};

export default function VersionDropdown({pathPrefix, docsPluginId, position, versionOrder}: Props) {
    const {pathname} = useLocation();
    const versions = useVersions(docsPluginId);
    const activeDocContext = useActiveDocContext(docsPluginId);

    if (!pathname.startsWith(pathPrefix)) return null;

    const sorted = versionOrder
        ? [...versions].sort((a, b) => (versionOrder[a.name] ?? 999) - (versionOrder[b.name] ?? 999))
        : versions;

    const items = sorted.map((version) => {
        const altPath = activeDocContext?.alternateDocVersions?.[version.name]?.path;
        const mainDoc = version.docs.find((d) => d.id === version.mainDocId) ?? version.docs[0];
        return {label: version.label, to: altPath ?? mainDoc?.path ?? version.path};
    });

    const label = activeDocContext?.activeVersion?.label ?? 'Version';

    return <NavbarItem type="dropdown" label={label} items={items} position={position} className="nf-picker-trigger" />;
}
