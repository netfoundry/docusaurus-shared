// src/pages/index.tsx
import type {ReactNode} from 'react';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import {
    defaultNetFoundryFooterProps,
    NetFoundryHorizontalSection,
    NetFoundryLayout,
} from '@netfoundry/docusaurus-shared/ui';
import styles from "./index.module.css";

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
                <NetFoundryHorizontalSection >
                    <div className="container">
                        <h1 className="hero__title" style={{marginBottom: 8}}>NetFoundry Docs</h1>
                        <p className="hero__subtitle" style={{marginBottom: 24}}>
                            Guides, references, and how-tos for NetFoundry products and OpenZiti.
                        </p>
                        <div className="buttons">
                            <Link className="button button--secondary button--lg" to="https://support.netfoundry.io/hc/en-us/categories/360000991011-Docs-Guides">NetFoundry SaaS Docs</Link>
                            <span style={{margin: '0 8px'}} />
                            <Link className="button button--secondary button--lg" to="/docs/onprem/intro">On-Prem Docs</Link>
                            <span style={{margin: '0 8px'}} />
                            <Link className="button button--secondary button--lg" to="/docs/frontdoor/intro">Frontdoor Docs</Link>
                            <span style={{margin: '0 8px'}} />
                            <Link className="button button--secondary button--lg" to="/docs/openziti/learn/introduction">OpenZiti Docs</Link>
                            <span style={{margin: '0 8px'}} />
                            <Link className="button button--secondary button--lg" to="/docs/zlan/intro">zLAN Docs</Link>
                        </div>
                    </div>
                </NetFoundryHorizontalSection>

                <NetFoundryHorizontalSection style={{paddingBottom: "5em" }}>
                    <div className="container">
                        <div className="row">
                            <div className="col col--4">
                                <div className={styles.idxcard}>
                                    <div className="card__header"><h3>NetFoundry SaaS</h3></div>
                                    <div className="card__body">
                                        Enterprise cloud-hosted platform for OpenZiti overlays.
                                    </div>
                                    <div className="card__footer">
                                        <Link className="button button--primary button--block" to="https://support.netfoundry.io/hc/en-us/categories/360000991011-Docs-Guides">Go to NetFoundry SaaS</Link>
                                    </div>
                                </div>
                            </div>
                            <div className="col col--4">
                                <div className={styles.idxcard}>
                                    <div className="card__header"><h3>NetFoundry On-Prem</h3></div>
                                    <div className="card__body">
                                        Enterprise self-hosted platform for OpenZiti overlays.
                                    </div>
                                    <div className="card__footer">
                                        <Link className="button button--primary button--block" to="/docs/onprem/intro">Go to NetFoundry On-Prem</Link>
                                    </div>
                                </div>
                            </div>
                            <div className="col col--4">
                                <div className={styles.idxcard}>
                                    <div className="card__header"><h3>NetFoundry Frontdoor</h3></div>
                                    <div className="card__body">
                                        Zero-trust inbound access to private apps and services.
                                    </div>
                                    <div className="card__footer">
                                        <Link className="button button--primary button--block" to="/docs/frontdoor/intro">Go to NetFoundry Frontdoor</Link>
                                    </div>
                                </div>
                            </div>
                            <div className="col col--4">
                                <div className={styles.idxcard}>
                                    <div className="card__header"><h3>OpenZiti</h3></div>
                                    <div className="card__body">
                                        Open-source zero-trust networking project and SDKs.
                                    </div>
                                    <div className="card__footer">
                                        <Link className="button button--primary button--block" to="/docs/openziti/learn/introduction">Go to OpenZiti</Link>
                                    </div>
                                </div>
                            </div>
                            <div className="col col--4">
                                <div className={styles.idxcard}>
                                    <div className="card__header"><h3>zLAN</h3></div>
                                    <div className="card__body">
                                        Built on the robust foundation of NetFoundy OpenZiti, NetFoundry zLAN combines advanced firewall capabilities with the power of zero trust and secure network overlay
                                    </div>
                                    <div className="card__footer">
                                        <Link className="button button--primary button--block" to="/docs/zlan/intro">Go to zLAN</Link>
                                    </div>
                                </div>
                            </div>
                            <div className="col col--4">
                                <div className={styles.idxcard}>
                                    <div className="card__header"><h3>zrok</h3></div>
                                    <div className="card__body">
                                        zrok is an open-source, self-hostable sharing platform that simplifies shielding and sharing network services or files.
                                    </div>
                                    <div className="card__footer">
                                        <Link className="button button--primary button--block" to="/docs/zrok/getting-started">Go to zrok</Link>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="margin-top--lg row">
                            <div className="col col--6">
                                <div className={styles.idxcard}>
                                    <div className="card__header"><h3>Quick Links</h3></div>
                                    <div className="card__body">
                                        <ul>
                                            <li><Link to="/docs/onprem/troubleshooting">NetFoundry Troubleshooting</Link></li>
                                            <li><Link to="/docs/onprem/intro">On-Prem Deployment</Link></li>
                                            <li><Link to="/docs/frontdoor/intro">Frontdoor Getting Started</Link></li>
                                            <li><Link to="/docs/openziti/reference/command-line/login">OpenZiti CLI Reference</Link></li>
                                            <li><Link to="/docs/zlan/intro">zLAN FAQ</Link></li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                            <div className="col col--6">
                                <div className={styles.idxcard}>
                                    <div className="card__header"><h3>Support</h3></div>
                                    <div className="card__body">
                                        <ul>
                                            <li><Link to="/docs/onprem/troubleshooting">NetFoundry Troubleshooting</Link></li>
                                            <li><Link to="/docs/onprem/troubleshooting">On-Prem Troubleshooting</Link></li>
                                            <li><Link to="/docs/frontdoor/learn/health-checks">Frontdoor Troubleshooting</Link></li>
                                            <li><Link to="/docs/openziti/learn/identity-providers">OpenZiti FAQ</Link></li>
                                            <li><Link to="/docs/zlan/intro">zLAN FAQ</Link></li>
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
