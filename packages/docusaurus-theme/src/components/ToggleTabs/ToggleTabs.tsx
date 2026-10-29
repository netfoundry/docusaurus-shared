import React, { JSX, ReactNode, useId } from 'react';
import Tabs from '@theme/Tabs';
import { useStorageSlot } from '@docusaurus/theme-common';
import styles from './ToggleTabs.module.css';

export interface ToggleTabsOption {
    value: string;
    label: ReactNode;
}

export interface ToggleTabsProps {
    /** Tabs group. Every ToggleTabs and Tabs with this groupId switches together, on this page and later ones. */
    groupId: string;
    /** One option per TabItem value. The first is the default. */
    options: ToggleTabsOption[];
    /** Text in front of the options, e.g. "Showing steps as:". */
    label: ReactNode;
    children: ReactNode;
}

// Docusaurus keeps a Tabs group's choice in this storage slot. Writing it switches every tab in the group.
function Toggle({ groupId, options, label }: Omit<ToggleTabsProps, 'children'>): JSX.Element {
    const [value, slot] = useStorageSlot(`docusaurus.tab.${groupId}`);
    const current = value ?? options[0]?.value;
    const labelId = useId();
    return (
        <div className={styles.toggle} role="group" aria-labelledby={labelId}>
            <span id={labelId} className={styles.label}>{label}</span>
            {options.map((o) => (
                <button
                    key={o.value}
                    type="button"
                    className={o.value === current ? `${styles.option} ${styles.active}` : styles.option}
                    aria-pressed={o.value === current}
                    onClick={() => slot.set(o.value)}>
                    {o.label}
                </button>
            ))}
        </div>
    );
}

// Tabs in a framed panel, switched by a labeled toggle across the top instead of the tab buttons, which are hidden.
export function ToggleTabs({ children, ...toggle }: ToggleTabsProps): JSX.Element {
    return (
        <div className={styles.tabs}>
            <Toggle {...toggle} />
            <Tabs groupId={toggle.groupId}>{children}</Tabs>
        </div>
    );
}
