import { useState, useEffect } from "react";
import { getCatalog, searchCatalog } from "../data/catalog";

export default function SearchScreen() {
  const [query, setQuery] = useState("");
  const [allData, setAllData] = useState([]);
  const [results, setResults] = useState([]);
  const isSearching = query.trim().length > 0;

  useEffect(() => {
    const loadData = async () => {
      const data = await getCatalog();
      setAllData(data);
    };
    loadData();
  }, []);

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length === 0) {
      setResults([]);
      return;
    }

    let cancelled = false;
    const timer = setTimeout(async () => {
      const apiResults = await searchCatalog(trimmed);
      if (cancelled) return;
      if (apiResults) {
        setResults(apiResults);
      } else {
        // Backend indisponible: repli sur un filtrage local du catalogue déjà chargé.
        setResults(allData.filter(item =>
          item.title.toLowerCase().includes(trimmed.toLowerCase()) ||
          item.synopsis?.toLowerCase().includes(trimmed.toLowerCase())
        ));
      }
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query, allData]);

  return (
    <div id="page-search" className="app-page active" style={{ width: "100%", height: "100%" }}>
      <div className="search-page-container">
        <div className="search-bar-field">
          <span className="material-icons-round">search</span>
          <input 
            type="text" 
            placeholder="Rechercher des films, séries, musiques..." 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        
        {!isSearching && (
          <div className="search-genres-grid">
            <h3>Parcourir les catégories</h3>
            <div className="genres-list">
              <div className="genre-bubble tv-focusable">Films</div>
              <div className="genre-bubble tv-focusable">Séries</div>
              <div className="genre-bubble tv-focusable">Podcasts</div>
              <div className="genre-bubble tv-focusable">Documentaires</div>
              <div className="genre-bubble tv-focusable">Théâtre</div>
              <div className="genre-bubble tv-focusable">Humour</div>
            </div>
          </div>
        )}
        
        {isSearching && (
          <div className="search-page-results">
            {results.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '16px' }}>
                {results.map(item => (
                  <div key={item.id} className="media-card tv-focusable">
                    <div className="card-image" style={{ backgroundImage: `url(${item.image || item.poster_url})` }}>
                      <div className="card-play-overlay">
                        <span className="material-icons-round">play_circle_filled</span>
                      </div>
                    </div>
                    <div className="card-title">{item.title}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: "center", marginTop: "40px", color: "var(--text-secondary)" }}>
                Aucun résultat pour &quot;{query}&quot;
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
