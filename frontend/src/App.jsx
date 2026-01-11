import { useState } from 'react';
import api from './api';

const folders = [
  'earrings',
  'pendants',
  'finger-rings',
  'mangalsutra',
  'chains',
  'nose-pin',
  'necklaces',
  'necklace-set',
  'bangles',
  'bracelets',
  'antique',
  'custom'
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

  return (
    <div style={{ padding: 30, fontFamily: 'Arial' }}>
      <h2>AWS Image / Video Upload Service</h2>

      <label>Choose Category</label><br />
      <select value={folder} onChange={e => setFolder(e.target.value)}>
        {folders.map(f => (
          <option key={f} value={f}>{f}</option>
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

          {url.includes('.mp4') ? (
            <video src={url} controls width="300" />
          ) : (
            <img src={url} alt="Uploaded" width="300" />
          )}
        </>
      )}
    </div>
  );
}

export default App;
