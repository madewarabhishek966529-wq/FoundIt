import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { X, Search, Loader2, Sparkles, MapPin, Tag } from 'lucide-react';
import { searchByImage } from '../../api/matches.api';
import { ImageUploader } from './ImageUploader';

export const SearchByImageModal = ({ isOpen, onClose }) => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSearch = async () => {
    if (images.length === 0) {
      setError('Please select or drop an image to search');
      return;
    }

    setError('');
    setLoading(true);
    setHasSearched(false);

    try {
      const formData = new FormData();
      formData.append('image', images[0]);

      const response = await searchByImage(formData);
      setResults(response.data.matches || []);
      setHasSearched(true);
    } catch (err) {
      setError(
        err.response?.data?.error?.message ||
          'Failed to search by image. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setImages([]);
    setResults([]);
    setHasSearched(false);
    setError('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                Visual Search by Photo
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                CLIP neural search against all open found items
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 rounded-xl text-xs">
              {error}
            </div>
          )}

          {!hasSearched && (
            <div className="space-y-4">
              <p className="text-xs text-slate-600 dark:text-slate-300">
                Upload a photo of an item you lost (or a photo of a similar item). Our AI will compare its 512-dimensional visual vector to all reported found items.
              </p>
              <ImageUploader files={images} onChange={setImages} maxFiles={1} />

              <button
                type="button"
                onClick={handleSearch}
                disabled={loading || images.length === 0}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Analyzing Image Vector...</span>
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    <span>Search Similar Found Items</span>
                  </>
                )}
              </button>
            </div>
          )}

          {hasSearched && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  {results.length} Matching Found {results.length === 1 ? 'Item' : 'Items'}
                </span>
                <button
                  type="button"
                  onClick={handleReset}
                  className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Search with another photo
                </button>
              </div>

              {results.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {results.map(({ item, similarity }) => (
                    <Link
                      key={item._id || item.id}
                      to={`/items/${item._id || item.id}`}
                      onClick={onClose}
                      className="group flex gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 hover:border-blue-500 transition-all"
                    >
                      <div className="w-16 h-16 rounded-lg bg-slate-200 dark:bg-slate-800 overflow-hidden shrink-0">
                        {item.images && item.images.length > 0 ? (
                          <img
                            src={item.images[0].url}
                            alt={item.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                        ) : (
                          <Tag className="w-6 h-6 m-auto text-slate-400" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-blue-600 uppercase">
                            {item.category}
                          </span>
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                            {Math.round(similarity * 100)}% Match
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate group-hover:text-blue-600 transition-colors">
                          {item.title}
                        </h4>
                        <div className="flex items-center gap-1 text-[10px] text-slate-400">
                          <MapPin className="w-3 h-3" />
                          <span>{item.zone}</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-xs text-slate-500">
                  No similar items matched the uploaded photo.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
