// src/theme/DocSearch/index.tsx
import React, { useMemo, useState, useEffect } from "react";
import OriginalDocSearch from "@theme-original/DocSearch";
import type { Props } from "@theme/DocSearch";
import { createPortal } from "react-dom";
import styles from "./styles.module.css";

const PRODUCTS = ["frontdoor", "openziti", "selfhosted", "zlan"] as const;

function Pills({
                   product,
                   setProduct,
               }: {
    product: string;
    setProduct: (v: string) => void;
}) {
    const [host, setHost] = useState<HTMLElement | null>(null);

    useEffect(() => {
        const el =
            document.querySelector(".DocSearch-Modal .DocSearch-Form")?.parentElement ??
            null;
        setHost(el || null);
    }, []);

    if (!host) return null;

    return createPortal(
        <div className={styles.pills}>
            <button
                type="button"
                className={`${styles.pill} ${!product ? styles.active : ""}`}
                onClick={() => setProduct("")}
            >
                All
            </button>
            {PRODUCTS.map((p) => (
                <button
                    key={p}
                    type="button"
                    className={`${styles.pill} ${product === p ? styles.active : ""}`}
                    onClick={() => setProduct(p)}
                >
                    {p}
                </button>
            ))}
        </div>,
        host
    );
}

export default function DocSearchWrapper(props: Props) {
    const [product, setProduct] = useState<string>("");

    const transformSearchParameters = useMemo(
        () =>
            (params: any) => ({
                ...params,
                facetFilters: [
                    ...(params.facetFilters ?? []),
                    ...(product ? [`product:${product}`] : []),
                ],
            }),
        [product]
    );

    return (
        <>
            <OriginalDocSearch
                {...props}
                transformSearchParameters={transformSearchParameters}
            />
            <Pills product={product} setProduct={setProduct} />
            {/* "Search by Algolia" is already shown in the modal footer */}
        </>
    );
}
