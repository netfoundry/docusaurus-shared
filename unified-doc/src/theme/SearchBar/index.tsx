// src/theme/SearchBar/index.tsx
//
// Site-level SearchBar override. A site `src/theme/` override beats every theme,
// so this unambiguously wins over @docusaurus/theme-search-algolia's stock
// DocSearch SearchBar (which would otherwise shadow the NetFoundry theme's own
// ProductSearch because theme-search-algolia is loaded last in `themes`).
//
// Renders the custom ProductSearch (react-instantsearch) modal, identical to
// what packages/test-site uses, so prod and the test-site run the same search.
import React, {useEffect, useState} from "react";
import ReactDOM from "react-dom";
import {DocSearchButton} from "@docsearch/react";
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';

import { ProductSearch } from '@netfoundry/docusaurus-theme/ui';
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

    const { customFields } = useDocusaurusContext().siteConfig;

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
                                appId={customFields.ALGOLIA_APPID as string}
                                apiKey={customFields.ALGOLIA_APIKEY as string}
                                indexName={customFields.ALGOLIA_INDEXNAME as string}
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
