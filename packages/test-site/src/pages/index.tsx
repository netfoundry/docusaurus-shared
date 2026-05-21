import React, {JSX, useLayoutEffect, useState} from 'react';
import clsx from 'clsx';
import Head from '@docusaurus/Head';
import {
    Alert,
    NetFoundryHorizontalSection,
    NetFoundryLayout,
} from '@netfoundry/docusaurus-theme/ui';

interface WindowSize {
    width: number;
    height: number;
}

function getWindowSize(): WindowSize {
    if (typeof window !== 'undefined') {
        return {width: window.innerWidth, height: window.innerHeight};
    }
    return {width: 0, height: 0};
}

const heroStyle: React.CSSProperties = {
    padding: '4rem 2rem',
    textAlign: 'center',
    background:
        'linear-gradient(135deg, rgba(0,118,255,0.12), rgba(34,211,238,0.08))',
};

const sectionStyle: React.CSSProperties = {
    padding: '3rem 2rem',
    maxWidth: 1100,
    margin: '0 auto',
};

const cardGrid: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
    gap: '1rem',
    marginTop: '1.5rem',
};

const card: React.CSSProperties = {
    padding: '1.25rem',
    borderRadius: 12,
    border: '1px solid var(--ifm-color-emphasis-200)',
    background: 'var(--ifm-background-surface-color)',
};

const btnPrimary: React.CSSProperties = {
    display: 'inline-block',
    padding: '0.7rem 1.5rem',
    background: 'var(--ifm-color-primary)',
    color: '#fff',
    borderRadius: 8,
    fontWeight: 700,
    textDecoration: 'none',
};

const btnGhost: React.CSSProperties = {
    display: 'inline-block',
    padding: '0.7rem 1.5rem',
    background: 'transparent',
    color: 'var(--ifm-color-primary)',
    border: '2px solid var(--ifm-color-primary)',
    borderRadius: 8,
    fontWeight: 700,
    textDecoration: 'none',
    marginLeft: '0.5rem',
};

const anchorTarget: React.CSSProperties = {
    scrollMarginTop: 'var(--ifm-navbar-height)',
};

function HeroSection() {
    return (
        <NetFoundryHorizontalSection style={heroStyle}>
            <div style={{maxWidth: 800, margin: '0 auto'}}>
                <h1 style={{fontSize: '3rem', lineHeight: 1.1, margin: 0}}>
                    Docusaurus Shared Theme
                </h1>
                <p style={{fontSize: '1.15rem', margin: '1rem 0 1.5rem'}}>
                    A long, scrolly landing page that exercises the SPA cold-load
                    anchor behavior. Click "Jump to Deploy" with a fresh tab to
                    test that <code>#deploy-overlay</code> lands in the right place
                    after hydration.
                </p>
                <div>
                    <a href="#deploy-overlay" style={btnPrimary}>
                        Jump to Deploy
                    </a>
                    <a href="/docs" style={btnGhost}>
                        Browse the Docs
                    </a>
                </div>
            </div>
        </NetFoundryHorizontalSection>
    );
}

function IntroSection() {
    return (
        <NetFoundryHorizontalSection>
            <section style={sectionStyle}>
                <h2>What this page is for</h2>
                <p>
                    This is the test-site landing page. Its job is to be tall,
                    so that anchor links to mid-page sections actually need
                    real scrolling. The page also intentionally renders
                    client-only content that grows the layout after hydration,
                    which is what made the original cold-load anchor bug
                    visible in the first place.
                </p>
                <p>
                    Don't read the words too closely. The point of this page
                    is the <em>shape</em>: a hero, then enough sections to
                    push the deploy anchor below the fold, then more sections
                    after it. Treat it as ballast.
                </p>
                <Alert
                    title="How to reproduce the cold-load anchor bug"
                    type="info"
                >
                    Open <code>/#deploy-overlay</code> in a fresh tab.
                    With the fix in place, the page lands on the deploy
                    section. Without the fix (revert <code>useRehashOnLoad</code>
                    from <code>NetFoundryLayout</code>), the browser scrolls
                    against the pre-hydration layout and the section ends up
                    well below the viewport once client-only content expands.
                </Alert>
            </section>
        </NetFoundryHorizontalSection>
    );
}

function FeatureGridSection() {
    const features = [
        {
            icon: 'IDENT',
            title: 'Strong identities',
            body: 'Cryptographically verifiable identities instead of IP-based trust.',
        },
        {
            icon: 'AUTHZ',
            title: 'Identity-aware access',
            body: 'Fine-grained authorization with posture checks at connection time.',
        },
        {
            icon: 'PORTS',
            title: 'No open ports',
            body: 'Services vanish from the public internet, invisible to scanners.',
        },
        {
            icon: 'INTGR',
            title: 'Flexible integration',
            body: 'Tunnelers for existing apps or SDKs embedded directly into them.',
        },
        {
            icon: 'ROUTE',
            title: 'Smart routing',
            body: 'Fabric routes traffic on the optimal secure path automatically.',
        },
        {
            icon: 'CRYPT',
            title: 'End-to-end encryption',
            body: 'Libsodium-backed crypto keeps data secure all the way through.',
        },
        {
            icon: 'PRDNS',
            title: 'Private DNS',
            body: 'Names resolve to overlay tunnels, not to IP addresses.',
        },
        {
            icon: 'FNGPR',
            title: 'No port inference',
            body: 'Single-port transport prevents service fingerprinting.',
        },
    ];
    return (
        <NetFoundryHorizontalSection>
            <section style={sectionStyle}>
                <h2>Why a long page</h2>
                <p>
                    A short page can't reproduce the bug. The anchor target has
                    to be far enough down that pre-hydration content height and
                    post-hydration content height differ by more than the viewport.
                </p>
                <div style={cardGrid}>
                    {features.map((f) => (
                        <div key={f.title} style={card}>
                            <div
                                style={{
                                    fontFamily: 'var(--ifm-font-family-monospace)',
                                    fontSize: '0.75rem',
                                    color: 'var(--ifm-color-emphasis-700)',
                                    letterSpacing: '0.1em',
                                }}
                            >
                                {f.icon}
                            </div>
                            <h3 style={{margin: '0.5rem 0'}}>{f.title}</h3>
                            <p style={{margin: 0}}>{f.body}</p>
                        </div>
                    ))}
                </div>
            </section>
        </NetFoundryHorizontalSection>
    );
}

function ClientOnlyShifter({windowSize}: {windowSize: WindowSize}) {
    const isWide = windowSize.width !== 0 && windowSize.width >= 850;
    return (
        <NetFoundryHorizontalSection>
            <section style={sectionStyle}>
                <h2>Hydration-time layout shifter</h2>
                <p>
                    The block below is the part that intentionally breaks
                    naive hash scrolling. During SSR the window doesn't exist,
                    so <code>windowSize.width</code> is <code>0</code>. On the
                    client, after hydration, the real window width is read and
                    a much taller variant is rendered. The deploy anchor below
                    moves down by hundreds of pixels in the process.
                </p>
                <div
                    style={{
                        marginTop: '1rem',
                        padding: '1.5rem',
                        borderRadius: 12,
                        border: '1px dashed var(--ifm-color-emphasis-300)',
                        background: 'var(--ifm-color-emphasis-100)',
                        minHeight: isWide ? 600 : 200,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        textAlign: 'center',
                    }}
                >
                    <div>
                        <strong>
                            {isWide
                                ? 'Wide-viewport variant (tall, ~600px)'
                                : 'Narrow / SSR variant (short, ~200px)'}
                        </strong>
                        <p style={{margin: '0.5rem 0 0'}}>
                            Detected width:{' '}
                            <code>{windowSize.width || 'SSR (0)'}</code>
                        </p>
                    </div>
                </div>
            </section>
        </NetFoundryHorizontalSection>
    );
}

function FillerSection({n}: {n: number}) {
    return (
        <NetFoundryHorizontalSection>
            <section style={sectionStyle}>
                <h2>Filler section {n}</h2>
                <p>
                    More vertical space so the anchor target sits well below
                    the initial viewport. This paragraph exists only to push
                    pixels around. There is nothing clever here.
                </p>
                <p>
                    If you find yourself reading this paragraph, you have
                    scrolled far enough that the bug repro is no longer the
                    interesting thing in front of you. Go check the deploy
                    anchor instead.
                </p>
                <ul>
                    <li>Pixel-pushing bullet one.</li>
                    <li>Pixel-pushing bullet two.</li>
                    <li>Pixel-pushing bullet three.</li>
                </ul>
            </section>
        </NetFoundryHorizontalSection>
    );
}

function DeployOverlaySection() {
    return (
        <div id="deploy-overlay" style={anchorTarget}>
            <NetFoundryHorizontalSection>
                <section style={sectionStyle}>
                    <h2>Deploy an overlay</h2>
                    <p>
                        This is the anchor target. When a cold tab opens
                        <code> /#deploy-overlay</code>, the heading above
                        should be at the top of the viewport (just under the
                        navbar) once hydration settles.
                    </p>
                    <div style={cardGrid}>
                        <div style={card}>
                            <h3>Managed SaaS</h3>
                            <p>
                                Cloud-hosted and fully operated. No infra to
                                manage. Mock destination -- this is the
                                test-site.
                            </p>
                            <a href="#" style={btnPrimary}>
                                Get started
                            </a>
                        </div>
                        <div style={card}>
                            <h3>Self-hosted, supported</h3>
                            <p>
                                You host it, we support it. Ideal when
                                regulated environments require local control.
                            </p>
                            <a href="#" style={btnPrimary}>
                                Talk to us
                            </a>
                        </div>
                        <div style={card}>
                            <h3>Community self-hosted</h3>
                            <p>
                                Roll your own with the docs and the community.
                                Best path for tinkering and OSS deployments.
                            </p>
                            <a href="/docs" style={btnPrimary}>
                                View quickstarts
                            </a>
                        </div>
                    </div>
                </section>
            </NetFoundryHorizontalSection>
        </div>
    );
}

function ModelsSection({windowSize}: {windowSize: WindowSize}) {
    const isWide = windowSize.width !== 0 && windowSize.width >= 850;
    const models = [
        {
            id: 'ztna',
            name: 'ZTNA',
            full: 'Zero Trust Network Access',
            body: 'Secures access to applications and services living in a trusted network zone.',
            bullets: [
                'Works with existing solutions via an OpenZiti Router',
                'Network firewall in deny-by-default mode',
                'OS firewalls keep inbound port rules per service',
            ],
        },
        {
            id: 'ztha',
            name: 'ZTHA',
            full: 'Zero Trust Host Access',
            body: 'Extends zero trust to host-level communication. The common production model.',
            bullets: [
                'Uses an OpenZiti Tunneler on the host',
                'Eliminates network-related trust',
                'Both network and OS firewalls in deny-by-default mode',
            ],
        },
        {
            id: 'ztaa',
            name: 'ZTAA',
            full: 'Zero Trust Application Access',
            body: 'The strongest posture. Applications hold their own cryptographic identity.',
            bullets: [
                'SDKs compiled into the application',
                'Process-to-process end-to-end encryption',
                'Trivializes multi-cloud and hybrid deployments',
            ],
        },
    ];
    return (
        <NetFoundryHorizontalSection>
            <section style={sectionStyle}>
                <h2>Three zero-trust models</h2>
                <p>
                    Three flavors with different tradeoffs. The cards below
                    also include client-conditional content (a side panel that
                    only shows on wide viewports), so they contribute to the
                    same hydration-time layout shift.
                </p>
                <div style={{display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.5rem'}}>
                    {models.map((m) => (
                        <div
                            key={m.id}
                            style={{
                                ...card,
                                display: 'grid',
                                gridTemplateColumns: isWide ? '1fr 220px' : '1fr',
                                gap: '1rem',
                                alignItems: 'center',
                            }}
                        >
                            <div>
                                <h3 style={{margin: 0}}>{m.name}</h3>
                                <p
                                    style={{
                                        margin: '0.25rem 0',
                                        color: 'var(--ifm-color-emphasis-700)',
                                    }}
                                >
                                    {m.full}
                                </p>
                                <p style={{margin: '0.5rem 0'}}>{m.body}</p>
                                <ul style={{margin: 0, paddingLeft: '1.25rem'}}>
                                    {m.bullets.map((b) => (
                                        <li key={b}>{b}</li>
                                    ))}
                                </ul>
                            </div>
                            {isWide && (
                                <div
                                    style={{
                                        height: 180,
                                        borderRadius: 8,
                                        background:
                                            'linear-gradient(135deg, var(--ifm-color-emphasis-100), var(--ifm-color-emphasis-200))',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontFamily:
                                            'var(--ifm-font-family-monospace)',
                                        color: 'var(--ifm-color-emphasis-700)',
                                    }}
                                >
                                    {m.id.toUpperCase()} diagram
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </section>
        </NetFoundryHorizontalSection>
    );
}

function CallToActionSection() {
    return (
        <NetFoundryHorizontalSection
            style={{
                ...heroStyle,
                padding: '4rem 2rem 5rem',
                background:
                    'linear-gradient(135deg, rgba(34,197,94,0.12), rgba(34,211,238,0.08))',
            }}
        >
            <div style={{maxWidth: 700, margin: '0 auto', textAlign: 'center'}}>
                <h2 style={{margin: 0}}>That's the end of the page</h2>
                <p style={{margin: '1rem 0 1.5rem'}}>
                    If you're seeing this and you came in from
                    <code> /#deploy-overlay</code>, scroll back up and confirm
                    the deploy section is parked at the top of the viewport.
                    If it isn't, the rehash fix isn't doing its job.
                </p>
                <a href="#deploy-overlay" style={btnPrimary}>
                    Re-test the anchor
                </a>
                <a href="/docs" style={btnGhost}>
                    Or skip to docs
                </a>
            </div>
        </NetFoundryHorizontalSection>
    );
}

export default function Home(): JSX.Element {
    const [windowSize, setWindowSize] = useState<WindowSize>(getWindowSize());
    useLayoutEffect(() => {
        function handleResize() {
            setWindowSize(getWindowSize());
        }
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <NetFoundryLayout
            title="Test Site"
            description="Long landing page for exercising the SPA cold-load anchor fix"
            starProps={{repoUrl: '', label: ''}}
        >
            <Head>
                <meta name="nf-pages-version" content="test-site-landing" />
            </Head>
            <HeroSection />
            <IntroSection />
            <FeatureGridSection />
            <ClientOnlyShifter windowSize={windowSize} />
            <FillerSection n={1} />
            <FillerSection n={2} />
            <DeployOverlaySection />
            <ModelsSection windowSize={windowSize} />
            <FillerSection n={3} />
            <CallToActionSection />
        </NetFoundryLayout>
    );
}
