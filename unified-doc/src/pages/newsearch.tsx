// src/pages/search.tsx
import React, { useState } from "react";
import Layout from "@theme/Layout";
import { InstantSearch, SearchBox, Hits, Pagination, Highlight, Configure } from "react-instantsearch";
import { liteClient as algoliasearch } from "algoliasearch/lite";

const searchClient = algoliasearch("QRGW6TJXHP", "267457291182a398c5ee19fcb0bcae77");

type HitRec = {
    objectID?: string;
    url?: string | string[];
    url_without_anchor?: string;
    url_without_variables?: string;
    anchor?: string;
    hierarchy?: { lvl0?: string; lvl1?: string };
    product?: string;
};

function getUrl(hit: HitRec) {
    const fromUrl =
        (typeof hit.url === "string" && hit.url) ||
        (Array.isArray(hit.url) && hit.url[0]) ||
        hit.url_without_anchor ||
        hit.url_without_variables ||
        (hit.objectID && hit.objectID.includes("http") ? hit.objectID.replace(/^\d+-/, "") : "");
    const hash = hit.anchor ? `#${hit.anchor}` : "";
    return fromUrl ? `${fromUrl}${hash}` : "#";
}

function shortUrl(hit: HitRec) {
    const href = getUrl(hit);
    const idx = href.indexOf("/docs/");
    return idx >= 0 ? href.substring(idx) : href;
}

function Hit({ hit }: { hit: HitRec }) {
    const href = getUrl(hit);
    return (
        <div style={{ padding: "8px 0" }}>
            <a href={href} style={{ textDecoration: "none" }}>
                <strong>
                    <Highlight attribute="hierarchy.lvl1" hit={hit as any} />
                </strong>
            </a>
            <div style={{ fontSize: 12, opacity: 0.7 }}>
                {shortUrl(hit)} {hit.product ? `· ${hit.product}` : ""}
            </div>
        </div>
    );
}

export default function ProductSearchPage() {
    const [product, setProduct] = useState("");

    return (
        <Layout title="Search">
            <div style={{ maxWidth: 900, margin: "0 auto", padding: "1.5rem 1rem" }}>
                <InstantSearch searchClient={searchClient} indexName="nfdocs_stg">
                    <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 12 }}>
                        <SearchBox placeholder="Search docs…" />
                        <label htmlFor="product">Filter:</label>
                        <select id="product" value={product} onChange={(e) => setProduct(e.target.value)} style={{ padding: 6 }}>
                            <option value="">All</option>
                            <option value="frontdoor">frontdoor</option>
                            <option value="openziti">openziti</option>
                            <option value="onprem">onprem</option>
                            <option value="zlan">zlan</option>
                        </select>
                    </div>

                    <Configure
                        hitsPerPage={12}
                        attributesToRetrieve={[
                            "url",
                            "url_without_anchor",
                            "url_without_variables",
                            "anchor",
                            "hierarchy",
                            "product",
                            "title",
                        ]}
                        {...(product ? { facetFilters: [`product:${product}`] } : {})}
                    />

                    <div style={{ borderTop: "1px solid #e5e5e5", paddingTop: 12 }}>
                        <Hits hitComponent={Hit} />
                        <Pagination />
                    </div>
                </InstantSearch>
            </div>
        </Layout>
    );
}
