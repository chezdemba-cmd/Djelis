export default function SearchScreen() {
  return (
    <div id="page-search" className="app-page active" style={{ width: "100%", height: "100%" }}>
      <div className="search-page-container">
        <div className="search-bar-field">
          <span className="material-icons-round">search</span>
          <input type="text" placeholder="Rechercher des films, séries, musiques..." id="search-input-page" />
        </div>
        
        <div className="search-genres-grid" id="search-genres-grid">
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
        
        <div className="search-page-results" id="search-page-results"></div>
      </div>
    </div>
  );
}
