// src/theme/SearchBar/index.tsx
import React, {useEffect, useState} from "react";
import ReactDOM from "react-dom";
import {DocSearchButton, DocSearchModal} from "@docsearch/react";

import ProductSearch from "@site/src/components/ProductSearch";
import {appId,apiKey,indexName} from "../../consts"
import styles from "./SearchBar.module.css";
import clsx from "clsx";

export default function SearchBar() {
    const [open, setOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setOpen(true); }
            if (e.key === "Escape") setOpen(false);
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, []);
    useEffect(() => { document.body.style.overflow = open ? "hidden" : ""; }, [open]);

    return (
        <>
            <DocSearchButton onClick={() => setOpen(true)} />
            {mounted && open && ReactDOM.createPortal(
                <div className={styles.backdrop} onClick={() => setOpen(false)}>
                    <div style={{background: "var(--ifm-background-color)", "padding": "10px", borderRadius: "10px"}}>
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
