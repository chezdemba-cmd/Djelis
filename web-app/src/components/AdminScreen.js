import React, { useState, useEffect } from 'react';
import '../app/admin.css';

export default function AdminScreen({ onBack }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [contents, setContents] = useState([]);
  const [stats, setStats] = useState({ users: 1250, activeSubs: 840, videos: 45, audios: 120 });
  const [isUploading, setIsUploading] = useState(false);

  // Formulaire d'upload
  const [uploadData, setUploadData] = useState({
    title: '',
    type: 'video',
    category: '',
    customCategory: '',
    synopsis: '',
    publishedAtStart: '',
    publishedAtEnd: '',
    file: null,
    coverFile: null
  });

  useEffect(() => {
    // Simuler le chargement des contenus depuis l'API NestJS
    const fetchAdminContents = async () => {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
        const res = await fetch(`${baseUrl}/api/v1/catalog/contents?limit=50`);
        if (res.ok) {
          const data = await res.json();
          setContents(data);
        } else {
          // Fallback mock data
          setContents([
            { id: '1', title: 'Le Trône du Mandé', type: 'Série', isActive: true, publishedAt: '2023-01-01' },
            { id: '2', title: 'Les Secrets du Baobab', type: 'Film', isActive: false, publishedAt: '2026-12-01' }
          ]);
        }
      } catch (err) {
        setContents([
          { id: '1', title: 'Le Trône du Mandé', type: 'Série', isActive: true, publishedAt: '2023-01-01' },
          { id: '2', title: 'Les Secrets du Baobab (A venir)', type: 'Film', isActive: true, publishedAt: '2026-12-01' },
          { id: '3', title: 'Paroles de Griot', type: 'Audio', isActive: false, publishedAt: '2023-05-12' }
        ]);
      }
    };
    fetchAdminContents();
  }, []);

  const handleToggleSuspend = async (id, currentStatus) => {
    // Appel API simulé pour suspendre/réactiver
    const newContents = contents.map(c => c.id === id ? { ...c, isActive: !currentStatus } : c);
    setContents(newContents);
    alert(`Le contenu a été ${!currentStatus ? 'réactivé' : 'suspendu'}.`);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Voulez-vous vraiment supprimer ce contenu définitivement ?')) {
      const newContents = contents.filter(c => c.id !== id);
      setContents(newContents);
      alert('Contenu supprimé avec succès.');
    }
  };

  const handleUploadSubmit = (e) => {
    e.preventDefault();
    setIsUploading(true);
    // Simuler un délai d'upload
    setTimeout(() => {
      setIsUploading(false);
      alert(`Upload réussi ! Le contenu "${uploadData.title}" sera diffusé du ${uploadData.publishedAtStart || "immédiatement"} au ${uploadData.publishedAtEnd || "toujours"}.`);
      setActiveTab('content');
    }, 2000);
  };

  return (
    <div className="admin-screen" style={{ padding: '20px', color: 'white', backgroundColor: '#141414', minHeight: '100vh', width: '100%', boxSizing: 'border-box', overflowX: 'hidden' }}>
      <div className="admin-header-top" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', gap: '15px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <button onClick={onBack} style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer' }}>
            <span className="material-icons-round">arrow_back</span>
          </button>
          <h1 style={{ fontSize: 'clamp(18px, 4vw, 24px)', margin: 0 }}>Espace Administrateur</h1>
        </div>
        
        <div className="admin-tabs" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button 
            className={`pill-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            Tableau de Bord
          </button>
          <button 
            className={`pill-btn ${activeTab === 'content' ? 'active' : ''}`}
            onClick={() => setActiveTab('content')}
          >
            Gestion des Contenus
          </button>
          <button 
            className={`pill-btn ${activeTab === 'upload' ? 'active' : ''}`}
            onClick={() => setActiveTab('upload')}
          >
            + Nouvel Upload
          </button>
        </div>
      </div>

      {activeTab === 'dashboard' && (
        <div className="admin-dashboard">
          <div className="admin-dashboard-grid">
            <div className="stat-card" style={{ backgroundColor: '#222', padding: '20px', borderRadius: '8px' }}>
              <h3 style={{ margin: '0 0 10px 0', color: '#888' }}>Utilisateurs</h3>
              <p style={{ fontSize: '32px', fontWeight: 'bold', margin: 0 }}>{stats.users}</p>
            </div>
            <div className="stat-card" style={{ backgroundColor: '#222', padding: '20px', borderRadius: '8px' }}>
              <h3 style={{ margin: '0 0 10px 0', color: '#888' }}>Abonnements Actifs</h3>
              <p style={{ fontSize: '32px', fontWeight: 'bold', margin: 0, color: '#ffb300' }}>{stats.activeSubs}</p>
            </div>
            <div className="stat-card" style={{ backgroundColor: '#222', padding: '20px', borderRadius: '8px' }}>
              <h3 style={{ margin: '0 0 10px 0', color: '#888' }}>Vidéos en ligne</h3>
              <p style={{ fontSize: '32px', fontWeight: 'bold', margin: 0 }}>{stats.videos}</p>
            </div>
            <div className="stat-card" style={{ backgroundColor: '#222', padding: '20px', borderRadius: '8px' }}>
              <h3 style={{ margin: '0 0 10px 0', color: '#888' }}>Audios / Podcasts</h3>
              <p style={{ fontSize: '32px', fontWeight: 'bold', margin: 0 }}>{stats.audios}</p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'content' && (
        <div className="admin-content-list" style={{ backgroundColor: '#222', padding: '20px', borderRadius: '8px', overflowX: 'auto' }}>
          <h2 style={{ marginTop: 0, marginBottom: '20px' }}>Contenus et Calendrier</h2>
          <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #444', textAlign: 'left' }}>
                <th style={{ padding: '12px 8px' }}>Titre</th>
                <th style={{ padding: '12px 8px' }}>Type</th>
                <th style={{ padding: '12px 8px' }}>Date de Diffusion</th>
                <th style={{ padding: '12px 8px' }}>Statut</th>
                <th style={{ padding: '12px 8px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {contents.map(c => {
                const isScheduled = new Date(c.publishedAt) > new Date();
                return (
                  <tr key={c.id} style={{ borderBottom: '1px solid #333' }}>
                    <td style={{ padding: '12px 8px', fontWeight: 'bold' }}>{c.title}</td>
                    <td style={{ padding: '12px 8px' }}>{c.type}</td>
                    <td style={{ padding: '12px 8px', color: isScheduled ? '#ffb300' : 'white' }}>
                      {c.publishedAtStart || c.publishedAt} {isScheduled && "(Planifié)"}
                    </td>
                    <td style={{ padding: '12px 8px' }}>
                      {c.isActive ? (
                        <span style={{ color: '#4caf50', backgroundColor: 'rgba(76, 175, 80, 0.2)', padding: '4px 8px', borderRadius: '4px', fontSize: '12px' }}>En ligne</span>
                      ) : (
                        <span style={{ color: '#f44336', backgroundColor: 'rgba(244, 67, 54, 0.2)', padding: '4px 8px', borderRadius: '4px', fontSize: '12px' }}>Suspendu</span>
                      )}
                    </td>
                    <td style={{ padding: '12px 8px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                      <button 
                        onClick={() => handleToggleSuspend(c.id, c.isActive)}
                        style={{ background: '#444', color: 'white', border: 'none', padding: '6px 10px', borderRadius: '4px', marginRight: '5px', cursor: 'pointer', fontSize: '12px' }}>
                        {c.isActive ? 'Suspendre' : 'Réactiver'}
                      </button>
                      <button 
                        onClick={() => handleDelete(c.id)}
                        style={{ background: '#f44336', color: 'white', border: 'none', padding: '6px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>
                        Supprimer
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'upload' && (
        <div className="admin-upload-form" style={{ backgroundColor: '#222', padding: '30px', borderRadius: '8px', maxWidth: '600px', margin: '0 auto' }}>
          <h2 style={{ marginTop: 0, marginBottom: '20px' }}>Mettre en Ligne un Contenu</h2>
          <form onSubmit={handleUploadSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <label>Titre de l&apos;œuvre</label>
              <input type="text" required value={uploadData.title} onChange={e => setUploadData({...uploadData, title: e.target.value})} style={{ padding: '10px', borderRadius: '4px', border: '1px solid #444', background: '#111', color: 'white' }} />
            </div>

            <div className="admin-form-row">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', flex: 1 }}>
                <label>Type de Contenu</label>
                <select value={uploadData.type} onChange={e => setUploadData({...uploadData, type: e.target.value, category: ''})} style={{ padding: '10px', borderRadius: '4px', border: '1px solid #444', background: '#111', color: 'white' }}>
                  <option value="Film">Film</option>
                  <option value="Série">Série</option>
                  <option value="Théâtre">Théâtre</option>
                  <option value="Documentaire">Documentaire</option>
                  <option value="Audio / Podcast">Audio / Podcast</option>
                </select>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', flex: 1 }}>
                <label>Catégorie / Genre</label>
                <select value={uploadData.category} onChange={e => setUploadData({...uploadData, category: e.target.value})} style={{ padding: '10px', borderRadius: '4px', border: '1px solid #444', background: '#111', color: 'white' }} required>
                  <option value="" disabled>Sélectionnez une catégorie...</option>
                  {uploadData.type === 'Audio / Podcast' ? (
                    <>
                      <option value="Rap">Rap</option>
                      <option value="Country">Country</option>
                      <option value="Traditionnel">Traditionnel</option>
                      <option value="Moderne">Moderne</option>
                      <option value="Podcast">Podcast</option>
                    </>
                  ) : (
                    <>
                      <option value="Action">Action</option>
                      <option value="Policier">Policier</option>
                      <option value="Drame">Drame</option>
                      <option value="Comédie">Comédie</option>
                    </>
                  )}
                  <option value="autre">Autre...</option>
                </select>
              </div>
            </div>

            {uploadData.category === 'autre' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <label>Précisez votre catégorie</label>
                <input type="text" required value={uploadData.customCategory} onChange={e => setUploadData({...uploadData, customCategory: e.target.value})} placeholder="Ex: Science-Fiction, Conte Africain..." style={{ padding: '10px', borderRadius: '4px', border: '1px solid #444', background: '#111', color: 'white' }} />
              </div>
            )}

            <div className="admin-form-row">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', flex: 1 }}>
                <label>Date de début de diffusion</label>
                <input type="date" value={uploadData.publishedAtStart} onChange={e => setUploadData({...uploadData, publishedAtStart: e.target.value})} style={{ padding: '10px', borderRadius: '4px', border: '1px solid #444', background: '#111', color: 'white' }} />
                <small style={{ color: '#888' }}>Laissez vide pour publier immédiatement.</small>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', flex: 1 }}>
                <label>Date de fin de diffusion</label>
                <input type="date" value={uploadData.publishedAtEnd} onChange={e => setUploadData({...uploadData, publishedAtEnd: e.target.value})} style={{ padding: '10px', borderRadius: '4px', border: '1px solid #444', background: '#111', color: 'white' }} />
                <small style={{ color: '#888' }}>Laissez vide si indéfini.</small>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <label>Synopsis</label>
              <textarea rows={4} value={uploadData.synopsis} onChange={e => setUploadData({...uploadData, synopsis: e.target.value})} style={{ padding: '10px', borderRadius: '4px', border: '1px solid #444', background: '#111', color: 'white' }} />
            </div>

            <div className="admin-form-row">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', flex: 1, minWidth: 0 }}>
                <label>Image de Couverture (Affiche)</label>
                <input type="file" required accept="image/*" style={{ padding: '10px', borderRadius: '4px', border: '1px solid #444', background: '#111', color: 'white', maxWidth: '100%', boxSizing: 'border-box' }} />
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', flex: 1, minWidth: 0 }}>
                <label>Fichier Média (MP4, MP3)</label>
                <input type="file" required accept="video/mp4,audio/mp3,audio/mpeg" style={{ padding: '10px', borderRadius: '4px', border: '1px solid #444', background: '#111', color: 'white', maxWidth: '100%', boxSizing: 'border-box' }} />
              </div>
            </div>

            <button type="submit" disabled={isUploading} style={{ background: '#ffb300', color: 'black', padding: '12px', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' }}>
              {isUploading ? 'Upload en cours...' : 'Mettre en Ligne'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
