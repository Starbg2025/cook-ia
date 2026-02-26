import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Search, Loader2, ExternalLink, Image as ImageIcon } from 'lucide-react';
import { searchImages, UnsplashImage } from '../services/unsplashService';

interface ImageSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (imageUrl: string) => void;
}

export const ImageSearchModal: React.FC<ImageSearchModalProps> = ({
  isOpen,
  onClose,
  onSelect,
}) => {
  const [query, setQuery] = useState('');
  const [images, setImages] = useState<UnsplashImage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;

    setIsLoading(true);
    setHasSearched(true);
    try {
      const results = await searchImages(query);
      setImages(results);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && !hasSearched) {
      // Optional: load some default images
      setQuery('modern web design');
      handleSearch();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/90 backdrop-blur-md"
      />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-4xl bg-[#141414] rounded-[2.5rem] border border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
      >
        {/* Header */}
        <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-orange-primary/20 flex items-center justify-center">
              <ImageIcon size={20} className="text-orange-primary" />
            </div>
            <div>
              <h2 className="text-sm font-black uppercase tracking-widest">Unsplash Library</h2>
              <p className="text-[9px] text-white/30 uppercase tracking-widest font-bold">Professional high-res assets</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/5 rounded-xl text-white/30 hover:text-white transition-all"
          >
            <X size={20} />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-6 border-b border-white/5">
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for anything (e.g. 'minimalist office', 'abstract tech')..."
              className="w-full bg-[#0A0A0A] border border-white/5 rounded-2xl py-4 pl-12 pr-32 text-sm focus:outline-none focus:border-orange-primary/40 transition-all"
            />
            <button
              type="submit"
              disabled={isLoading}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-orange-primary text-white px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
            >
              {isLoading ? <Loader2 size={14} className="animate-spin" /> : 'Search'}
            </button>
          </form>
        </div>

        {/* Results Grid */}
        <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
          {isLoading && images.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center gap-4">
              <Loader2 size={40} className="text-orange-primary animate-spin" />
              <p className="text-[10px] text-white/20 uppercase tracking-[0.3em] font-bold">Curating assets...</p>
            </div>
          ) : images.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {images.map((img) => (
                <motion.div
                  key={img.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ y: -5 }}
                  className="group relative aspect-[4/3] rounded-2xl overflow-hidden cursor-pointer border border-white/5"
                  onClick={() => onSelect(img.urls.regular)}
                >
                  <img 
                    src={img.urls.small} 
                    alt={img.alt_description}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                    <p className="text-[9px] text-white/60 font-medium truncate">by {img.user.name}</p>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-[10px] text-white font-bold uppercase tracking-widest">Select Image</span>
                      <ExternalLink size={12} className="text-white/40" />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : hasSearched ? (
            <div className="h-64 flex flex-col items-center justify-center gap-4 text-white/20">
              <ImageIcon size={40} className="opacity-10" />
              <p className="text-[10px] uppercase tracking-[0.3em] font-bold">No assets found for "{query}"</p>
            </div>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center gap-4 text-white/20">
              <Search size={40} className="opacity-10" />
              <p className="text-[10px] uppercase tracking-[0.3em] font-bold">Start searching for professional photos</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/5 bg-white/[0.01] flex justify-center">
          <p className="text-[8px] text-white/10 uppercase tracking-widest font-medium">
            Powered by Unsplash API • High-resolution professional photography
          </p>
        </div>
      </motion.div>
    </div>
  );
};
