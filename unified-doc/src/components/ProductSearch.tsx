// src/components/ProductSearch.tsx
import React, { useMemo, useState } from "react";
import {
    InstantSearch,
    SearchBox,
    Pagination,
    Snippet,
    Configure,
    Stats,
    PoweredBy,
    ClearRefinements,
    useHits,
    useConfigure,
} from "react-instantsearch";
import { liteClient as algoliasearch } from "algoliasearch/lite";
import styles from "./ProductSearch.module.css";

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

type Props = {
    appId: string;
    apiKey: string;
    indexName: string;
    products?: string[];
};

function getUrl(h: HitRec): string {
    return (
        ((typeof h.url === "string" && h.url) ||
            (Array.isArray(h.url) && h.url[0]) ||
            h.url_without_anchor ||
            h.url_without_variables ||
            "#") + (h.anchor ? `#${h.anchor}` : "")
    );
}
function shortUrl(h: HitRec): string {
    const href = getUrl(h);
    try {
        const u = new URL(href, typeof window !== "undefined" ? window.location.origin : "http://localhost");
        return u.pathname + u.search + u.hash;
    } catch {
        return href;
    }
}
function titleFrom(h: HitRec): string {
    return h.title || h.hierarchy?.lvl2 || h.hierarchy?.lvl1 || h.hierarchy?.lvl0 || shortUrl(h);
}
function ProductBadge({ p }: { p?: string }) {
    return p ? <span className={`${styles.badge} ${styles[`p_${p}`]}`}>{p}</span> : null;
}

// facet filter applied via hook (won’t reset query UI state)
function ProductFilter({ product }: { product: string }) {
    useConfigure({
        facetFilters: product ? [[`product:${product}`]] : [],
    });
    return null;
}

// v7 hits -> grouped per anchor
function GroupedHits1147() {
    const { hits } = useHits<HitRec>();
    const groupsMap = new Map<string, { header: string; url: string; items: HitRec[] }>();
    for (const h of hits) {
        const page = h.url_without_anchor || (typeof h.url === "string" && h.url.split("#")[0]) || "";
        const key = `${page}#${h.anchor || ""}`;
        const url = getUrl(h);
        const g = groupsMap.get(key) || { header: titleFrom(h), url, items: [] };
        g.items.push(h);
        groupsMap.set(key, g);
    }
    const groups = [...groupsMap.values()];
    return (
        <div className={styles.groupList}>
            {groups.map((g) => (
                <div key={g.url} className={styles.group}>
                    <div className={styles.groupHeaderRow}>
                        <a href={g.url} className={styles.groupHeader}>{g.header}</a>
                        <ProductBadge p={g.items[0].product} />
                    </div>
                    {g.items[0].hierarchy?.lvl0 && <div className={styles.breadcrumb}>{g.items[0].hierarchy!.lvl0}</div>}
                    <div className={styles.groupSnips}>
                        {g.items.slice(0, 3).map((h, i) => (
                            <div key={i} className={styles.snippet}>
                                <Snippet attribute="content" hit={h as any} />
                            </div>
                        ))}
                    </div>
                    <div className={styles.groupUrl}>{shortUrl(g.items[0])}</div>
                </div>
            ))}
        </div>
    );
}

function GroupedHits() {
    const { hits } = useHits<HitRec>();

    // group by page (url_without_anchor)
    const groupsMap = new Map<
        string,
        { header: string; url: string; lvl0?: string; items: HitRec[] }
    >();

    for (const h of hits) {
        const page =
            h.url_without_anchor ||
            (typeof h.url === "string" ? h.url.split("#")[0] : "") ||
            "";

        const g =
            groupsMap.get(page) ||
            {
                header: titleFrom(h),
                url: page || getUrl(h),         // link to page (no #anchor)
                lvl0: h.hierarchy?.lvl0,
                items: [],
            };

        g.items.push(h);
        groupsMap.set(page, g);
    }

    const groups = [...groupsMap.values()];

    return (
        <div className={styles.groupList}>
            {groups.map((g) => (
                <div key={g.url} className={styles.group}>
                    <div className={styles.groupHeaderRow}>
                        <a href={g.url} className={styles.groupHeader}>{g.header}</a>
                        <ProductBadge p={g.items[0].product} />
                    </div>
                    {g.lvl0 && <div className={styles.breadcrumb}>{g.lvl0}</div>}
                    <div className={styles.groupSnips}>
                        {g.items.slice(0, 3).map((h, i) => (
                            <div key={i} className={styles.snippet}>
                                <Snippet attribute="content" hit={h as any} />
                            </div>
                        ))}
                    </div>
                    <div className={styles.groupUrl}>{shortUrl(g.items[0])}</div>
                </div>
            ))}
        </div>
    );
}


export default function ProductSearch({
                                          appId,
                                          apiKey,
                                          indexName,
                                          products = ["frontdoor", "openziti", "onprem", "zlan"],
                                      }: Props) {
    const [product, setProduct] = useState<string>("");
    const base = useMemo(() => algoliasearch(appId, apiKey), [appId, apiKey]);

    // 2-char gate, BUT allow if any facet filter is active
    const searchClient = useMemo(
        () => ({
            ...base,
            search(requests: any[]) {
                const tooShortForAll = requests.every((r: any) => {
                    const q = r.params?.query ?? "";
                    const ff = r.params?.facetFilters ?? [];
                    const hasFilters =
                        (Array.isArray(ff) && ff.length > 0) ||
                        (typeof ff === "string" && ff.trim().length > 0);
                    return !hasFilters && (!q || q.length < 2);
                });
                if (tooShortForAll) {
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
        [base]
    );

    return (
        <div className={styles.wrap}>
            <InstantSearch searchClient={searchClient} indexName={indexName}>
                <div className={styles.topbar}>
                    <SearchBox
                        classNames={{ input: styles.searchInput }}
                        placeholder="Type here to search for relevant documentation"
                    />
                    <div className={styles.pills}>
                        <button
                            className={`${styles.pill} ${!product ? styles.active : ""}`}
                            onClick={() => setProduct("")}
                            aria-pressed={!product}
                        >
                            All
                        </button>
                        {products.map((p) => (
                            <button
                                key={p}
                                className={`${styles.pill} ${product === p ? styles.active : ""}`}
                                onClick={() => setProduct(p)}
                                aria-pressed={product === p}
                            >
                                {p}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Static Configure (no facetFilters here to avoid remount/reset) */}
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
                    attributesToHighlight={["title", "hierarchy.lvl1", "hierarchy.lvl2", "content"]}
                    attributesToSnippet={["content:30"]}
                    snippetEllipsisText="…"
                    distinct={true}
                />

                {/* Dynamic facet filter without resetting query */}
                <ProductFilter product={product} />

                <div className={styles.meta}>
                    <Stats />
                    <PoweredBy />
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
            </InstantSearch>
        </div>
    );
}
