import React from 'react';

const PREDEFINED_PROFILES = [
  { id: '1', name: 'Papa', role: 'Premium', avatar: '😎', color: '#FFB300', isKids: false },
  { id: '2', name: 'Maman', role: 'Premium', avatar: '👩‍🦱', color: '#FF4081', isKids: false },
  { id: '3', name: 'Enfant', role: 'Kids', avatar: '👶', color: '#00E5FF', isKids: true },
];

export default function ProfileSelector({ onSelectProfile }) {
  return (
    <div className="profile-selector-container">
      <h1 className="profile-selector-title">Qui regarde Djeli&apos;S ?</h1>
      <div className="profile-grid">
        {PREDEFINED_PROFILES.map((profile) => (
          <div 
            key={profile.id} 
            className="profile-card tv-focusable" 
            onClick={() => onSelectProfile(profile)}
          >
            <div 
              className="profile-avatar-wrapper"
              style={{ 
                backgroundColor: profile.color,
                boxShadow: `0 8px 24px rgba(0,0,0,0.3)`
              }}
            >
              <span className="profile-avatar-emoji">{profile.avatar}</span>
            </div>
            <h3 className="profile-name">{profile.name}</h3>
            <span className="profile-badge">{profile.role}</span>
          </div>
        ))}
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        .profile-selector-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 80vh;
          color: white;
          animation: fadeIn 0.5s ease-out;
        }

        .profile-selector-title {
          font-size: clamp(24px, 5vw, 44px);
          font-weight: 800;
          margin-bottom: 50px;
          text-align: center;
          background: linear-gradient(to right, #fff, #888);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .profile-grid {
          display: flex;
          gap: 40px;
          flex-wrap: wrap;
          justify-content: center;
        }

        .profile-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          cursor: pointer;
          transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }

        .profile-card:hover {
          transform: translateY(-10px) scale(1.05);
        }

        .profile-avatar-wrapper {
          width: 140px;
          height: 140px;
          border-radius: 24px;
          display: flex;
          justify-content: center;
          align-items: center;
          border: 3px solid transparent;
          transition: border-color 0.2s, box-shadow 0.2s;
        }

        .profile-card:hover .profile-avatar-wrapper {
          border-color: white;
          box-shadow: 0 0 30px rgba(255, 255, 255, 0.4) !important;
        }

        .profile-avatar-emoji {
          font-size: 70px;
        }

        .profile-name {
          margin-top: 15px;
          font-size: 20px;
          font-weight: 700;
          color: #aaa;
          transition: color 0.2s;
        }

        .profile-card:hover .profile-name {
          color: white;
        }

        .profile-badge {
          margin-top: 5px;
          font-size: 12px;
          font-weight: 800;
          color: rgba(255,255,255,0.4);
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}} />
    </div>
  );
}
