import React from "react";
import Layout from "@theme/Layout";
import ProductSearch from "../components/ProductSearch";
import {cfg} from '../../docusaurus.config';

export default function NewSearchPage() {
    return (
        <Layout title="Search">
            <ProductSearch
                appId={cfg.algolia.appId}
                apiKey={cfg.algolia.apiKey}
                indexName={cfg.algolia.indexName}
            />
        </Layout>
    );
}