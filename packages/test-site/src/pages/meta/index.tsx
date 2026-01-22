import React, {JSX} from 'react';
import Layout from '@theme/Layout';
import {Alert, NetFoundryHorizontalSection} from '@netfoundry/docusaurus-theme/ui';

export default function Home(): JSX.Element {
    const chils = (
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
    );
    return (
        <Layout children={chils} title="meta aatitle here" description="meta description here" key="somekey" />
    );
}