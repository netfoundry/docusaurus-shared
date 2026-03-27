import React, { createContext, useState, useContext, useEffect } from 'react';

export interface ReleaseAsset {
    name: string;
    url: string;
    arch: string;
}

const AssetsContext = createContext<ReleaseAsset[]>([]);

export const useAssets = () => useContext(AssetsContext);

interface AssetsProviderProps {
    repoUrl: string;
    children: React.ReactNode;
}

export const AssetsProvider: React.FC<AssetsProviderProps> = ({ repoUrl, children }) => {
    const [assets, setAssets] = useState<ReleaseAsset[]>([]);

    useEffect(() => {
        const fetchReleaseAssets = async () => {
            try {
                const response = await fetch(repoUrl);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                const filteredAssets: ReleaseAsset[] = data.assets.map((asset: any) => ({
                    name: asset.name,
                    url: asset.browser_download_url,
                    arch: asset.name.replace(/\.tar\.gz/, '').split('_')[3]
                }));
                console.log("Fetched assets:", filteredAssets);
                setAssets(filteredAssets);
            } catch (error) {
                console.error('Error fetching the release assets:', error);
            }
        };

        fetchReleaseAssets();
    }, [repoUrl]);

    return (
        <AssetsContext.Provider value={assets}>
            {children}
        </AssetsContext.Provider>
    );
};
