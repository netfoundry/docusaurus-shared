// src/theme/SearchBar/index.tsx
import React, {useEffect, useState} from "react";
import ReactDOM from "react-dom";
import {DocSearchButton} from "@docsearch/react";
import {useLocation} from '@docusaurus/router';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';

import { ProductSearch } from '@netfoundry/docusaurus-theme/ui';
import styles from "./SearchBar.module.css";
import clsx from "clsx";

// Scalar API reference routes — Ctrl+K belongs to Scalar on these pages.
const isScalarPage = (pathname: string) =>
    /\/(api-reference|openapi-reference)$/.test(pathname);

export default function SearchBar() {
    const [open, setOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [mouseDownTarget, setMouseDownTarget] = useState<EventTarget | null>(null);
    const { pathname } = useLocation();
    const onApiPage = isScalarPage(pathname);

    useEffect(() => setMounted(true), []);
    useEffect(() => {
        if (onApiPage) return;
        const onKey = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
                e.preventDefault();
                setOpen(true);
            }
            if (e.key === "Escape") setOpen(false);
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [onApiPage]);
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
                                appId={customFields.ALGOLIA_APPID}
                                apiKey={customFields.ALGOLIA_APIKEY}
                                indexName={customFields.ALGOLIA_INDEXNAME}
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