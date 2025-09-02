// src/components/ProductSearch.tsx
import React, { useState } from "react";
import {
    InstantSearch, SearchBox, Hits, Pagination, Highlight, Snippet,
    Configure, Stats, PoweredBy, ClearRefinements
} from "react-instantsearch";
import { liteClient as algoliasearch } from "algoliasearch/lite";
import styles from "./ProductSearch.module.css";

type HitRec = {
    url?: string | string[]; url_without_anchor?: string; url_without_variables?: string; anchor?: string;
    hierarchy?: { lvl0?: string; lvl1?: string; lvl2?: string }; product?: string; content?: string;
};

const getUrl = (h: HitRec) =>
    ((typeof h.url === "string" && h.url) || (Array.isArray(h.url) && h.url[0]) ||
        h.url_without_anchor || h.url_without_variables || "#") + (h.anchor ? `#${h.anchor}` : "");
const shortUrl = (h: HitRec) => {
    const href = getUrl(h); const i = href.indexOf("/docs/"); return i >= 0 ? href.substring(i) : href;
};

function ProductBadge({ p }: { p?: string }) {
    return p ? <span className={`${styles.badge} ${styles[`p_${p}`]}`}>{p}</span> : null;
}
function Hit({ hit }: { hit: HitRec }) {
    const href = shortUrl(hit);
    return (
        <a className={styles.card} href={href}>
            <div className={styles.cardHeader}>
                <h3 className={styles.title}><Highlight attribute="hierarchy.lvl1" hit={hit as any} /></h3>
                <ProductBadge p={hit.product} />
            </div>
            <div className={styles.url}>{shortUrl(hit)}</div>
            <div className={styles.snippet}><Snippet attribute="content" hit={hit as any} /></div>
        </a>
    );
}

type Props = {
    appId: string;
    apiKey: string;
    indexName: string;
    products?: string[];
};
export default function ProductSearch({ appId, apiKey, indexName, products = ["frontdoor","openziti","onprem","zlan"] }: Props) {
    const [product, setProduct] = useState<string>("");
    const searchClient = algoliasearch(appId, apiKey);
    const constrainedSearchClient = { //force the user to enter two chars before searching
        ...searchClient,
        search(requests: any[]) {
            const tooShort = requests.every(
                (r) => !r.params?.query || r.params.query.length < 2
            );
            if (tooShort) {
                return Promise.resolve({
                    results: requests.map(() => ({
                        hits: [], nbHits: 0, page: 0, nbPages: 0, processingTimeMS: 0,
                        params: "", query: "", exhaustiveNbHits: false
                    })),
                });
            }
            return searchClient.search(requests);
        },
    };
    return (
        <div className={styles.wrap}>
            <InstantSearch searchClient={constrainedSearchClient} indexName={indexName}>
                <div className={styles.topbar}>
                    <SearchBox classNames={{ root: styles.search }} placeholder="Type here to search for relevant documentation" />
                    <div className={styles.pills}>
                        <button className={`${styles.pill} ${!product ? styles.active : ""}`} onClick={() => setProduct("")}>All</button>
                        {products.map(p => (
                            <button key={p} className={`${styles.pill} ${product===p ? styles.active : ""}`} onClick={() => setProduct(p)}>{p}</button>
                        ))}
                        <ClearRefinements translations={{ resetButtonText: "Reset" }} />
                    </div>
                </div>

                <Configure
                    hitsPerPage={12}
                    attributesToRetrieve={[
                        "url","url_without_anchor","url_without_variables","anchor","hierarchy","product","content","title"
                    ]}
                    {...(product ? { facetFilters: [`product:${product}`] } : {})}
                />

                <div className={styles.meta}><Stats /><PoweredBy /></div>
                <div className={styles.grid}><Hits hitComponent={Hit} /></div>

                <Pagination
                    showFirst={false}
                    showLast={false}
                    classNames={{
                        root: styles.pagination, list: styles.pageList, item: styles.pageItem,
                        selectedItem: styles.pageItemSelected, disabledItem: styles.pageItemDisabled, link: styles.pageLink,
                    }}
                />
            </InstantSearch>
        </div>
    );
}
