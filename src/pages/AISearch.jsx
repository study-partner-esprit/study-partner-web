import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { aiAPI } from '../services/api';
import { useAuthStore } from '../store/authStore';
import { Search, Send, Globe, Clock, ExternalLink, Loader2, Sparkles, BookOpen, X } from 'lucide-react';

const AISearch = () => {
  const { user } = useAuthStore();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [searching, setSearching] = useState(false);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (user?._id) {
      aiAPI.searchHistory(user._id, 10)
        .then(res => {
          const data = res.data?.searches || res.data || [];
          setHistory(Array.isArray(data) ? data : []);
        })
        .catch(console.error);
    }
  }, [user?._id]);

  const handleSearch = async (e) => {
    e?.preventDefault();
    if (!query.trim() || searching) return;

    setSearching(true);
    setResults(null);
    setShowHistory(false);

    try {
      const res = await aiAPI.search({
        query: query.trim(),
        userId: user._id
      });
      setResults(res.data);
    } catch (err) {
      console.error('Search failed:', err);
      setResults({ error: 'Search failed. Please try again.' });
    } finally {
      setSearching(false);
    }
  };

  const loadFromHistory = (item) => {
    setQuery(item.query);
    setResults(item);
    setShowHistory(false);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
        <div className="inline-flex items-center gap-3 mb-3">
          <Sparkles className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold text-foreground">AI Search</h1>
        </div>
        <p className="text-muted-foreground">Search the web with AI-powered answers tailored to your studies</p>
      </motion.div>

      {/* Search Bar */}
      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        onSubmit={handleSearch}
        className="relative mb-8"
      >
        <div className="relative flex items-center">
          <Search className="absolute left-4 w-5 h-5 text-muted-foreground pointer-events-none" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => history.length > 0 && setShowHistory(true)}
            placeholder="Ask anything about your studies..."
            className="w-full pl-12 pr-14 py-4 rounded-2xl border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-lg"
          />
          <motion.button
            type="submit"
            disabled={!query.trim() || searching}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="absolute right-3 p-2 rounded-xl bg-primary text-primary-foreground disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {searching ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          </motion.button>
        </div>

        {/* History Dropdown */}
        <AnimatePresence>
          {showHistory && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-full left-0 right-0 mt-2 z-50 rounded-xl border border-border bg-card shadow-lg overflow-hidden"
            >
              <div className="flex items-center justify-between px-4 py-2 border-b border-border">
                <span className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                  <Clock className="w-3 h-3" /> Recent Searches
                </span>
                <button onClick={() => setShowHistory(false)} className="text-muted-foreground hover:text-foreground">
                  <X className="w-4 h-4" />
                </button>
              </div>
              {history.slice(0, 5).map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => loadFromHistory(item)}
                  className="w-full px-4 py-3 text-left text-sm text-foreground hover:bg-muted/50 transition-colors flex items-center gap-2 border-b border-border/50 last:border-0"
                >
                  <Search className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                  <span className="truncate">{item.query}</span>
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.form>

      {/* Loading State */}
      {searching && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Searching the web and generating your answer...</p>
        </motion.div>
      )}

      {/* Results */}
      {results && !searching && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          {results.error ? (
            <div className="p-6 rounded-2xl border border-red-500/30 bg-red-500/5 text-center">
              <p className="text-red-400">{results.error}</p>
            </div>
          ) : (
            <>
              {/* AI Answer */}
              {results.answer && (
                <div className="p-6 rounded-2xl border border-primary/30 bg-primary/5">
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="w-5 h-5 text-primary" />
                    <h3 className="font-semibold text-foreground">AI Answer</h3>
                  </div>
                  <div className="text-foreground whitespace-pre-wrap leading-relaxed">
                    {results.answer}
                  </div>
                </div>
              )}

              {/* Sources */}
              {results.sources && results.sources.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                    <Globe className="w-4 h-4" /> Sources
                  </h3>
                  <div className="grid gap-3">
                    {results.sources.map((source, idx) => (
                      <motion.a
                        key={idx}
                        href={source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.05 * idx }}
                        className="flex items-start gap-3 p-4 rounded-xl border border-border bg-card hover:border-primary/50 transition-colors group"
                      >
                        <div className="w-6 h-6 rounded bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground flex-shrink-0 mt-0.5">
                          {idx + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground group-hover:text-primary transition-colors truncate">
                            {source.title || source.url}
                          </p>
                          {source.snippet && (
                            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{source.snippet}</p>
                          )}
                          <p className="text-xs text-muted-foreground mt-1 truncate">{source.url}</p>
                        </div>
                        <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary flex-shrink-0 mt-1" />
                      </motion.a>
                    ))}
                  </div>
                </div>
              )}

              {/* Related Topics */}
              {results.relatedTopics && results.relatedTopics.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                    <BookOpen className="w-4 h-4" /> Related Topics
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {results.relatedTopics.map((topic, idx) => (
                      <button
                        key={idx}
                        onClick={() => { setQuery(topic); handleSearch(); }}
                        className="px-4 py-2 rounded-full border border-border text-sm text-foreground hover:bg-primary/10 hover:border-primary/50 transition-colors"
                      >
                        {topic}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </motion.div>
      )}

      {/* Empty State */}
      {!results && !searching && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center py-16"
        >
          <Globe className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-muted-foreground mb-2">Ready to search</h3>
          <p className="text-sm text-muted-foreground/70">Ask a question to get AI-powered answers from the web</p>
        </motion.div>
      )}
    </div>
  );
};

export default AISearch;
