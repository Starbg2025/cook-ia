/**
 * Unsplash Image Search Service
 */

const getAccessKey = () => {
  return (import.meta as any).env?.VITE_UNSPLASH_ACCESS_KEY || "";
};

export interface UnsplashImage {
  id: string;
  urls: {
    regular: string;
    small: string;
    thumb: string;
  };
  alt_description: string;
  user: {
    name: string;
    links: {
      html: string;
    };
  };
}

export const searchImages = async (query: string, page: number = 1): Promise<UnsplashImage[]> => {
  try {
    // 1. First try the server proxy route
    const key = getAccessKey();
    const proxyRes = await fetch(`/api/unsplash/search?query=${encodeURIComponent(query)}&page=${page}`, {
      headers: key ? { 'x-unsplash-key': key } : {}
    });

    if (proxyRes.ok) {
      const data = await proxyRes.json();
      if (data && data.results) {
        return data.results;
      }
    }

    // 2. Direct fallback if proxy is unavailable but key is defined in client
    if (key) {
      const response = await fetch(
        `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&page=${page}&per_page=20&client_id=${key}`
      );
      if (response.ok) {
        const data = await response.json();
        return data.results || [];
      }
    }

    return [];
  } catch (error) {
    console.error("Error searching Unsplash:", error);
    return [];
  }
};

