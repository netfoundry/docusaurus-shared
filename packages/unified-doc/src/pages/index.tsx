// src/pages/index.tsx
import type {ReactNode} from 'react';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import {
    defaultNetFoundryFooterProps,
    NetFoundryHorizontalSection,
    NetFoundryLayout,
} from '@openclint/docusaurus-shared';

export default function Home(): ReactNode {
    const {siteConfig} = useDocusaurusContext();
    const fp = defaultNetFoundryFooterProps();
    fp.description = 'NetFoundry documentation for open source projects and products';

    return (
        <NetFoundryLayout
            footerProps={fp}
            title={`NetFoundry Docs Portal`}
            description="Find product and open-source docs fast"
        >
            <main>
                <NetFoundryHorizontalSection className="hero hero--primary" style={{padding: '4rem 0'}}>
                    <div className="container">
                        <h1 className="hero__title" style={{marginBottom: 8}}>NetFoundry Docs</h1>
                        <p className="hero__subtitle" style={{marginBottom: 24}}>
                            Guides, references, and how-tos for NetFoundry products and OpenZiti.
                        </p>
                        <div className="buttons">
                            <Link className="button button--secondary button--lg" to="/docs/onprem/intro">On-Prem Docs</Link>
                            <span style={{margin: '0 8px'}} />
                            <Link className="button button--secondary button--lg" to="/docs/frontdoor/intro">Frontdoor Docs</Link>
                            <span style={{margin: '0 8px'}} />
                            <Link className="button button--secondary button--lg" to="/docs/ziti/intro">OpenZiti Docs</Link>
                        </div>
                    </div>
                </NetFoundryHorizontalSection>

                <NetFoundryHorizontalSection>
                    <div className="container">
                        <div className="row">
                            <div className="col col--4">
                                <div className="card">
                                    <div className="card__header"><h3>On-Prem</h3></div>
                                    <div className="card__body">
                                        Enterprise self-hosted platform for OpenZiti overlays.
                                    </div>
                                    <div className="card__footer">
                                        <Link className="button button--primary button--block" to="/docs/onprem/intro">Go to On-Prem</Link>
                                    </div>
                                </div>
                            </div>
                            <div className="col col--4">
                                <div className="card">
                                    <div className="card__header"><h3>Frontdoor</h3></div>
                                    <div className="card__body">
                                        Zero-trust inbound access to private apps and services.
                                    </div>
                                    <div className="card__footer">
                                        <Link className="button button--primary button--block" to="/docs/frontdoor/intro">Go to Frontdoor</Link>
                                    </div>
                                </div>
                            </div>
                            <div className="col col--4">
                                <div className="card">
                                    <div className="card__header"><h3>OpenZiti</h3></div>
                                    <div className="card__body">
                                        Open-source zero-trust networking project and SDKs.
                                    </div>
                                    <div className="card__footer">
                                        <Link className="button button--primary button--block" to="/docs/ziti/intro">Go to OpenZiti</Link>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="margin-top--lg row">
                            <div className="col col--6">
                                <div className="card">
                                    <div className="card__header"><h3>Quick Links</h3></div>
                                    <div className="card__body">
                                        <ul>
                                            <li><Link to="/docs/onprem/deploy">On-Prem Deployment</Link></li>
                                            <li><Link to="/docs/frontdoor/getting-started">Frontdoor Getting Started</Link></li>
                                            <li><Link to="/docs/ziti/reference/cli">OpenZiti CLI Reference</Link></li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                            <div className="col col--6">
                                <div className="card">
                                    <div className="card__header"><h3>Support</h3></div>
                                    <div className="card__body">
                                        <ul>
                                            <li><Link to="/docs/onprem/troubleshooting">On-Prem Troubleshooting</Link></li>
                                            <li><Link to="/docs/frontdoor/troubleshooting">Frontdoor Troubleshooting</Link></li>
                                            <li><Link to="/docs/ziti/faq">OpenZiti FAQ</Link></li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </NetFoundryHorizontalSection>
            </main>
        </NetFoundryLayout>
    );
}
