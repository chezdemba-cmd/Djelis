import React, { useState, useEffect } from 'react';
import '../app/admin.css';
import { authHeader } from '../lib/authClient';

export default function AdminScreen({ onBack }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [contents, setContents] = useState([]);
  const [stats, setStats] = useState({ users: 0, activeSubs: 0, videos: 0, audios: 0 });
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStep, setUploadStep] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);

  const apiBase = () => process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

  const authHeaders = async () => (await authHeader()) || {};

  // Étape 1 : demander une URL signée à l'API (petite requête JSON).
  const requestSignedUpload = async (kind, file) => {
    const res = await fetch(`${apiBase()}/api/v1/admin/uploads/sign`, {
      method: 'POST',
      headers: { ...(await authHeaders()), 'Content-Type': 'application/json' },
      body: JSON.stringify({
        kind,
        fileName: file.name,
        contentType: file.type || 'application/octet-stream',
      }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || `Signature refusée (${res.status})`);
    }
    return res.json(); // { path, signedUrl, token, publicUrl }
  };

  // Étape 2 : le navigateur téléverse le fichier DIRECTEMENT vers Supabase
  // Storage (le binaire ne transite pas par l'API). XHR pour la barre de progression.
  const putFileToSupabase = (signedUrl, file, onProgress) =>
    new Promise((resolve, reject) => {
      // Format multipart attendu par l'endpoint "upload/sign" de Supabase.
      const form = new FormData();
      form.append('cacheControl', '3600');
      form.append('', file);

      const xhr = new XMLHttpRequest();
      xhr.open('PUT', signedUrl);
      xhr.setRequestHeader('x-upsert', 'true');
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable && onProgress) {
          onProgress(Math.round((e.loaded / e.total) * 100));
        }
      };
      xhr.onload = () =>
        xhr.status >= 200 && xhr.status < 300
          ? resolve()
          : reject(new Error(`Upload Supabase échoué (${xhr.status})`));
      xhr.onerror = () => reject(new Error("Erreur réseau pendant l'upload"));
      xhr.send(form);
    });

  // Formulaire d'upload
  const [uploadData, setUploadData] = useState({
    title: '',
    type: 'Film',
    category: '',
    customCategory: '',
    synopsis: '',
    publishedAtStart: '',
    publishedAtEnd: '',
    sourceMode: 'upload', // 'upload' (fichier Supabase) | 'youtube' (lien gratuit)
    youtubeUrl: '',
    file: null,
    coverFile: null
  });

  const fetchAdminData = async () => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
      
      // Fetch Dashboard Stats
      const statsRes = await fetch(`${baseUrl}/api/v1/admin/dashboard`, {
        headers: await authHeaders(),
      });
      if (statsRes.ok) {
        setStats(await statsRes.json());
      }

      // Fetch Contents
      const contentsRes = await fetch(`${baseUrl}/api/v1/admin/contents`, {
        headers: await authHeaders(),
      });
      if (contentsRes.ok) {
        setContents(await contentsRes.json());
      }
    } catch (err) {
      console.error("Erreur de récupération des données administrateur", err);
    }
  };

  useEffect(() => {
    // Data fetching owns the asynchronous state updates; this is not derived state.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchAdminData();
  }, []);

  const handleToggleSuspend = async (id, currentStatus) => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
      const res = await fetch(`${baseUrl}/api/v1/admin/contents/${id}/toggle`, {
        method: 'PATCH',
        headers: await authHeaders(),
      });
      if (res.ok) {
        fetchAdminData();
        alert(`Le contenu a été ${!currentStatus ? 'réactivé' : 'suspendu'}.`);
      } else {
        alert("Erreur lors de la modification du statut.");
      }
    } catch(err) {
      alert("Erreur réseau.");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Voulez-vous vraiment supprimer ce contenu définitivement ?')) {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
        const res = await fetch(`${baseUrl}/api/v1/admin/contents/${id}`, {
          method: 'DELETE',
          headers: await authHeaders(),
        });
        if (res.ok) {
          fetchAdminData();
          alert('Contenu supprimé avec succès.');
        } else {
          alert("Erreur lors de la suppression.");
        }
      } catch(err) {
        alert("Erreur réseau.");
      }
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    const isYoutube = uploadData.sourceMode === 'youtube';

    if (isYoutube) {
      if (!uploadData.youtubeUrl.trim()) {
        alert('Collez le lien de la vidéo YouTube.');
        return;
      }
    } else if (!uploadData.file || !uploadData.coverFile) {
      alert("Veuillez sélectionner le fichier média et l'image de couverture.");
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      let coverPath;
      let mediaPath;

      // Couverture : obligatoire pour un fichier, optionnelle pour YouTube
      // (à défaut, la vignette YouTube est utilisée côté serveur).
      if (uploadData.coverFile) {
        setUploadStep('Téléversement de la couverture…');
        const coverSigned = await requestSignedUpload('cover', uploadData.coverFile);
        await putFileToSupabase(coverSigned.signedUrl, uploadData.coverFile, null);
        coverPath = coverSigned.path;
      }

      if (!isYoutube) {
        // Média (MP4 / MP3) : upload direct vers Supabase, avec progression.
        setUploadStep('Téléversement du média…');
        const mediaSigned = await requestSignedUpload('media', uploadData.file);
        await putFileToSupabase(mediaSigned.signedUrl, uploadData.file, setUploadProgress);
        mediaPath = mediaSigned.path;
      }

      // Création de la fiche : uniquement des métadonnées + chemins / lien.
      setUploadStep('Enregistrement de la fiche…');
      const res = await fetch(`${apiBase()}/api/v1/admin/contents`, {
        method: 'POST',
        headers: { ...(await authHeaders()), 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: uploadData.title,
          type: uploadData.type,
          category: uploadData.category === 'autre' ? uploadData.customCategory : uploadData.category,
          synopsis: uploadData.synopsis,
          publishedAtStart: uploadData.publishedAtStart || undefined,
          publishedAtEnd: uploadData.publishedAtEnd || undefined,
          ...(mediaPath ? { mediaPath } : {}),
          ...(coverPath ? { coverPath } : {}),
          ...(isYoutube ? { youtubeUrl: uploadData.youtubeUrl.trim() } : {}),
        }),
      });

      if (res.ok) {
        alert(`Upload réussi ! Le contenu "${uploadData.title}" a été ajouté.`);
        setUploadData({ ...uploadData, title: '', synopsis: '', youtubeUrl: '', file: null, coverFile: null });
        fetchAdminData();
        setActiveTab('content');
      } else {
        const error = await res.json().catch(() => ({}));
        alert(`Erreur d'upload : ${error.message || 'Inconnue'}`);
      }
    } catch (err) {
      alert(err.message || "Erreur de connexion lors de l'upload.");
    } finally {
      setIsUploading(false);
      setUploadStep('');
      setUploadProgress(0);
    }
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
              <label>Source du média</label>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="button" className={`pill-btn ${uploadData.sourceMode === 'upload' ? 'active' : ''}`} onClick={() => setUploadData({ ...uploadData, sourceMode: 'upload' })}>
                  Fichier (MP4 / MP3)
                </button>
                <button type="button" className={`pill-btn ${uploadData.sourceMode === 'youtube' ? 'active' : ''}`} onClick={() => setUploadData({ ...uploadData, sourceMode: 'youtube' })}>
                  Lien YouTube (gratuit)
                </button>
              </div>
              {uploadData.sourceMode === 'youtube' && (
                <small style={{ color: '#888' }}>
                  Contenu gratuit / promo. La vidéo est lue dans l&apos;app via l&apos;embed YouTube (petit logo YouTube visible, imposé par YouTube). Ne pas mettre derrière l&apos;abonnement.
                </small>
              )}
            </div>

            {uploadData.sourceMode === 'youtube' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <label>Lien YouTube</label>
                <input
                  type="url"
                  required
                  value={uploadData.youtubeUrl}
                  onChange={e => setUploadData({ ...uploadData, youtubeUrl: e.target.value })}
                  placeholder="https://www.youtube.com/watch?v=..."
                  style={{ padding: '10px', borderRadius: '4px', border: '1px solid #444', background: '#111', color: 'white' }}
                />
              </div>
            )}

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
                  <option value="Audio / Podcast">Audio / Podcast</option>
                </select>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', flex: 1 }}>
                <label>Catégorie / Genre</label>
                <select value={uploadData.category} onChange={e => setUploadData({...uploadData, category: e.target.value})} style={{ padding: '10px', borderRadius: '4px', border: '1px solid #444', background: '#111', color: 'white' }} required>
                  <option value="" disabled>Sélectionnez une catégorie...</option>
                  {uploadData.type === 'Audio / Podcast' ? (
                    <>
                      <option value="musique">Musique</option>
                      <option value="podcasts">Podcasts & Contes</option>
                    </>
                  ) : (
                    <>
                      <option value="cinema">Cinéma & Films</option>
                      <option value="theatre">Théâtre</option>
                      <option value="docs">Documentaire</option>
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
                <label>
                  Image de Couverture (Affiche)
                  {uploadData.sourceMode === 'youtube' && <span style={{ color: '#888' }}> — optionnelle</span>}
                </label>
                <input type="file" required={uploadData.sourceMode !== 'youtube'} accept="image/*" onChange={e => setUploadData({...uploadData, coverFile: e.target.files[0]})} style={{ padding: '10px', borderRadius: '4px', border: '1px solid #444', background: '#111', color: 'white', maxWidth: '100%', boxSizing: 'border-box' }} />
              </div>

              {uploadData.sourceMode !== 'youtube' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', flex: 1, minWidth: 0 }}>
                  <label>Fichier Média (MP4, MP3)</label>
                  <input type="file" required accept="video/mp4,audio/mp3,audio/mpeg" onChange={e => setUploadData({...uploadData, file: e.target.files[0]})} style={{ padding: '10px', borderRadius: '4px', border: '1px solid #444', background: '#111', color: 'white', maxWidth: '100%', boxSizing: 'border-box' }} />
                </div>
              )}
            </div>

            <button type="submit" disabled={isUploading} style={{ background: '#ffb300', color: 'black', padding: '12px', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' }}>
              {isUploading
                ? `${uploadStep || 'Upload en cours…'}${uploadProgress ? ` ${uploadProgress}%` : ''}`
                : 'Mettre en Ligne'}
            </button>
            {isUploading && (
              <div style={{ height: '6px', background: '#333', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${uploadProgress}%`, background: '#ffb300', transition: 'width 0.2s' }} />
              </div>
            )}
          </form>
        </div>
      )}
    </div>
  );
}
