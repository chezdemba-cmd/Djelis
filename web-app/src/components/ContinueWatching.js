import React, { useState, useEffect } from 'react';
import { authFetch } from '../lib/authClient';

export default function ContinueWatching({ currentProfile, type, onResume }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const handleResume = (item) => {
    if (!onResume) return;
    const content = item.content;
    onResume({
      id: content.id,
      contentId: content.id,
      episodeId: item.episode?.id || null,
      title: content.title,
      image: content.thumbnailUrl || '/assets/baobab.png',
      type: content.type,
      startAt: item.progressSeconds || 0,
    });
  };

  useEffect(() => {
    async function fetchHistory() {
      if (!currentProfile) return;

      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
        const res = await authFetch(`${baseUrl}/api/v1/stream/history?profile_id=${currentProfile.id}&type=${type}`);

        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
             setHistory(data);
          }
        }
      } catch (err) {
        console.error("Error fetching watch history:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchHistory();
  }, [currentProfile, type]);

  if (loading || history.length === 0) return null;

  return (
    <div className="continue-watching-section">
      <h2 className="section-title">
        <span className="material-icons-round" style={{ fontSize: '24px', marginRight: '8px', verticalAlign: 'middle', color: type === 'AUDIO' ? '#FFB300' : 'white' }}>
          {type === 'AUDIO' ? 'headphones' : 'play_circle'}
        </span>
        Continuer la lecture
      </h2>
      <div className="cw-scroll-container">
        {history.map((item) => {
          const content = item.content;
          const episode = item.episode;
          const progressPercent = content.type === 'VIDEO' ? Math.min(100, (item.progressSeconds / 7200) * 100) : Math.min(100, (item.progressSeconds / 300) * 100); // estimation basique
          
          return (
            <div
              key={item.id}
              className="cw-card tv-focusable"
              onClick={() => handleResume(item)}
              role="button"
              tabIndex={0}
            >
              <div className="cw-img-container">
                <img src={content.thumbnailUrl || '/assets/baobab.png'} alt={content.title} className="cw-img" />
                <div className="cw-play-overlay">
                  <span className="material-icons-round">play_arrow</span>
                </div>
                <div className="cw-progress-bar-bg">
                  <div className="cw-progress-bar-fill" style={{ width: `${progressPercent}%` }}></div>
                </div>
              </div>
              <div className="cw-info">
                <h3 className="cw-title">{content.title}</h3>
                {episode && <p className="cw-episode">S{episode.seasonNumber} E{episode.episodeNumber} - {episode.title}</p>}
                <p className="cw-time-left">Reste {Math.floor(item.progressSeconds / 60)} min</p>
              </div>
            </div>
          );
        })}
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .continue-watching-section {
          margin: 30px 0;
          padding: 0 4%;
        }
        .section-title {
          font-size: 22px;
          font-weight: bold;
          margin-bottom: 15px;
          display: flex;
          align-items: center;
        }
        .cw-scroll-container {
          display: flex;
          overflow-x: auto;
          gap: 20px;
          padding-bottom: 20px;
          scrollbar-width: none;
        }
        .cw-scroll-container::-webkit-scrollbar {
          display: none;
        }
        .cw-card {
          min-width: 280px;
          width: 280px;
          cursor: pointer;
          transition: transform 0.3s;
        }
        .cw-card:hover {
          transform: scale(1.05);
        }
        .cw-img-container {
          position: relative;
          width: 100%;
          aspect-ratio: 16/9;
          border-radius: 8px;
          overflow: hidden;
          background: #222;
        }
        .cw-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          opacity: 0.8;
          transition: 0.3s;
        }
        .cw-card:hover .cw-img {
          opacity: 1;
        }
        .cw-play-overlay {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: rgba(0,0,0,0.6);
          border-radius: 50%;
          width: 50px;
          height: 50px;
          display: flex;
          justify-content: center;
          align-items: center;
          opacity: 0;
          transition: 0.3s;
        }
        .cw-card:hover .cw-play-overlay {
          opacity: 1;
        }
        .cw-play-overlay span {
          color: white;
          font-size: 30px;
        }
        .cw-progress-bar-bg {
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          height: 4px;
          background: rgba(255,255,255,0.3);
        }
        .cw-progress-bar-fill {
          height: 100%;
          background: ${type === 'AUDIO' ? '#FFB300' : '#E50914'};
        }
        .cw-info {
          padding-top: 10px;
        }
        .cw-title {
          font-size: 16px;
          font-weight: 600;
          margin: 0 0 4px 0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .cw-episode, .cw-time-left {
          font-size: 13px;
          color: #aaa;
          margin: 0;
        }
      `}} />
    </div>
  );
}
