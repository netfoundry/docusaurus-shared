import React from "react";
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from "@theme/Layout";
import ProductSearch from "../components/ProductSearch";


export default function NewSearchPage() {
    const { customFields } = useDocusaurusContext().siteConfig;

    return (
        <Layout title="Search">
            <ProductSearch
                appId={customFields.ALGOLIA_APPID}
                apiKey={customFields.ALGOLIA_APIKEY}
                indexName={customFields.ALGOLIA_INDEXNAME}
            />
        </Layout>
    );
}