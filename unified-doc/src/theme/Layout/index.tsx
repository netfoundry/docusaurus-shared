import React, {type ReactNode} from 'react';
import {NetFoundryLayout, NetFoundryLayoutProps, StarUsProps} from '@netfoundry/docusaurus-theme/ui';
import {useLocation} from "@docusaurus/router";
import {unifiedFooter} from "@site/src/components/footer";
import {frontdoorFooter} from "@frontdoor/src/components/footer";
import {onpremFooter} from "@selfhosted/src/components/footer";
import {zlanFooter} from "@zlan/src/components/footer";
import {openZitiFooter} from "@openziti/src/components/footer";
import {zrokFooter} from "@zrok/src/components/footer";
import {platformFooter} from "@platform/src/components/footer";

const matchPath = (p: string, segment: string) =>
    p.startsWith(`/${segment}`) || p.startsWith(`/docs/${segment}`);

const mapFooter = (p: string) => {
    if (matchPath(p, 'frontdoor')) return frontdoorFooter;
    if (matchPath(p, 'selfhosted')) return onpremFooter;
    if (matchPath(p, 'openziti')) return openZitiFooter;
    if (matchPath(p, 'zlan')) return zlanFooter;
    if (matchPath(p, 'zrok')) return zrokFooter;
    if (matchPath(p, 'platform')) return platformFooter;
    return unifiedFooter;
};

export default function LayoutWrapper(props: NetFoundryLayoutProps): ReactNode {
    const {pathname} = useLocation();
    const isApiPage = /(api-reference|openapi-reference)$/.test(pathname);
    let starProps: StarUsProps | undefined;
    if (matchPath(pathname, 'openziti')) {
        starProps = {
            repoUrl: 'https://github.com/openziti/ziti',
            label: 'Star OpenZiti on GitHub',
        };
    } else if (matchPath(pathname, 'zrok')) {
        starProps = {
            repoUrl: 'https://github.com/openziti/zrok',
            label: 'Star zrok on GitHub',
        };
    }
    const footerToShow = mapFooter(pathname);
    return (
        <NetFoundryLayout footerProps={footerToShow} starProps={starProps} >
            {isApiPage && (
                <div style={{
                    height: '40px',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '0 1rem',
                    borderBottom: '1px solid var(--ifm-hr-border-color)',
                    background: 'var(--ifm-navbar-background-color)',
                }}>
                    <button onClick={() => { if (typeof window !== 'undefined') window.history.back(); }} style={{ fontSize: '0.875rem', color: 'var(--ifm-color-primary)', textDecoration: 'none', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>← Back to docs</button>
                </div>
            )}
            {props.children}
        </NetFoundryLayout>
    );
}
