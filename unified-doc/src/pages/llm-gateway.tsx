// Redirects the bare /docs/llm-gateway route to /docs/llm-gateway/intro.
import type {ReactNode} from 'react';
import {Redirect} from '@docusaurus/router';
import useBaseUrl from '@docusaurus/useBaseUrl';

export default function LlmGatewayRedirect(): ReactNode {
    return <Redirect to={useBaseUrl('/docs/llm-gateway/intro')} />;
}
