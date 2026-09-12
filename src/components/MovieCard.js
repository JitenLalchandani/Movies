import React, { useState } from 'react';

function MovieCard({ movie, onClick }) {
  const [imgError, setImgError] = useState(false);

  return (
    <div className="movie-card" onClick={onClick}>
      <div className="card-poster-wrap">
        {!imgError && movie.poster ? (
          <img
            src={movie.poster}
            alt={movie.title}
            className="card-poster"
            onError={() => setImgError(true)}
          />
        ) : (
          <div style={fallback}>
            <span style={fallbackIcon}>🎬</span>
            <span style={fallbackTitle}>{movie.title}</span>
          </div>
        )}
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

const fallback = {
  width: '100%', height: '100%', background: 'linear-gradient(135deg, #1a1a2e, #16213e)',
  display: 'flex', flexDirection: 'column', alignItems: 'center',
  justifyContent: 'center', padding: '16px', gap: '12px',
};
const fallbackIcon = { fontSize: '40px' };
const fallbackTitle = { color: '#fff', fontSize: '13px', textAlign: 'center', fontWeight: '600', lineHeight: '1.4' };

export default MovieCard;
