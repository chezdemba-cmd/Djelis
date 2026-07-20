import React, { useState, useEffect } from 'react';

export default function ProfileSelector({ onSelectProfile }) {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);

  const mapProfiles = (data) => {
    return data.map((p, idx) => ({
      id: p.id,
      name: p.name,
      avatar: p.avatarUrl || ['😎', '👩‍🦱', '👶', '🦊', '🦁'][idx % 5],
      color: ['#FFB300', '#FF4081', '#00E5FF', '#4CAF50', '#9C27B0'][idx % 5],
      role: p.isChild ? 'Kids' : 'Premium',
      isKids: p.isChild,
    }));
  };

  useEffect(() => {
    async function loadProfiles() {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setLoading(false);
        // Fallback to static mock profiles if not authenticated
        setProfiles([
          { id: '1', name: 'Papa', role: 'Premium', avatar: '😎', color: '#FFB300', isKids: false },
          { id: '2', name: 'Maman', role: 'Premium', avatar: '👩‍🦱', color: '#FF4081', isKids: false },
          { id: '3', name: 'Enfant', role: 'Kids', avatar: '👶', color: '#00E5FF', isKids: true },
        ]);
        return;
      }
      try {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
      const res = await fetch(`${baseUrl}/api/v1/profiles`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setProfiles(mapProfiles(data));
          } else {
            setProfiles([
              { id: 'default', name: 'Utilisateur', role: 'Premium', avatar: '😎', color: '#FFB300', isKids: false }
            ]);
          }
        } else {
          throw new Error("HTTP error " + res.status);
        }
      } catch (err) {
        console.error("Error loading profiles from NestJS:", err);
        setProfiles([
          { id: '1', name: 'Papa', role: 'Premium', avatar: '😎', color: '#FFB300', isKids: false },
          { id: '2', name: 'Maman', role: 'Premium', avatar: '👩‍🦱', color: '#FF4081', isKids: false },
          { id: '3', name: 'Enfant', role: 'Kids', avatar: '👶', color: '#00E5FF', isKids: true },
        ]);
      } finally {
        setLoading(false);
      }
    }

    loadProfiles();
  }, []);

  const [isManageMode, setIsManageMode] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newProfileData, setNewProfileData] = useState({ name: '', isChild: false });

  // Netflix-style generic face SVG
  const FaceSVG = () => (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
      <circle cx="30" cy="40" r="4" fill="white" />
      <circle cx="70" cy="40" r="4" fill="white" />
      <path d="M 30 65 Q 50 80 70 65" stroke="white" strokeWidth="4" strokeLinecap="round" fill="none" />
    </svg>
  );

  const handleAddProfile = async () => {
    const { name, isChild } = newProfileData;
    if (!name || name.trim() === "") return;

    const token = localStorage.getItem('accessToken');
    if (!token) return;

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
      const res = await fetch(`${baseUrl}/api/v1/profiles`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: name.trim(),
          is_child: isChild
        })
      });
      if (res.ok) {
        const refreshRes = await fetch(`${baseUrl}/api/v1/profiles`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (refreshRes.ok) {
          const data = await refreshRes.json();
          setProfiles(mapProfiles(data));
          setShowAddModal(false);
          setNewProfileData({ name: '', isChild: false });
        }
      }
    } catch (err) {
      alert("Erreur lors de la création du profil");
    }
  };

  return (
    <div className="profile-selector-container">
      <h1 className="profile-selector-title">{isManageMode ? "Gestion des profils :" : "Qui est-ce ?"}</h1>
      <div className="profile-grid">
        {profiles.map((profile) => (
          <div 
            key={profile.id} 
            className="profile-card tv-focusable" 
            onClick={() => isManageMode ? null : onSelectProfile(profile)}
          >
            <div 
              className="profile-avatar-wrapper"
              style={{ 
                background: isManageMode 
                  ? `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), ${profile.color}` 
                  : `linear-gradient(to bottom, ${profile.color}dd, ${profile.color})`
              }}
            >
              <FaceSVG />
              {isManageMode && (
                <div className="profile-edit-icon">
                  <span className="material-icons-round">edit</span>
                </div>
              )}
              {profile.isKids && (
                <div className="profile-kids-banner">Jeunesse</div>
              )}
            </div>
            <h3 className="profile-name">{profile.name}</h3>
            {!profile.isKids && (
               <span className="material-icons-round profile-lock">lock_outline</span>
            )}
          </div>
        ))}

        {!loading && localStorage.getItem('accessToken') && (
          <div className="profile-card profile-add-card tv-focusable" onClick={() => setShowAddModal(true)}>
            <div className="profile-avatar-wrapper add-wrapper">
              <span className="material-icons-round add-icon">add</span>
            </div>
            <h3 className="profile-name">Ajouter un profil</h3>
          </div>
        )}
      </div>

      <div className="profile-manage-btn-container">
        <button 
          className={`manage-btn ${isManageMode ? 'done-btn' : ''} tv-focusable`}
          onClick={() => setIsManageMode(!isManageMode)}
        >
          {isManageMode ? "Terminé" : "Gérer les profils"}
        </button>
      </div>

      {showAddModal && (
        <div className="netflix-modal-overlay">
          <div className="netflix-modal">
            <button className="close-btn" onClick={() => setShowAddModal(false)}>
              <span className="material-icons-round">close</span>
            </button>
            <h1 className="modal-title">Ajoutez un profil</h1>
            <p className="modal-subtitle">Ajoutez un profil pour un nouvel utilisateur Djeli&apos;S.</p>
            
            <div className="modal-body">
              <div className="modal-avatar" style={{ background: 'linear-gradient(to bottom, #00E5FFdd, #00E5FF)' }}>
                <FaceSVG />
              </div>
              <input 
                type="text" 
                className="netflix-input" 
                placeholder="Nom" 
                value={newProfileData.name}
                onChange={e => setNewProfileData({...newProfileData, name: e.target.value})}
                autoFocus
              />
            </div>

            <div className="kids-switch-container">
              <div>
                <h4 style={{ margin: 0, fontSize: '18px' }}>Profil Jeunesse</h4>
                <p style={{ margin: '5px 0 0 0', fontSize: '13px', color: '#a0a0a0' }}>N&apos;afficher que les séries et films adaptés aux enfants</p>
              </div>
              <label className="switch">
                <input type="checkbox" checked={newProfileData.isChild} onChange={e => setNewProfileData({...newProfileData, isChild: e.target.checked})} />
                <span className="slider round"></span>
              </label>
            </div>

            <div className="modal-actions">
              <button className="btn-save tv-focusable" onClick={handleAddProfile} disabled={!newProfileData.name.trim()}>Enregistrer</button>
              <button className="btn-cancel tv-focusable" onClick={() => setShowAddModal(false)}>Annuler</button>
            </div>
          </div>
        </div>
      )}
      
      <style dangerouslySetInnerHTML={{__html: `
        .profile-selector-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          background: #141414;
          color: white;
          animation: fadeIn 0.5s ease-out;
        }

        .profile-selector-title {
          font-size: clamp(30px, 5vw, 56px);
          font-weight: 500;
          margin-bottom: 35px;
          text-align: center;
        }

        .profile-grid {
          display: flex;
          gap: 2vw;
          flex-wrap: wrap;
          justify-content: center;
        }

        .profile-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          cursor: pointer;
          width: clamp(100px, 12vw, 150px);
        }

        .profile-card:hover .profile-name {
          color: white;
        }

        .profile-avatar-wrapper {
          width: 100%;
          aspect-ratio: 1;
          border-radius: 4px;
          display: flex;
          justify-content: center;
          align-items: center;
          border: 3px solid transparent;
          transition: border-color 0.2s;
          position: relative;
          overflow: hidden;
        }

        .profile-card:hover .profile-avatar-wrapper {
          border-color: white;
        }

        .add-wrapper {
          background: transparent;
          border: 0;
        }
        
        .profile-card:hover .add-wrapper {
          border: 0;
        }

        .add-wrapper .add-icon {
          font-size: 80px;
          color: #808080;
          transition: color 0.2s, background 0.2s;
          background: transparent;
          border-radius: 50%;
        }

        .profile-card:hover .add-wrapper .add-icon {
          color: white;
          background: #e50914;
        }

        .profile-edit-icon {
          position: absolute;
          inset: 0;
          display: flex;
          justify-content: center;
          align-items: center;
          background: rgba(0,0,0,0.4);
        }

        .profile-edit-icon .material-icons-round {
          font-size: 40px;
          color: white;
          border: 2px solid white;
          border-radius: 50%;
          padding: 8px;
        }

        .profile-kids-banner {
          position: absolute;
          bottom: 0;
          width: 100%;
          background: rgba(0,0,0,0.2);
          text-align: center;
          font-weight: 700;
          font-size: 14px;
          padding: 4px 0;
          text-shadow: 1px 1px 2px rgba(0,0,0,0.8);
        }

        .profile-name {
          margin-top: 15px;
          font-size: clamp(14px, 2vw, 20px);
          font-weight: 400;
          color: #808080;
          transition: color 0.2s;
          text-align: center;
        }

        .profile-lock {
          font-size: 16px;
          color: #808080;
          margin-top: 5px;
        }

        .profile-manage-btn-container {
          margin-top: 50px;
        }

        .manage-btn {
          background: transparent;
          border: 1px solid #808080;
          color: #808080;
          padding: 10px 30px;
          font-size: 20px;
          text-transform: uppercase;
          letter-spacing: 2px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .manage-btn:hover {
          border-color: white;
          color: white;
        }

        .done-btn {
          background: white;
          color: black;
          font-weight: bold;
          border: 1px solid white;
        }

        .done-btn:hover {
          background: #e50914;
          color: white;
          border-color: #e50914;
        }

        /* Netflix Modal */
        .netflix-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.8);
          z-index: 1000;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .netflix-modal {
          background: #141414;
          width: 90%;
          max-width: 600px;
          padding: 40px;
          position: relative;
          box-sizing: border-box;
          border: 1px solid #333;
        }

        .close-btn {
          position: absolute;
          top: 20px;
          right: 20px;
          background: transparent;
          border: none;
          color: white;
          cursor: pointer;
          font-size: 30px;
        }
        .close-btn .material-icons-round { font-size: 30px; }

        .modal-title {
          font-size: 40px;
          margin: 0 0 5px 0;
          font-weight: 500;
        }

        .modal-subtitle {
          color: #a0a0a0;
          font-size: 16px;
          margin-bottom: 30px;
        }

        .modal-body {
          display: flex;
          gap: 20px;
          align-items: center;
          padding-bottom: 25px;
          border-bottom: 1px solid #333;
          margin-bottom: 25px;
        }

        .modal-avatar {
          width: 100px;
          height: 100px;
          border-radius: 4px;
          flex-shrink: 0;
        }

        .netflix-input {
          flex: 1;
          background: #333;
          border: none;
          padding: 15px 20px;
          color: white;
          font-size: 18px;
        }

        .kids-switch-container {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-bottom: 25px;
          border-bottom: 1px solid #333;
          margin-bottom: 30px;
        }

        /* Switch toggle CSS */
        .switch {
          position: relative;
          display: inline-block;
          width: 60px;
          height: 34px;
        }

        .switch input { 
          opacity: 0;
          width: 0;
          height: 0;
        }

        .slider {
          position: absolute;
          cursor: pointer;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: #ccc;
          -webkit-transition: .4s;
          transition: .4s;
        }

        .slider:before {
          position: absolute;
          content: "";
          height: 26px;
          width: 26px;
          left: 4px;
          bottom: 4px;
          background-color: white;
          -webkit-transition: .4s;
          transition: .4s;
        }

        input:checked + .slider {
          background-color: #e50914;
        }

        input:focus + .slider {
          box-shadow: 0 0 1px #e50914;
        }

        input:checked + .slider:before {
          -webkit-transform: translateX(26px);
          -ms-transform: translateX(26px);
          transform: translateX(26px);
        }

        .slider.round {
          border-radius: 34px;
        }

        .slider.round:before {
          border-radius: 50%;
        }

        .modal-actions {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .btn-save {
          background: white;
          color: black;
          border: none;
          padding: 15px;
          font-size: 18px;
          font-weight: bold;
          cursor: pointer;
        }
        .btn-save:disabled {
          background: #444;
          color: #888;
          cursor: not-allowed;
        }

        .btn-cancel {
          background: transparent;
          color: white;
          border: 1px solid #808080;
          padding: 15px;
          font-size: 18px;
          font-weight: bold;
          cursor: pointer;
        }
        .btn-cancel:hover {
          border-color: white;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}} />
    </div>
  );
}
