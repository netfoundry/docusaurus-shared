import React, {JSX} from 'react';
import Layout from '@theme/Layout';
import {Alert, NetFoundryHorizontalSection} from '@openclint/docusaurus-shared/ui';

export default function Home(): JSX.Element {
    const title = 'Home AA';
    const desc = "TheDescriptiond";
    return (
        <Layout title="My Page Title" >
            <main className="container margin-vert--lg">
                <NetFoundryHorizontalSection >
                    <NetFoundryHorizontalSection>
                        <h1>Hello</h1>
                        <p>This is a basic Docusaurus page in TSX.</p>
                        <p>This is a basic Docusaurus page in TSX.</p>
                        <p>This is a basic Docusaurus page in TSX.</p>
                        <Alert title="this is my title" type="info" />
                        <Alert title="this is my title" type="error" />
                        <Alert title="this is my title" type="success" />
                        <Alert title="this is my title" type="warning" />
                    </NetFoundryHorizontalSection>
                </NetFoundryHorizontalSection>
            </main>
        </Layout>
    );
}
