import React, {JSX, ReactNode} from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import clsx from 'clsx';
import {NetFoundryHorizontalSection} from '@netfoundry/docusaurus-theme/ui';
import {DOCS_BASE} from '../generated/docsBase';
import styles from './netfoundry-platform-overview.module.css';

const IMG = 'https://netfoundry.io/docs/img';
const NF_LOGO = 'https://raw.githubusercontent.com/netfoundry/branding/refs/heads/main/images/svg/icon/netfoundry-icon-color.svg';

const TRIAL = 'https://netfoundry.io/products/netfoundry-cloud-30-day-free-trial/';
const DEMO = 'https://netfoundry.io/lets-talk/';

/* ------------------------------------------------------------- primitives */

/** Section heading with a monospace marker above it, so sections are scannable at a glance. */
function Section({marker, id, title, children}: {marker: string; id: string; title: string; children: ReactNode}) {
  return (
    <section className={styles.docSection}>
      <span className={styles.marker}>{marker}</span>
      <h2 id={id}>{title}</h2>
      {children}
    </section>
  );
}

/** Whole-card link that does not navigate when the click ended a text selection.
 *  A plain anchor fires click on mouseup regardless, so selecting a card's copy would activate
 *  the link the moment the mouse came up. Pressing the mouse down collapses any earlier
 *  selection, so anything still selected at click time was selected inside this card. */
function CardLink({to, className, children}: {to: string; className: string; children: ReactNode}) {
  return (
    <Link
      to={to}
      className={className}
      onClick={e => {
        if (!window.getSelection()?.isCollapsed) {
          e.preventDefault();
        }
      }}
    >
      {children}
    </Link>
  );
}

/** A titled feature block — the bullet list alternative that still reads as documentation. */
function Item({label, children}: {label: string; children: ReactNode}) {
  return (
    <div className={styles.item}>
      <h4>{label}</h4>
      <p>{children}</p>
    </div>
  );
}

/* ------------------------------------------------------------------ data */

/** Products that make up the platform: what each one is for, not just where its docs are. */
const platformProjects = [
  {
    title: 'Console',
    logo: NF_LOGO,
    to: `${DOCS_BASE}platform/intro`,
    role: 'Operate the network',
    summary: 'The web interface. Enroll identities, define services and policies, provision routers, read metrics and events.',
  },
  {
    title: 'API',
    logo: NF_LOGO,
    to: `${DOCS_BASE}platform/api-guides/`,
    role: 'Automate the network',
    summary: 'Use the same API that we do to automate provisioning, the network model, metrics, and reporting.',
  },
  {
    title: 'Data Connector',
    logo: NF_LOGO,
    to: `${DOCS_BASE}dataconnector/intro`,
    role: 'Get the data out',
    summary: 'Stream network events and metrics into your own warehouse, SIEM, or analytics stack instead of reading them in a console.',
  },
  // Row two: the products that deliver access to someone else.
  {
    title: 'Frontdoor',
    logo: `${IMG}/frontdoor-sm-logo.svg`,
    to: `${DOCS_BASE}frontdoor/intro`,
    role: 'Publish an HTTP service',
    summary: 'Reach an HTTP service from a browser with no client software and no firewall changes — publicly or kept private to your identities. Users authenticate through your existing IdP.',
  },
  {
    title: 'Customer Connect',
    logo: NF_LOGO,
    to: `${DOCS_BASE}customer-connect/intro`,
    role: 'Serve your own customers',
    summary: 'Deliver zero trust access to the people who buy from you, each tenant isolated from every other. White-label and vanity domain options for solution providers.',
  },
  {
    title: 'OpenZiti',
    logo: `${IMG}/openziti-sm-logo.svg`,
    to: `${DOCS_BASE}openziti/intro`,
    role: 'The open source foundation',
    summary: 'NetFoundry created and maintains OpenZiti, the Apache 2.0 project everything here is built on. You get the same overlay, the same SDKs, and the same cryptography, with NetFoundry running and supporting it.',
  },
];

/** Who operates the infrastructure. Both options are commercially supported NetFoundry products. */
const deploymentOptions = [
  {
    title: 'NetFoundry Cloud',
    to: DEMO,
    cta: 'Talk to us →',
    operator: 'Operated by NetFoundry',
    body: 'A hybrid SaaS model: NetFoundry manages the infrastructure, and you own the network configuration and policies. Your network is dedicated to you rather than shared with other customers.',
    points: [
      'One-click controllers and routers on AWS, Azure, GCP, and OCI',
      'Your own controller, data plane, and PKI',
      'Managed version upgrades, including for routers you host yourself',
      'Automated configuration backups',
      'Infrastructure inventory, allocated IPs, and component health in the console',
      'SCIM identity provisioning from Entra ID or Okta',
      'IPsec bridging for existing site-to-site VPNs',
      'An uptime SLA on the network NetFoundry operates',
    ],
  },
  {
    title: 'NetFoundry Self-Hosted',
    to: `${DOCS_BASE}selfhosted/intro`,
    cta: 'Read the docs →',
    operator: 'Operated by you, supported by us',
    body: 'The same stack and the same contractual guarantees, deployed into an environment you own — on-prem, air-gapped, or your own cloud accounts.',
    points: [
      'You deploy and run the controllers and routers on infrastructure you own',
      'No dependency on a NetFoundry-operated control plane',
      'Fits sovereign, air-gapped, and otherwise restricted environments',
      'You choose the platform, the sizing, and the upgrade schedule',
      'Production installers, bundled and packaged for supportability',
      'Logs, OS metrics, Ziti metrics, and stream integration included',
      'Optional remote access that you grant and revoke, so NetFoundry can troubleshoot or run an upgrade from inside the isolated network',
    ],
  },
];

/** Decision guidance. Stated as conditions rather than benefits, so a reader can match their own
 *  situation against it instead of being told which one to want. */
const choosing = [
  {
    heading: 'Choose NetFoundry Cloud when',
    conditions: [
      'You want a production network in minutes rather than a build project',
      'Your engineers should be building applications, not operating an overlay',
      'You are scaling across regions and would rather not run distributed routers',
      'You want to stay current without planning upgrade cycles',
      'You need an uptime guarantee on the network itself, with financial remedies',
    ],
  },
  {
    heading: 'Choose NetFoundry Self-Hosted when',
    conditions: [
      'Regulation or internal policy rules out a cloud-hosted control plane',
      'The environment is air-gapped, sovereign, or otherwise isolated',
      'You need to control exactly where every component runs',
      'You have staff to operate it and still want the vendor guarantees',
    ],
  },
];

/** Capabilities both options carry, so the cards above only have to state the differences. */
const sharedCapabilities = [
  'A dedicated PKI, provisioned and maintained for you',
  'Identities, services, policies, and posture checks',
  'High availability controllers',
  'Metrics, latency, and audit logging',
  'Third-party certificate authorities and BYO DNS for public-facing services',
  'Standard, FIPS-compliant, or pluggable cryptographic modes',
  'APIs for the network model, metrics, and reporting',
  '24×7 support and production architecture guidance',
  'SOC 2 Type II audit reports and per-framework compliance guidance',
];

/** Everything the managed platform includes, grouped into three buckets. Items link into the
 *  product documentation where a page covers them, and to a section on this page where none does. */
const included = [
  {
    bucket: 'Infrastructure and operations',
    items: [
      {label: 'Deploy controllers and routers on demand', to: `${DOCS_BASE}platform/how-tos/routers/create-router`},
      {label: 'Global mesh across providers and regions', to: `${DOCS_BASE}platform/core-components/routers`},
      {label: 'Dedicated control and data plane per network', to: `${DOCS_BASE}platform/intro`},
      {label: 'High availability controllers', to: `${DOCS_BASE}platform/infrastructure/managed-components`},
      {label: 'Managed version upgrades', to: `${DOCS_BASE}platform/infrastructure/managed-components`},
      {label: 'Automated configuration backups', to: '#deployment-options'},
    ],
  },
  {
    bucket: 'Visibility and audit',
    items: [
      {label: 'Usage metrics and fabric telemetry', to: `${DOCS_BASE}platform/visibility/metrics`},
      {label: 'Fabric and controller latency', to: `${DOCS_BASE}platform/visibility/metrics#fabric-latency-tab`},
      {label: 'Traffic analysis for microsegmentation', to: `${DOCS_BASE}platform/visibility/metrics#traffic-analysis-tab`},
      {label: 'Events and management audit logging', to: `${DOCS_BASE}platform/visibility/events`},
      {label: 'Streaming to your own data platform', to: `${DOCS_BASE}dataconnector/intro`},
    ],
  },
  {
    bucket: 'Access, automation, and assurance',
    items: [
      {label: 'Identity and service policies', to: `${DOCS_BASE}platform/access-management/policies/`},
      {label: 'IdP authentication and posture checks', to: `${DOCS_BASE}platform/access-management/posture-checks`},
      {label: 'SCIM identity provisioning', to: `${DOCS_BASE}platform/access-management/integrations/scim`},
      {label: 'APIs for infrastructure, network, and metrics', to: `${DOCS_BASE}platform/api-guides/`},
      {label: 'IPsec bridging for existing VPNs', to: `${DOCS_BASE}platform/core-components/ipsec-tunnelers`},
      {label: 'SLA, support, and audit reports', to: '#assurance'},
    ],
  },
];

/** Compliance posture, grouped by what NetFoundry actually provides. These are not equivalent:
 *  an audit report, an eligibility statement, and architectural guidance are three different
 *  things, and procurement will ask which one applies. */
const compliance = [
  {
    tier: 'Audited',
    note: 'Independent audit reports NetFoundry can provide.',
    items: ['SOC 2 Type II'],
  },
  {
    tier: 'Contractual and eligible',
    note: 'Supported through contract terms and platform configuration.',
    items: ['HIPAA eligibility', 'GDPR', 'CCPA', 'Data processing agreements'],
  },
  {
    tier: 'Guidance and alignment',
    note: 'NetFoundry provides guidance and controls that map to these; the attestation is yours.',
    items: [
      'FIPS', 'PCI DSS', 'NIST 800-207', 'NIST 800-171',
      'IEC 62443', 'NERC CIP', 'NIS2', 'DORA', 'CJIS',
    ],
  },
];

/* ------------------------------------------------------------------ page */

export default function CloudPlatformOverview(): JSX.Element {
  return (
    <Layout
      title="NetFoundry Platform"
      description="Overview of the NetFoundry Platform: the management and orchestration layer for zero trust overlay networks built on OpenZiti, and what each platform product is for."
    >
      <>
        {/* Full-bleed tint band; NetFoundryHorizontalSection inside aligns the content to the
            site's --ziti-max-width, so this header lines up with every other page. */}
        <header className={styles.pageHeader}>
          <NetFoundryHorizontalSection className={styles.band}>
            <div className={clsx('container', styles.headerContent)}>
              <span className={styles.eyebrow}>Overview</span>
              <h1>NetFoundry Platform</h1>
              <p className={styles.lede}>
                NetFoundry provides a fully managed, production-ready identity-first zero trust fabric based on{' '}
                <Link to={`${DOCS_BASE}openziti/intro`}>OpenZiti</Link>, without requiring you to build or operate the
                underlying infrastructure. Your network is your own: deploy controllers and routers dedicated to your
                organization, never shared with another customer, across whichever cloud providers and regions you
                choose.
              </p>
              <div className={styles.included}>
                <span className={styles.includedTitle}>With the NetFoundry platform you get</span>
                <div className={styles.includedGrid}>
                  {included.map(group => (
                    <div key={group.bucket} className={styles.bucket}>
                      <h3 className={styles.bucketTitle}>{group.bucket}</h3>
                      <ul className={styles.includedList}>
                        {group.items.map(f => (
                          <li key={f.label}>
                            {/* Same-page jumps use a bare anchor. Docusaurus collects heading
                                anchors from MDX metadata, which a .tsx page has none of, so
                                onBrokenAnchors flags every <Link to="#..."> here even though the
                                id renders. Raw anchors are not checked. */}
                            {f.to.startsWith('#')
                              ? <a href={f.to}>{f.label}</a>
                              : <Link to={f.to}>{f.label}</Link>}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </NetFoundryHorizontalSection>
        </header>

        <NetFoundryHorizontalSection className={clsx(styles.band, styles.body)}>
          <article className={clsx('markdown', 'container', styles.article)}>

            <Section marker="01" id="products" title="What is the NetFoundry Platform">
              <p>The NetFoundry Platform consists of several components and applications:</p>
              <div className={styles.projectGrid}>
                {platformProjects.map(p => (
                  <CardLink key={p.title} to={p.to} className={styles.projectCard}>
                    <span className={styles.projectRole}>{p.role}</span>
                    <div className={styles.projectHeader}>
                      <img src={p.logo} alt="" className={styles.projectLogo} />
                      <h3>{p.title}</h3>
                    </div>
                    <p>{p.summary}</p>
                  </CardLink>
                ))}
              </div>

            </Section>

            <Section marker="02" id="deployment-options" title="Let us run it for you, or run it yourself">
              <p>
                The overlay, the SDKs, and the security model are identical either way. What differs is who operates
                the infrastructure — and in both cases the network configuration and the policies that govern access
                stay yours.
              </p>
              <div className={styles.optionRow}>
                {deploymentOptions.map(o => (
                  <CardLink key={o.title} to={o.to} className={styles.option}>
                    <span className={styles.optionOperator}>{o.operator}</span>
                    <h4>{o.title}</h4>
                    <p>{o.body}</p>
                    <ul className={styles.optionPoints}>
                      {o.points.map(pt => <li key={pt}>{pt}</li>)}
                    </ul>
                    <span className={styles.optionMore}>{o.cta}</span>
                  </CardLink>
                ))}
              </div>

              <div className={styles.choosing}>
                {choosing.map(group => (
                  <div key={group.heading} className={styles.choice}>
                    <h4>{group.heading}</h4>
                    <ul>
                      {group.conditions.map(c => <li key={c}>{c}</li>)}
                    </ul>
                  </div>
                ))}
              </div>

              <div className={styles.shared}>
                <span className={styles.sharedTitle}>Both options include</span>
                <ul className={styles.sharedList}>
                  {sharedCapabilities.map(c => <li key={c}>{c}</li>)}
                </ul>
              </div>

              <h3 id="assurance" className={styles.subhead}>Support and compliance</h3>
              <p>
                Apache 2.0 disclaims warranty and liability, which is the correct posture for a licence and an
                insufficient one for a procurement process. A NetFoundry subscription adds the contractual surface
                around the same software: 24×7 support from the engineers who write it, an uptime SLA with service
                credits on networks NetFoundry operates, and data processing agreements.
              </p>
              <p>
                On compliance, what NetFoundry provides differs by framework — an audit report, a contractual
                commitment, and architectural guidance are not the same thing:
              </p>
              <dl className={styles.complianceList}>
                {compliance.map(group => (
                  <div key={group.tier} className={styles.complianceGroup}>
                    <dt>
                      <span className={styles.complianceTier}>{group.tier}</span>
                      <span className={styles.complianceNote}>{group.note}</span>
                    </dt>
                    <dd>
                      <div className={styles.chipRow}>
                        {group.items.map(f => <span key={f} className={styles.chip}>{f}</span>)}
                      </div>
                    </dd>
                  </div>
                ))}
              </dl>
            </Section>

            <Section marker="03" id="visibility" title="Visibility">
              <p>
                Telemetry comes out of the Ziti fabric itself, so the numbers describe the overlay rather than a proxy
                for it.
              </p>
              <div className={styles.itemGrid}>
                <Item label="Metrics">
                  Traffic volume by dialing endpoint, hosting endpoint, service, and edge router, over preset or custom
                  time ranges and filterable by endpoint attribute.{' '}
                  <Link to={`${DOCS_BASE}platform/visibility/metrics`}>Reference</Link>.
                </Item>
                <Item label="Fabric and controller latency">
                  Router-to-router link latency and router-to-controller control-channel latency, as mean, max, and
                  P99, with a link diagram and time series. Latency timeouts surface failing paths and overloaded
                  routers.
                </Item>
                <Item label="Traffic analysis">
                  For ZTNA deployments using ingress and egress gateways, the actual source IPs, destination IPs, and
                  ports crossing the funnel — so a segmentation design can be derived from observed flows rather than
                  guessed at.
                </Item>
                <Item label="Events and audit logging">
                  Management events record who changed what and when, alongside network activity.{' '}
                  <Link to={`${DOCS_BASE}platform/visibility/events`}>Reference</Link>.
                </Item>
                <Item label="Metering and alarms">
                  Usage metered by application and by team, with alarm and event configuration so a threshold reaches
                  you rather than waiting to be noticed.
                </Item>
                <Item label="Export">
                  <Link to={`${DOCS_BASE}dataconnector/intro`}>Data Connector</Link> streams events and metrics into
                  your own warehouse, SIEM, or analytics platform.
                </Item>
              </div>
            </Section>

          </article>
        </NetFoundryHorizontalSection>

        <aside className={styles.ctaBand}>
          <NetFoundryHorizontalSection className={styles.band}>
            <div className={clsx('container', styles.ctaInner)}>
              <div>
                <h2>Get started</h2>
                <p>
                  Provision a network on a trial and work through the{' '}
                  <Link to={`${DOCS_BASE}platform/get-started/prereqs`}>get-started sequence</Link> — router, identity,
                  service, policy, verify. If the questions are contractual rather than technical, talk to us instead.
                </p>
              </div>
              <div className={styles.ctaActions}>
                <a className={styles.ctaPrimary} href={TRIAL}>Start a free trial</a>
                <a className={styles.ctaGhost} href={DEMO}>Talk to us</a>
              </div>
            </div>
          </NetFoundryHorizontalSection>
        </aside>
      </>
    </Layout>
  );
}
