import React, {useState, useEffect, ReactNode, JSX} from 'react';
import OriginalTabs from '@theme/Tabs';
import { osName } from 'react-device-detect';
import type { ComponentProps } from 'react';


export type OsTabsProps = ComponentProps<typeof OriginalTabs>;

export function OsTabs(props: OsTabsProps): JSX.Element {
    const [defaultValue, setDefaultValue] = useState<string | null>(null);

    useEffect(() => {
        const tabs = ['iOS', 'Android', 'Mac OS', 'Windows', 'Linux'];
        if (tabs.includes(osName)) {
            setDefaultValue(osName);
        } else {
            setDefaultValue('Windows');
        }
    }, []);

    return (
        <>
            <OriginalTabs {...props} defaultValue={defaultValue}>
                {props.children}
            </OriginalTabs>
            {/* Uncomment the following line to debug the detected and selected values */}
            {/* <h2>detected={osName}, selected={defaultValue}</h2> */}
        </>
    );
}