import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = 'http://10.148.89.185:3000';

const NoImage = ({ title }) => (
  <div style={{ width:'100%', height:'100%', background:'linear-gradient(135deg,#1a1a2e,#16213e)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'12px', gap:'8px', minHeight:'180px' }}>
    <span style={{ fontSize:'28px' }}>🎬</span>
    <span style={{ color:'#fff', fontSize:'11px', textAlign:'center', fontWeight:'600', lineHeight:'1.4' }}>{title}</span>
  </div>
);

function TrailerModal({ trailerUrl, onClose }) {
  return (
    <div style={modal.overlay} onClick={onClose}>
      <div style={modal.box} onClick={e => e.stopPropagation()}>
        <button style={modal.close} onClick={onClose}>✕</button>
        <iframe
          src={`${trailerUrl}?autoplay=1`}
          title="Movie Trailer"
          style={modal.iframe}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    </div>
  );
}

const modal = {
  overlay: { position:'fixed', inset:0, background:'rgba(0,0,0,0.9)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center', padding:'16px' },
  box: { position:'relative', width:'100%', maxWidth:'900px', aspectRatio:'16/9', background:'#000', borderRadius:'12px', overflow:'hidden' },
  close: { position:'absolute', top:'12px', right:'12px', background:'rgba(0,0,0,0.7)', color:'#fff', border:'none', width:'36px', height:'36px', borderRadius:'50%', cursor:'pointer', fontSize:'16px', zIndex:1001 },
  iframe: { width:'100%', height:'100%', border:'none' },
};

function RecommendationCard({ movie, onClick }) {
  const [imgError, setImgError] = useState(false);
  return (
    <div onClick={onClick} style={{ cursor:'pointer', borderRadius:'8px', overflow:'hidden', flexShrink:0, width:'140px' }}>
      <div style={{ position:'relative', aspectRatio:'2/3', overflow:'hidden', borderRadius:'8px', marginBottom:'8px' }}>
        {!imgError && movie.poster
          ? <img src={movie.poster} alt={movie.title} style={{ width:'100%', height:'100%', objectFit:'cover' }} onError={() => setImgError(true)} />
          : <NoImage title={movie.title} />
        }
      </div>
      <p style={{ color:'#fff', fontSize:'12px', fontWeight:'600', marginBottom:'4px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{movie.title}</p>
      <p style={{ color:'#a0a0b0', fontSize:'11px' }}>{movie.year} {movie.imdb?.rating ? `· ⭐ ${movie.imdb.rating}` : ''}</p>
    </div>
  );
}

function MovieDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [movie, setMovie] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [trailer, setTrailer] = useState(null);
  const [showTrailer, setShowTrailer] = useState(false);
  const [loadingTrailer, setLoadingTrailer] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    setMovie(null);
    setRecommendations([]);
    setTrailer(null);

    axios.get(`${API_URL}/movies/${id}`)
      .then(res => {
        const movieData = res.data;
        setMovie(movieData);

        // Fetch trailer
        setLoadingTrailer(true);
        const title = encodeURIComponent(movieData.title);
        const year = movieData.year;
        return Promise.all([
          axios.post(`${API_URL}/recommendations`, { movieId: id }),
          axios.get(`${API_URL}/trailers/${title}/${year}`)
        ]);
      })
      .then(([recRes, trailerRes]) => {
        setRecommendations(recRes.data.recommendations || []);
        setTrailer(trailerRes.data.trailer);
        setLoadingTrailer(false);
      })
      .catch(err => { console.error(err); setLoadingTrailer(false); });
  }, [id]);

  if (!movie) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', background:'#0a0a0f' }}>
      <div style={{ width:40, height:40, border:'3px solid rgba(255,255,255,0.1)', borderTopColor:'#e50914', borderRadius:'50%', animation:'spin 0.8s linear infinite' }} />
    </div>
  );

  return (
    <div style={{ minHeight:'100vh', background:'#0a0a0f', color:'#fff', fontFamily:'Inter, sans-serif', position:'relative' }}>
      {/* Backdrop */}
      <div style={{ position:'fixed', inset:0, backgroundImage:`url(${movie.poster})`, backgroundSize:'cover', backgroundPosition:'center', filter:'blur(20px) brightness(0.3)', transform:'scale(1.1)', zIndex:0 }} />
      <div style={{ position:'fixed', inset:0, background:'linear-gradient(to bottom, rgba(10,10,15,0.5), rgba(10,10,15,0.95))', zIndex:1 }} />

      {/* Trailer Modal */}
      {showTrailer && trailer && <TrailerModal trailerUrl={trailer.url} onClose={() => setShowTrailer(false)} />}

      {/* Back Button */}
      <button onClick={() => navigate(-1)} style={{ position:'relative', zIndex:2, margin:'24px 48px', background:'rgba(255,255,255,0.1)', color:'#fff', border:'1px solid rgba(255,255,255,0.2)', padding:'10px 20px', borderRadius:'6px', cursor:'pointer', fontSize:'14px', display:'inline-block' }}>
        ← Back
      </button>

      {/* Main Content */}
      <div className="detail-content" style={{ position:'relative', zIndex:2, display:'flex', gap:'48px', padding:'0 48px 48px', flexWrap:'wrap' }}>
        <div style={{ flexShrink:0, display:'flex', justifyContent:'center' }}>
          {movie.poster
            ? <img className="detail-poster" src={movie.poster} alt={movie.title} style={{ width:'280px', borderRadius:'12px', boxShadow:'0 20px 60px rgba(0,0,0,0.8)', display:'block' }} onError={(e) => e.target.style.display='none'} />
            : <div style={{ width:'280px', height:'420px', background:'linear-gradient(135deg,#1a1a2e,#16213e)', borderRadius:'12px', display:'flex', alignItems:'center', justifyContent:'center' }}><span style={{ fontSize:'48px' }}>🎬</span></div>
          }
        </div>

        <div style={{ flex:1, minWidth:'260px', paddingTop:'8px' }}>
          <p style={{ fontSize:'12px', letterSpacing:'3px', textTransform:'uppercase', color:'#e50914', marginBottom:'12px' }}>{movie.year} · {movie.rated}</p>
          <h1 className="detail-title" style={{ fontFamily:'Bebas Neue, sans-serif', fontSize:'64px', lineHeight:1, marginBottom:'20px' }}>{movie.title}</h1>

          <div style={{ display:'flex', gap:'8px', flexWrap:'wrap', marginBottom:'24px' }}>
            {movie.genres?.map(g => <span key={g} style={{ padding:'4px 14px', borderRadius:'20px', border:'1px solid rgba(255,255,255,0.2)', fontSize:'12px', color:'#a0a0b0' }}>{g}</span>)}
          </div>

          <div className="detail-stats" style={{ display:'flex', gap:'32px', marginBottom:'28px', padding:'20px 0', borderTop:'1px solid rgba(255,255,255,0.08)', borderBottom:'1px solid rgba(255,255,255,0.08)' }}>
            {movie.imdb?.rating && (
              <div style={{ display:'flex', flexDirection:'column', gap:'4px' }}>
                <span style={{ fontSize:'22px', fontWeight:'600' }}>⭐ {movie.imdb.rating}</span>
                <span style={{ fontSize:'11px', color:'#a0a0b0', textTransform:'uppercase', letterSpacing:'1px' }}>IMDB Rating</span>
              </div>
            )}
            {movie.runtime && (
              <div style={{ display:'flex', flexDirection:'column', gap:'4px' }}>
                <span style={{ fontSize:'22px', fontWeight:'600' }}>{movie.runtime}m</span>
                <span style={{ fontSize:'11px', color:'#a0a0b0', textTransform:'uppercase', letterSpacing:'1px' }}>Runtime</span>
              </div>
            )}
            {movie.imdb?.votes && (
              <div style={{ display:'flex', flexDirection:'column', gap:'4px' }}>
                <span style={{ fontSize:'22px', fontWeight:'600' }}>{(movie.imdb.votes/1000).toFixed(0)}K</span>
                <span style={{ fontSize:'11px', color:'#a0a0b0', textTransform:'uppercase', letterSpacing:'1px' }}>Votes</span>
              </div>
            )}
          </div>

          {/* Trailer Button */}
          <div style={{ display:'flex', gap:'12px', marginBottom:'24px', flexWrap:'wrap' }}>
            {loadingTrailer ? (
              <button style={{ ...btnStyle, background:'rgba(255,255,255,0.1)', cursor:'wait' }}>🎬 Loading Trailer...</button>
            ) : trailer ? (
              <button style={btnStyle} onClick={() => setShowTrailer(true)}>▶ Watch Trailer</button>
            ) : (
              <button style={{ ...btnStyle, background:'rgba(255,255,255,0.1)', cursor:'not-allowed' }}>🎬 No Trailer Available</button>
            )}
          </div>

          <p style={{ color:'#ccc', lineHeight:'1.7', fontSize:'15px', marginBottom:'28px' }}>{movie.fullplot || movie.plot}</p>

          {movie.directors?.length > 0 && (
            <div style={{ display:'flex', gap:'16px', marginBottom:'12px', fontSize:'14px' }}>
              <span style={{ color:'#a0a0b0', minWidth:'70px' }}>Director</span>
              <span>{movie.directors.join(', ')}</span>
            </div>
          )}
          {movie.cast?.length > 0 && (
            <div style={{ display:'flex', gap:'16px', marginBottom:'12px', fontSize:'14px' }}>
              <span style={{ color:'#a0a0b0', minWidth:'70px' }}>Cast</span>
              <span>{movie.cast.slice(0,5).join(', ')}</span>
            </div>
          )}
          {movie.awards?.text && (
            <div style={{ marginTop:'20px', color:'#f5a623', fontSize:'14px', padding:'12px 16px', background:'rgba(245,166,35,0.1)', borderRadius:'6px', borderLeft:'3px solid #f5a623' }}>
              🏆 {movie.awards.text}
            </div>
          )}
        </div>
      </div>

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <div className="detail-rec" style={{ position:'relative', zIndex:2, padding:'0 48px 64px' }}>
          <h2 style={{ fontFamily:'Bebas Neue, sans-serif', fontSize:'24px', letterSpacing:'2px', marginBottom:'20px' }}>🎬 You Might Also Like</h2>
          <div className="detail-rec-row" style={{ display:'flex', gap:'16px', overflowX:'auto', paddingBottom:'12px', scrollbarWidth:'none' }}>
            {recommendations.map(rec => (
              <RecommendationCard key={rec._id} movie={rec} onClick={() => navigate(`/movies/${rec._id}`)} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

const btnStyle = {
  background:'#e50914', color:'#fff', border:'none',
  padding:'12px 28px', borderRadius:'6px', fontSize:'15px',
  fontWeight:'600', cursor:'pointer', fontFamily:'Inter, sans-serif',
};

export default MovieDetail;
