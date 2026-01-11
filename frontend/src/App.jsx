import { useState } from 'react';
import api from './api';

/**
 * Folder labels (UI) + values (backend-safe)
 * Values MUST exactly match backend allowedFolders
 */
const folders = [
  { label: 'Earrings', value: 'earrings' },
  { label: 'Pendants', value: 'pendants' },
  { label: 'Finger Rings', value: 'finger-rings' },
  { label: 'Mangalsutra', value: 'mangalsutra' },
  { label: 'Chains', value: 'chains' },
  { label: 'Nose Pin', value: 'nose-pin' },
  { label: 'Necklaces', value: 'necklaces' },
  { label: 'Necklace Set', value: 'necklace-set' },
  { label: 'Bangles', value: 'bangles' },
  { label: 'Bracelets', value: 'bracelets' },
  { label: 'Antique', value: 'antique' },
  { label: 'Custom', value: 'custom' }
];

function App() {
  const [file, setFile] = useState(null);
  const [folder, setFolder] = useState('earrings');
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);

  const upload = async () => {
    if (!file) {
      alert('Please select an image or video');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);

    try {
      setLoading(true);
      const res = await api.post('/upload', formData);
      setUrl(res.data.url);
    } catch (err) {
      alert('Upload failed');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const isVideo = (url) =>
    url.endsWith('.mp4') || url.endsWith('.webm');

  return (
    <div style={{ padding: 30, fontFamily: 'Arial' }}>
      <h2>AWS Image / Video Upload Service</h2>

      <label>Choose Category</label><br />
      <select value={folder} onChange={e => setFolder(e.target.value)}>
        {folders.map(f => (
          <option key={f.value} value={f.value}>
            {f.label}
          </option>
        ))}
      </select>

      <br /><br />

      <input
        type="file"
        accept="image/*,video/mp4,video/webm"
        onChange={e => setFile(e.target.files[0])}
      />

      <br /><br />

      <button onClick={upload} disabled={loading}>
        {loading ? 'Uploading...' : 'Upload'}
      </button>

      {url && (
        <>
          <hr />
          <p><strong>Uploaded URL:</strong></p>
          <a href={url} target="_blank" rel="noreferrer">{url}</a>

          <br /><br />

          {isVideo(url) ? (
            <video src={url} controls width="320" />
          ) : (
            <img src={url} alt="Uploaded" width="320" />
          )}
        </>
      )}
    </div>
  );
}

export default App;
