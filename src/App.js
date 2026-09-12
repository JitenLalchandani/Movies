import React, { useEffect, useState, useCallback } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import axios from 'axios';
import MovieDetail from './components/MovieDetail';
import './App.css';

const GENRES = ['Action', 'Comedy', 'Drama', 'Horror', 'Romance', 'Thriller', 'Animation', 'Western', 'Short'];

const NoImage = ({ title }) => (
  <div style={{ width:'100%', height:'100%', background:'linear-gradient(135deg,#1a1a2e,#16213e)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'16px', gap:'12px' }}>
    <span style={{ fontSize:'36px' }}>🎬</span>
    <span style={{ color:'#fff', fontSize:'12px', textAlign:'center', fontWeight:'600', lineHeight:'1.4' }}>{title}</span>
  </div>
);

function MovieCard({ movie, onClick }) {
  const [imgError, setImgError] = useState(false);
  return (
    <div className="movie-card" onClick={onClick}>
      <div className="card-poster-wrap">
        {!imgError && movie.poster
          ? <img src={movie.poster} alt={movie.title} className="card-poster" onError={() => setImgError(true)} />
          : <NoImage title={movie.title} />
        }
        <div className="card-overlay">
          <button className="card-play">▶</button>
          <p className="card-overlay-title">{movie.title}</p>
          <p className="card-overlay-meta">{movie.year} · {movie.genres?.slice(0,2).join(', ')}</p>
        </div>
      </div>
      {movie.imdb?.rating && <div className="card-badge">⭐ {movie.imdb.rating}</div>}
    </div>
  );
}

function Home({ darkMode, setDarkMode }) {
  const [movies, setMovies] = useState([]);
  const [featured, setFeatured] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [genre, setGenre] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState({ minYear: '', maxYear: '', minRating: '', maxRating: '', sortBy: 'default' });
  const [appliedFilters, setAppliedFilters] = useState({ minYear: '', maxYear: '', minRating: '', maxRating: '', sortBy: 'default' });
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const fetchMovies = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (genre) params.append('genre', genre);
    if (appliedFilters.minYear) params.append('minYear', appliedFilters.minYear);
    if (appliedFilters.maxYear) params.append('maxYear', appliedFilters.maxYear);
    if (appliedFilters.minRating) params.append('minRating', appliedFilters.minRating);
    if (appliedFilters.maxRating) params.append('maxRating', appliedFilters.maxRating);
    if (appliedFilters.sortBy) params.append('sortBy', appliedFilters.sortBy);
    params.append('limit', '20');
    params.append('page', page);

    axios.get(`http://10.148.89.185:3000/movies?${params}`)
      .then(res => {
        const data = res.data;
        setMovies(data.movies || []);
        setTotal(data.total || 0);
        setTotalPages(data.pages || 1);
        if (!featured && data.movies?.length > 0) {
          const withPlot = data.movies.filter(m => m.fullplot && m.poster);
          setFeatured(withPlot[0] || data.movies[0]);
        }
        setLoading(false);
      })
      .catch(err => { console.error(err); setLoading(false); });
  }, [search, genre, appliedFilters, page]);

  useEffect(() => {
    const timer = setTimeout(fetchMovies, 400);
    return () => clearTimeout(timer);
  }, [fetchMovies]);

  const handleApplyFilters = () => { setAppliedFilters({ ...filters }); setPage(1); setShowFilters(false); };
  const handleResetFilters = () => {
    const empty = { minYear: '', maxYear: '', minRating: '', maxRating: '', sortBy: 'default' };
    setFilters(empty); setAppliedFilters(empty); setPage(1);
  };

  const topRated = [...movies].sort((a, b) => (b.imdb?.rating || 0) - (a.imdb?.rating || 0)).slice(0, 5);
  const hasActiveFilters = Object.values(appliedFilters).some(v => v && v !== 'default');

  return (
    <div className={`app ${darkMode ? '' : 'light-mode'}`}>
      {/* Navbar */}
      <nav className={`navbar ${scrolled ? 'navbar-scrolled' : ''}`}>
        <div className="navbar-brand">🎬 FILMVAULT</div>
        <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
          <input className="search-input" placeholder="Search movies..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
          <button className={`filter-toggle ${showFilters || hasActiveFilters ? 'active' : ''}`} onClick={() => setShowFilters(!showFilters)}>
            {hasActiveFilters ? '🔽 Filtered' : '🔽 Filter'}
          </button>
          <button className="theme-toggle" onClick={() => setDarkMode(!darkMode)}>
            {darkMode ? '☀️' : '🌙'}
          </button>
        </div>
      </nav>

      {/* Hero */}
      {featured && !search && !genre && !hasActiveFilters && (
        <div className="hero" style={{ backgroundImage: `url(${featured.poster})` }}>
          <div className="hero-overlay" />
          <div className="hero-content">
            <p className="hero-eyebrow">Featured Film</p>
            <h1 className="hero-title">{featured.title}</h1>
            <div className="hero-meta">
              <span className="hero-year">{featured.year}</span>
              {featured.imdb?.rating && <span className="hero-rating">⭐ {featured.imdb.rating}</span>}
              <span className="hero-genres">{featured.genres?.slice(0, 2).join(' · ')}</span>
            </div>
            <p className="hero-plot">{featured.fullplot?.slice(0, 180)}...</p>
            <div className="hero-buttons">
              <button className="btn-play" onClick={() => navigate(`/movies/${featured._id}`)}>▶ Watch Now</button>
              <button className="btn-info" onClick={() => navigate(`/movies/${featured._id}`)}>ℹ More Info</button>
            </div>
          </div>
        </div>
      )}

      {/* Advanced Filter Panel */}
      {showFilters && (
        <div className="search-panel">
          <p className="search-panel-title">Advanced Filters</p>
          <div className="search-panel-grid">
            <div className="filter-group">
              <label className="filter-label">Year Range</label>
              <div className="filter-row">
                <input className="filter-input" placeholder="From" type="number" min="1900" max="2026" value={filters.minYear} onChange={e => setFilters({...filters, minYear: e.target.value})} />
                <input className="filter-input" placeholder="To" type="number" min="1900" max="2026" value={filters.maxYear} onChange={e => setFilters({...filters, maxYear: e.target.value})} />
              </div>
            </div>
            <div className="filter-group">
              <label className="filter-label">IMDB Rating</label>
              <div className="filter-row">
                <input className="filter-input" placeholder="Min" type="number" min="0" max="10" step="0.1" value={filters.minRating} onChange={e => setFilters({...filters, minRating: e.target.value})} />
                <input className="filter-input" placeholder="Max" type="number" min="0" max="10" step="0.1" value={filters.maxRating} onChange={e => setFilters({...filters, maxRating: e.target.value})} />
              </div>
            </div>
            <div className="filter-group">
              <label className="filter-label">Sort By</label>
              <select className="filter-select" value={filters.sortBy} onChange={e => setFilters({...filters, sortBy: e.target.value})}>
                <option value="default">Default</option>
                <option value="rating_desc">⭐ Highest Rated</option>
                <option value="rating_asc">⭐ Lowest Rated</option>
                <option value="year_desc">📅 Newest First</option>
                <option value="year_asc">📅 Oldest First</option>
                <option value="title_asc">🔤 A → Z</option>
              </select>
            </div>
          </div>
          <div className="search-panel-actions">
            <button className="btn-apply" onClick={handleApplyFilters}>Apply Filters</button>
            <button className="btn-reset" onClick={handleResetFilters}>Reset</button>
          </div>
        </div>
      )}

      {/* Genre Pills */}
      <div className="genre-section">
        <div className="genre-pills">
          <button className={genre === '' ? 'pill pill-active' : 'pill'} onClick={() => { setGenre(''); setPage(1); }}>All</button>
          {GENRES.map(g => (
            <button key={g} className={genre === g ? 'pill pill-active' : 'pill'} onClick={() => { setGenre(g); setPage(1); }}>{g}</button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="loading"><div className="spinner" /><p>Loading movies...</p></div>
      ) : (
        <div className="content">
          {!search && !genre && !hasActiveFilters && (
            <section className="movie-section">
              <h2 className="section-title">🏆 Top Rated</h2>
              <div className="movie-row">
                {topRated.map(movie => (
                  <MovieCard key={movie._id} movie={movie} onClick={() => navigate(`/movies/${movie._id}`)} />
                ))}
              </div>
            </section>
          )}

          <section className="movie-section">
            <h2 className="section-title">
              {search ? `Results for "${search}" (${total})` : genre ? `${genre} Movies (${total})` : `🎬 All Movies (${total})`}
            </h2>
            {movies.length === 0 ? (
              <p className="no-results">No movies found. Try different filters.</p>
            ) : (
              <>
                <div className="movie-grid">
                  {movies.map(movie => (
                    <MovieCard key={movie._id} movie={movie} onClick={() => navigate(`/movies/${movie._id}`)} />
                  ))}
                </div>

                {/* Pagination */}
                <div className="pagination">
                  <button className="page-btn" onClick={() => setPage(p => Math.max(1, p-1))} disabled={page === 1}>←</button>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const p = page <= 3 ? i + 1 : page - 2 + i;
                    if (p < 1 || p > totalPages) return null;
                    return <button key={p} className={`page-btn ${page === p ? 'active' : ''}`} onClick={() => setPage(p)}>{p}</button>;
                  })}
                  <button className="page-btn" onClick={() => setPage(p => Math.min(totalPages, p+1))} disabled={page === totalPages}>→</button>
                  <span className="page-info">Page {page} of {totalPages}</span>
                </div>
              </>
            )}
          </section>
        </div>
      )}

      <footer className="footer"><p>🎬 FILMVAULT · Built with React + MongoDB Atlas</p></footer>
    </div>
  );
}

function App() {
  const [darkMode, setDarkMode] = useState(true);
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home darkMode={darkMode} setDarkMode={setDarkMode} />} />
        <Route path="/movies/:id" element={<MovieDetail />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
