/**
 * Unsplash Image Search Service
 */

const ACCESS_KEY = (import.meta as any).env?.VITE_UNSPLASH_ACCESS_KEY || "v_L7_q_X_X_X_X_X_X_X_X_X_X_X_X_X_X_X_X_X_X"; // Placeholder

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
    const response = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&page=${page}&per_page=20&client_id=${ACCESS_KEY}`
    );
    
    if (!response.ok) {
      // Fallback to a public search if key is invalid/missing for demo purposes
      // Note: Unsplash doesn't really have a keyless search, so we'll just return empty or throw
      if (response.status === 401) {
        console.warn("Unsplash API key is missing or invalid. Please set VITE_UNSPLASH_ACCESS_KEY.");
        return [];
      }
      throw new Error(`Unsplash API error: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.results;
  } catch (error) {
    console.error("Error searching Unsplash:", error);
    return [];
  }
};
