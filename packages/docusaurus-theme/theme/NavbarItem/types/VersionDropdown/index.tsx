import React from 'react';
import {useLocation} from 'react-router-dom';
import NavbarItemOrig from '@theme/NavbarItem';

const NavbarItem = NavbarItemOrig as React.ComponentType<any>;

type Props = {
  pathPrefix: string;
  docsPluginId: string;
  position?: 'left' | 'right';
};

export default function VersionDropdown({pathPrefix, docsPluginId, position}: Props) {
  const {pathname} = useLocation();
  if (!pathname.startsWith(pathPrefix)) return null;
  return <NavbarItem type="docsVersionDropdown" docsPluginId={docsPluginId} position={position} dropdownItemsBefore={[]} dropdownItemsAfter={[]} className="nf-picker-trigger" />;
}
