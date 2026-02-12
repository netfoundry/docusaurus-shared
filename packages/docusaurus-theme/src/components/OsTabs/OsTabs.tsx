import React, {useState, useEffect, ReactNode, JSX} from 'react';
import OriginalTabs from '@theme/Tabs';
import { osName } from 'react-device-detect';
import type { ComponentProps } from 'react';


export type OsTabsProps = ComponentProps<typeof OriginalTabs>;

export function OsTabs(props: OsTabsProps): JSX.Element {
    const [defaultValue, setDefaultValue] = useState<string | null>(null);

    useEffect(() => {
        const knownOs = ['iOS', 'Android', 'Mac OS', 'Windows', 'Linux'];
        const preferred = knownOs.includes(osName) ? osName : 'Windows';

        // Validate preferred value against available tabs to prevent crash
        // when a page provides a subset of tabs (e.g. only Linux + Docker)
        const available = props.values?.map(v =>
            typeof v === 'string' ? v : v.value
        );

        if (available && available.length > 0 && !available.includes(preferred)) {
            setDefaultValue(available[0]);
        } else {
            setDefaultValue(preferred);
        }
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <OriginalTabs {...props} defaultValue={defaultValue ?? undefined}>
            {props.children}
        </OriginalTabs>
    );
}