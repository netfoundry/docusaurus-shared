// Redirects the bare /docs/mcp-gateway route to /docs/mcp-gateway/intro.
import type {ReactNode} from 'react';
import {Redirect} from '@docusaurus/router';
import useBaseUrl from '@docusaurus/useBaseUrl';

export default function McpGatewayRedirect(): ReactNode {
    return <Redirect to={useBaseUrl('/docs/mcp-gateway/intro')} />;
}
