import React from "react";
import Layout from "@theme/Layout";
import ProductSearch from "../components/ProductSearch";
import {appId,apiKey,indexName} from "../consts"

export default function NewSearchPage() {
    return (
        <Layout title="Search">
            <ProductSearch
                appId={appId}
                apiKey={apiKey}
                indexName={indexName}
            />
        </Layout>
    );
}