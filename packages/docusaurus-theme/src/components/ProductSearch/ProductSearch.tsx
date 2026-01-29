// src/components/ProductSearch/ProductSearch.tsx
import React, { useEffect, useMemo, useState } from "react";
import {
    InstantSearch,
    SearchBox,
    Pagination,
    Snippet,
    Configure,
    Stats,
    PoweredBy,
    useHits,
    useConfigure,
    useSearchBox,
} from "react-instantsearch";
import { history } from "instantsearch.js/es/lib/routers";
import { singleIndex } from "instantsearch.js/es/lib/stateMappings";
import { liteClient as algoliasearch } from "algoliasearch/lite";
import styles from "./ProductSearch.module.css";
import clsx from "clsx";

type HitRec = {
    url?: string | string[];
    url_without_anchor?: string;
    url_without_variables?: string;
    anchor?: string;
    hierarchy?: { lvl0?: string; lvl1?: string; lvl2?: string };
    product?: string;
    content?: string;
    title?: string;
};

export type ProductSearchProps = {
    appId: string;
    apiKey: string;
    indexName: string;
    products?: string[];
    extraContainerClasses?: string[];
};

function getUrl(h: HitRec): string {
    return toRelative(
        ((typeof h.url === "string" && h.url) ||
            (Array.isArray(h.url) && h.url[0]) ||
            h.url_without_anchor ||
            h.url_without_variables ||
            "#") + (h.anchor ? `#${h.anchor}` : "")
    );
}
function toRelative(href: string): string {
    try {
        const u = new URL(href, typeof window !== "undefined" ? window.location.origin : "http://localhost");
        return u.pathname + u.search + u.hash;
    } catch {
        return href.startsWith("/") ? href : `/${href}`;
    }
}
function shortUrl(h: HitRec): string {
    return toRelative(getUrl(h));
}
function titleFrom(h: HitRec): string {
    return (
        h.title ||
        h.hierarchy?.lvl2 ||
        h.hierarchy?.lvl1 ||
        h.hierarchy?.lvl0 ||
        shortUrl(h)
    );
}
function ProductBadge({ p }: { p?: string }) {
    return p ? (
        <span className={`${styles.badge} ${styles[`p_${p}`]}`}>{p}</span>
    ) : null;
}

/** Configure-based filter (no remount, reliable) */
function ProductFilter({ product }: { product: string }) {
    useConfigure({
        facetFilters: product ? [[`docusaurus_tag:docs-${product}-current`]] : [],
    });
    return null;
}

/** Group by section (lvl0), then by page (no duplicate "Learn") */
function GroupedHits() {
    const { hits } = useHits<HitRec>();
    const sections = new Map<
        string,
        Map<string, { header: string; url: string; lvl0?: string; items: HitRec[] }>
    >();

    for (const h of hits) {
        const lvl0 = h.hierarchy?.lvl0 || "Other";
        const page =
            h.url_without_anchor ||
            (typeof h.url === "string" ? h.url.split("#")[0] : "") ||
            "";

        const byPage = sections.get(lvl0) || new Map();
        const g =
            byPage.get(page) ||
            { header: titleFrom(h), url: page || getUrl(h), lvl0, items: [] };

        g.items.push(h);
        byPage.set(page, g);
        sections.set(lvl0, byPage);
    }

    return (
        <div className={styles.groupList}>
            {[...sections.entries()].map(([lvl0, byPage]) => (
                <div key={lvl0} className={styles.section}>
                    <div className={styles.sectionHeader}>{lvl0}</div>
                    {[...byPage.values()].map((g) => (
                        <div key={g.url} className={styles.group}>
                            <div className={styles.groupHeaderRow}>
                                <a href={toRelative(g.url)} className={styles.groupHeader}>
                                    {g.header}
                                </a>
                                <ProductBadge p={g.items[0].product} />
                            </div>
                            <div className={styles.groupSnips}>
                                {g.items.slice(0, 3).map((h, i) => (
                                    <div key={i} className={styles.snippet}>
                                        <Snippet attribute="content" hit={h as any} />
                                    </div>
                                ))}
                            </div>
                            <div className={styles.groupUrl}>
                                <a href={getUrl(g.items[0])}>{shortUrl(g.items[0])}</a>
                            </div>
                        </div>
                    ))}
                </div>
            ))}
        </div>
    );
}

function QueryWatcher({ onChange }: { onChange: (ok: boolean) => void }) {
    const { query } = useSearchBox();
    useEffect(() => onChange(query.trim().length >= 2), [query, onChange]);
    return null;
}

export function ProductSearch({
    appId,
    apiKey,
    indexName,
    products = ["frontdoor", "openziti", "onprem", "zlan", "zrok"],
    extraContainerClasses = [],
}: ProductSearchProps) {
    // read initial pill from ?product= for back/forward + shareable URLs
    const [product, setProduct] = useState<string>("");
    const [searchLongEnough, setSearchLongEnough] = useState<boolean>(false);

    useEffect(() => {
        if (typeof window === "undefined") return;
        const p = new URLSearchParams(window.location.search).get("product") || "";
        setProduct(p);
    }, []);
    useEffect(() => {
        if (typeof window === "undefined") return;
        const u = new URL(window.location.href);
        if (product) u.searchParams.set("product", product);
        else u.searchParams.delete("product");
        window.history.replaceState({}, "", u);
    }, [product]);

    const base = useMemo(() => algoliasearch(appId, apiKey), [appId, apiKey]);

    // Gate only when no query AND no pill active (prevents "freeze" on pill-only)
    const searchClient = useMemo(
        () => ({
            ...base,
            search(requests: any[]) {
                const allShort = requests.every(
                    (r: any) => (r.params?.query ?? "").length < 2
                );
                if (allShort) { // block ALL searches until query >= 2
                    return Promise.resolve({
                        results: requests.map(() => ({
                            hits: [],
                            nbHits: 0,
                            page: 0,
                            nbPages: 0,
                            processingTimeMS: 0,
                            params: "",
                            query: "",
                            exhaustiveNbHits: false,
                        })),
                    });
                }
                return (base as any).search(requests);
            },
        }),
        [base, product]
    );

    return (
        <div className={styles.wrap}>
            <InstantSearch
                searchClient={searchClient}
                indexName={indexName}
                routing={{
                    router: history({ writeDelay: 300 }),
                    stateMapping: singleIndex(indexName) as any,
                }}
            >
                <QueryWatcher onChange={setSearchLongEnough} />
                <div className={styles.topbar}>
                    <SearchBox
                        onKeyUp={(e) => {
                            setSearchLongEnough((e.target as HTMLInputElement).value.length > 1);
                        }}
                        autoFocus
                        classNames={{ input: styles.searchInput }}
                        placeholder="Enter your search criteria here"
                    />
                    <div className={styles.pills}>
                        <button
                            className={`${styles.pill} ${!product ? styles.active : ""}`}
                            onClick={() => searchLongEnough && setProduct("")}
                            disabled={!searchLongEnough}
                        >
                            All
                        </button>
                        {products.map((p) => (
                            <button
                                key={p}
                                className={`${styles.pill} ${product === p ? styles.active : ""}`}
                                onClick={() => searchLongEnough && setProduct(p)}
                                disabled={!searchLongEnough}
                            >
                                {p}
                            </button>
                        ))}
                    </div>
                </div>

                {/* static config */}
                <Configure
                    hitsPerPage={20}
                    attributesToRetrieve={[
                        "url",
                        "url_without_anchor",
                        "url_without_variables",
                        "anchor",
                        "hierarchy",
                        "product",
                        "content",
                        "title",
                    ]}
                    attributesToHighlight={[
                        "title",
                        "hierarchy.lvl1",
                        "hierarchy.lvl2",
                        "content",
                    ]}
                    attributesToSnippet={["content:15"]}
                    snippetEllipsisText="..."
                    distinct
                />

                {searchLongEnough && <ProductFilter product={product} />}

                <div className={clsx(styles.container, extraContainerClasses)}>
                    <div className={styles.results}>
                        <div className={styles.meta}>
                            <Stats />
                        </div>
                        <div className={styles.grid}>
                            <GroupedHits />
                        </div>
                        <Pagination
                            showFirst={false}
                            showLast={false}
                            classNames={{
                                root: styles.pagination,
                                list: styles.pageList,
                                item: styles.pageItem,
                                selectedItem: styles.pageItemSelected,
                                disabledItem: styles.pageItemDisabled,
                                link: styles.pageLink,
                            }}
                        />
                    </div>
                    <div className={styles.footer}>
                        <div className={styles.kbdRow}>
                          <span>
                            <kbd>Enter</kbd> open
                          </span>
                          <span>
                            <kbd>Up</kbd>
                            <kbd>Down</kbd> navigate
                          </span>
                          <span>
                            <kbd>esc</kbd> close
                          </span>
                        </div>
                        <PoweredBy />
                    </div>
                </div>
            </InstantSearch>
        </div>
    );
}
