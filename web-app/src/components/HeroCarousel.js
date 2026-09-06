"use client";

import { useState, useEffect, useRef, useCallback } from "react";

export default function HeroCarousel({
  items = [],
  onPlay,
  onOpenDetails,
  mediaType = "video", // "video" | "audio"
  autoPlayInterval = 6000,
}) {
  // Limite aux 10 dernières publications
  const carouselItems = items.slice(0, 10);
  const count = carouselItems.length;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef(null);

  // Réinitialise l'index si la liste d'éléments change (ex: changement d'onglet)
  useEffect(() => {
    setCurrentIndex(0);
  }, [items]);

  const nextSlide = useCallback(() => {
    if (count <= 1) return;
    setCurrentIndex((prev) => (prev + 1) % count);
  }, [count]);

  const prevSlide = useCallback(() => {
    if (count <= 1) return;
    setCurrentIndex((prev) => (prev - 1 + count) % count);
  }, [count]);

  // Défilement automatique
  useEffect(() => {
    if (count <= 1 || isPaused) return undefined;

    timerRef.current = setInterval(() => {
      nextSlide();
    }, autoPlayInterval);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [count, isPaused, autoPlayInterval, nextSlide]);

  if (!carouselItems || carouselItems.length === 0) {
    return null;
  }

  const currentItem = carouselItems[currentIndex] || carouselItems[0];
  const isVideo = mediaType === "video" || currentItem.isClip || currentItem.youtubeId;

  return (
    <div
      className="hero-carousel-container"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      role="region"
      aria-label="Dernières publications"
    >
      {/* Arrière-plans superposés avec transition crossfade fluide */}
      {carouselItems.map((item, idx) => {
        const bg = item.bannerUrl || item.image || "/assets/empire_mali.png";
        return (
          <div
            key={item.id || idx}
            className={`hero-carousel-slide-bg ${idx === currentIndex ? "active" : ""}`}
            style={{ backgroundImage: `url('${bg}')` }}
            aria-hidden={idx !== currentIndex}
          />
        );
      })}

      {/* Vignettes & Gradients cinématiques */}
      <div className="hero-carousel-vignette-left" />
      <div className="hero-carousel-vignette-bottom" />
      <div className="hero-carousel-vignette-top" />

      {/* Contenu textuel et boutons */}
      <div className="hero-carousel-content" key={currentItem.id || currentIndex}>
        <div className="hero-carousel-badge-row">
          <span className="hero-carousel-badge">
            {currentItem.isClip
              ? "CLIP VIDÉO"
              : currentItem.tag || currentItem.genre || (isVideo ? "FILM / SÉRIE" : "DJELISON AUDIO")}
          </span>
          {count > 1 && (
            <span className="hero-carousel-counter">
              {currentIndex + 1} / {count}
            </span>
          )}
        </div>

        <h1 className="hero-carousel-title">{currentItem.title}</h1>

        {currentItem.artist && (
          <div className="hero-carousel-artist">
            <span className="material-icons-round" style={{ fontSize: 18 }}>person</span>
            <span>{currentItem.artist}</span>
          </div>
        )}

        {currentItem.synopsis && (
          <p className="hero-carousel-synopsis">{currentItem.synopsis}</p>
        )}

        <div className="hero-carousel-actions">
          <button
            type="button"
            className="btn-carousel-play tv-focusable"
            onClick={() => onPlay && onPlay(currentItem)}
          >
            <span className="material-icons-round" style={{ fontSize: 26 }}>
              {isVideo ? "play_arrow" : "headphones"}
            </span>
            <span>{isVideo ? "REGARDER" : "ÉCOUTER"}</span>
          </button>

          {onOpenDetails && (
            <button
              type="button"
              className="btn-carousel-info tv-focusable"
              onClick={() => onOpenDetails(currentItem)}
            >
              <span className="material-icons-round" style={{ fontSize: 24 }}>
                info
              </span>
              <span>PLUS D&apos;INFOS</span>
            </button>
          )}
        </div>
      </div>

      {/* Flèches de navigation Suivant / Précédent (si plusieurs éléments) */}
      {count > 1 && (
        <>
          <button
            type="button"
            className="carousel-nav-btn prev tv-focusable"
            onClick={prevSlide}
            aria-label="Publication précédente"
          >
            <span className="material-icons-round">chevron_left</span>
          </button>
          <button
            type="button"
            className="carousel-nav-btn next tv-focusable"
            onClick={nextSlide}
            aria-label="Publication suivante"
          >
            <span className="material-icons-round">chevron_right</span>
          </button>
        </>
      )}

      {/* Barre d'indicateurs de défilement (10 barres/points) */}
      {count > 1 && (
        <div className="hero-carousel-indicators" role="tablist">
          {carouselItems.map((item, idx) => (
            <button
              key={item.id || idx}
              type="button"
              role="tab"
              aria-selected={idx === currentIndex}
              aria-label={`Aller à la publication ${idx + 1} : ${item.title}`}
              className={`carousel-indicator-bar ${idx === currentIndex ? "active" : ""}`}
              onClick={() => setCurrentIndex(idx)}
            >
              <span className="carousel-indicator-progress" />
            </button>
          ))}
        </div>
      )}

      {/* Styles CSS intégrés pour fluidité et isolation */}
      <style jsx>{`
        .hero-carousel-container {
          position: relative;
          height: 75vh;
          min-height: 480px;
          max-height: 720px;
          width: 100%;
          display: flex;
          align-items: center;
          padding: 0 4%;
          color: #ffffff;
          overflow: hidden;
          background: #0e0e12;
        }

        .hero-carousel-slide-bg {
          position: absolute;
          inset: 0;
          background-size: cover;
          background-position: center 25%;
          opacity: 0;
          transform: scale(1.04);
          transition: opacity 0.8s ease-in-out, transform 8s cubic-bezier(0.25, 1, 0.5, 1);
          z-index: 1;
        }

        .hero-carousel-slide-bg.active {
          opacity: 1;
          transform: scale(1);
          z-index: 2;
        }

        .hero-carousel-vignette-left {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            90deg,
            rgba(12, 12, 16, 0.95) 0%,
            rgba(12, 12, 16, 0.75) 35%,
            rgba(12, 12, 16, 0.2) 65%,
            transparent 100%
          );
          z-index: 3;
          pointer-events: none;
        }

        .hero-carousel-vignette-bottom {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            0deg,
            #141414 0%,
            rgba(20, 20, 20, 0.85) 15%,
            rgba(20, 20, 20, 0.2) 40%,
            transparent 80%
          );
          z-index: 3;
          pointer-events: none;
        }

        .hero-carousel-vignette-top {
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, rgba(12, 12, 16, 0.5) 0%, transparent 25%);
          z-index: 3;
          pointer-events: none;
        }

        .hero-carousel-content {
          position: relative;
          z-index: 10;
          max-width: 650px;
          animation: heroFadeSlide 0.5s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes heroFadeSlide {
          from {
            opacity: 0;
            transform: translateY(18px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .hero-carousel-badge-row {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 16px;
        }

        .hero-carousel-badge {
          display: inline-flex;
          align-items: center;
          background: linear-gradient(135deg, #e50914 0%, #b71c1c 100%);
          color: #ffffff;
          padding: 5px 12px;
          font-size: 13px;
          font-weight: 800;
          letter-spacing: 0.8px;
          text-transform: uppercase;
          border-radius: 4px;
          box-shadow: 0 4px 12px rgba(229, 9, 20, 0.4);
        }

        .hero-carousel-counter {
          font-size: 12px;
          font-weight: 700;
          color: rgba(255, 255, 255, 0.7);
          background: rgba(0, 0, 0, 0.5);
          padding: 3px 8px;
          border-radius: 10px;
          border: 1px solid rgba(255, 255, 255, 0.15);
        }

        .hero-carousel-title {
          font-size: clamp(32px, 5vw, 58px);
          font-weight: 900;
          line-height: 1.1;
          margin: 0 0 12px 0;
          color: #ffffff;
          text-shadow: 0 4px 18px rgba(0, 0, 0, 0.8);
          letter-spacing: -0.5px;
        }

        .hero-carousel-artist {
          display: flex;
          align-items: center;
          gap: 6px;
          color: #ffd54f;
          font-size: 18px;
          font-weight: 700;
          margin-bottom: 14px;
          text-shadow: 0 2px 8px rgba(0, 0, 0, 0.6);
        }

        .hero-carousel-synopsis {
          font-size: clamp(14px, 1.4vw, 17px);
          line-height: 1.5;
          color: rgba(255, 255, 255, 0.9);
          text-shadow: 0 2px 10px rgba(0, 0, 0, 0.8);
          margin: 0 0 26px 0;
          max-width: 580px;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .hero-carousel-actions {
          display: flex;
          align-items: center;
          gap: 14px;
          flex-wrap: wrap;
        }

        .btn-carousel-play {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: #ffffff;
          color: #0d0d11;
          border: none;
          padding: 12px 28px;
          border-radius: 6px;
          font-size: 17px;
          font-weight: 800;
          cursor: pointer;
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.5);
          transition: all 0.2s ease;
        }

        .btn-carousel-play:hover {
          background: rgba(255, 255, 255, 0.85);
          transform: scale(1.04);
        }

        .btn-carousel-play:active {
          transform: scale(0.98);
        }

        .btn-carousel-info {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(109, 109, 110, 0.65);
          color: #ffffff;
          border: 1px solid rgba(255, 255, 255, 0.2);
          backdrop-filter: blur(8px);
          padding: 12px 24px;
          border-radius: 6px;
          font-size: 16px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-carousel-info:hover {
          background: rgba(109, 109, 110, 0.9);
          transform: scale(1.04);
        }

        /* Navigation Arrows (Prev / Next) */
        .carousel-nav-btn {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          z-index: 15;
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: rgba(18, 18, 24, 0.6);
          border: 1px solid rgba(255, 255, 255, 0.15);
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          opacity: 0.6;
          backdrop-filter: blur(6px);
          transition: all 0.25s ease;
        }

        .carousel-nav-btn:hover {
          opacity: 1;
          background: rgba(255, 179, 0, 0.8);
          color: #0d0d11;
          transform: translateY(-50%) scale(1.1);
        }

        .carousel-nav-btn.prev {
          left: 1.5%;
        }

        .carousel-nav-btn.next {
          right: 1.5%;
        }

        .carousel-nav-btn .material-icons-round {
          font-size: 32px;
        }

        /* Indicators at bottom */
        .hero-carousel-indicators {
          position: absolute;
          bottom: 24px;
          right: 4%;
          z-index: 15;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .carousel-indicator-bar {
          height: 4px;
          width: 22px;
          border: none;
          padding: 0;
          background: rgba(255, 255, 255, 0.3);
          border-radius: 2px;
          cursor: pointer;
          position: relative;
          overflow: hidden;
          transition: width 0.3s ease, background 0.3s ease;
        }

        .carousel-indicator-bar:hover {
          background: rgba(255, 255, 255, 0.6);
        }

        .carousel-indicator-bar.active {
          width: 38px;
          background: #ffb300;
          box-shadow: 0 0 8px rgba(255, 179, 0, 0.6);
        }

        @media (max-width: 768px) {
          .hero-carousel-container {
            height: 65vh;
            min-height: 420px;
            padding: 0 20px;
          }
          .hero-carousel-content {
            max-width: 100%;
          }
          .carousel-nav-btn {
            display: none;
          }
          .hero-carousel-indicators {
            bottom: 16px;
            right: 20px;
          }
        }
      `}</style>
    </div>
  );
}
