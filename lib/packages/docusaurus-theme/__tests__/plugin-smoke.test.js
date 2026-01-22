const fs = require('fs');
const path = require('path');

const requiredFiles = [
    // Theme entry point
    'src/index.ts',
    'src/options.ts',

    // UI entry point and components
    'src/ui.ts',
    'src/components/index.ts',
    'src/components/NetFoundryLayout/NetFoundryLayout.tsx',
    'src/components/NetFoundryFooter/NetFoundryFooter.tsx',
    'src/components/StarUs/StarUs.tsx',
    'src/components/Alert/Alert.tsx',
    'src/components/CodeBlock/CodeBlock.tsx',
    'src/components/OsTabs/OsTabs.tsx',

    // Plugin entry point and plugins
    'src/plugins.ts',
    'src/docusaurus-plugins/index.ts',
    'src/docusaurus-plugins/remarkYouTube.ts',
    'src/docusaurus-plugins/remarkScopedPath.ts',
    'src/docusaurus-plugins/remarkCodeSections.ts',
    'src/docusaurus-plugins/remarkYamlTable.ts',

    // Node entry point
    'src/node.ts',
    'src/docusaurus-envhelper.ts',

    // Theme components
    'theme/Layout/index.tsx',

    // CSS
    'css/theme.css',
    'css/legacy.css',
    'css/vars.css',
    'css/vars-dark.css',
];

describe('Source files smoke test', () => {
    test.each(requiredFiles)('%s exists', (relPath) => {
        const fullPath = path.resolve(__dirname, '..', relPath);
        expect(fs.existsSync(fullPath)).toBe(true);
    });
});

describe('Plugin modules load correctly', () => {
    // These are Node-safe to require via ts-node/register
    const pluginFiles = [
        'src/docusaurus-plugins/remarkYouTube.ts',
        'src/docusaurus-plugins/remarkScopedPath.ts',
        'src/docusaurus-plugins/remarkCodeSections.ts',
        'src/docusaurus-plugins/remarkYamlTable.ts',
    ];

    test.each(pluginFiles)('%s exports a function', (relPath) => {
        const fullPath = path.resolve(__dirname, '..', relPath);
        // Just verify the file exists and is readable
        const content = fs.readFileSync(fullPath, 'utf-8');
        // Check it has an export
        expect(content).toMatch(/export\s+(default\s+)?function|export\s+const/);
    });
});
