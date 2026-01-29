// theme/SearchBar/index.tsx
import React, {useEffect, useState} from "react";
import ReactDOM from "react-dom";
import {DocSearchButton} from "@docsearch/react";
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';

import {ProductSearch} from "../../src/components/ProductSearch";
import styles from "./SearchBar.module.css";
import clsx from "clsx";

export default function SearchBar() {
    const [open, setOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [mouseDownTarget, setMouseDownTarget] = useState<EventTarget | null>(null);

    useEffect(() => setMounted(true), []);
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
                e.preventDefault();
                setOpen(true);
            }
            if (e.key === "Escape") setOpen(false);
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, []);
    useEffect(() => { document.body.style.overflow = open ? "hidden" : ""; }, [open]);

    const { siteConfig } = useDocusaurusContext();
    const { customFields, themeConfig } = siteConfig;

    // NetFoundry Algolia defaults
    const DEFAULT_APPID = 'UWUTF7ESUI';
    const DEFAULT_APIKEY = '3a4a0691d0e8e3bb7c27c702c6a86ea9';
    const DEFAULT_INDEXNAME = 'nfdocs';

    // Get Algolia config from customFields or themeConfig.algolia, with defaults
    const algoliaConfig = (themeConfig as any)?.algolia || {};
    const appId = (customFields?.ALGOLIA_APPID as string) || algoliaConfig.appId || DEFAULT_APPID;
    const apiKey = (customFields?.ALGOLIA_APIKEY as string) || algoliaConfig.apiKey || DEFAULT_APIKEY;
    const indexName = (customFields?.ALGOLIA_INDEXNAME as string) || algoliaConfig.indexName || DEFAULT_INDEXNAME;

    if (!appId || !apiKey || !indexName) {
        // Fall back to default DocSearch if no valid config
        return null;
    }

    return (
        <>
            <DocSearchButton onClick={() => setOpen(true)} />
            {mounted && open && ReactDOM.createPortal(
                <div
                    className={styles.backdrop}
                    onMouseDown={(e) => setMouseDownTarget(e.target)}
                    onMouseUp={(e) => {
                        if (e.target === mouseDownTarget && e.target === e.currentTarget) {
                            setOpen(false);
                        }
                    }}
                >
                    <div className={styles.searchModal} onClick={(e) => e.stopPropagation()}>
                        <div className={clsx(styles.modal)} onClick={(e) => e.stopPropagation()}>
                            <ProductSearch
                                appId={appId}
                                apiKey={apiKey}
                                indexName={indexName}
                                extraContainerClasses={[styles.modalSearchContainer]}
                            />
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </>
    );
}
