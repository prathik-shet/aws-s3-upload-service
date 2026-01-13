import { useState } from "react";
import api from "./api"; // ✅ IMPORTANT: use central api instance

/* ===============================
   FOLDERS
   =============================== */
const folders = [
  { label: "Earrings", value: "earrings" },
  { label: "Pendants", value: "pendants" },
  { label: "Finger Rings", value: "finger-rings" },
  { label: "Mangalsutra", value: "mangalsutra" },
  { label: "Chains", value: "chains" },
  { label: "Nose Pin", value: "nose-pin" },
  { label: "Necklaces", value: "necklaces" },
  { label: "Necklace Set", value: "necklace-set" },
  { label: "Bangles", value: "bangles" },
  { label: "Bracelets", value: "bracelets" },
  { label: "Antique", value: "antique" },
  { label: "Custom", value: "custom" }
];

export default function UploadForm() {
  const [file, setFile] = useState(null);
  const [folder, setFolder] = useState("earrings");
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [copied, setCopied] = useState(false);

  /* ===============================
     FILE SELECT
     =============================== */
  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (!selected) return;

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "video/mp4",
      "video/webm"
    ];

    if (!allowedTypes.includes(selected.type)) {
      alert("Only JPG, PNG, WEBP images or MP4, WEBM videos allowed");
      return;
    }

    const isImage = selected.type.startsWith("image/");
    const isVideo = selected.type.startsWith("video/");

    if (isImage && selected.size > 5 * 1024 * 1024) {
      alert("Image must be under 5MB");
      return;
    }

    if (isVideo && selected.size > 10 * 1024 * 1024) {
      alert("Video must be under 10MB");
      return;
    }

    setFile(selected);
  };

  /* ===============================
     UPLOAD
     =============================== */
  const uploadFile = async () => {
    if (!file) return alert("Select a file first");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", folder);

    try {
      setLoading(true);
      setProgress(0);

      const res = await api.post("/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        },
        onUploadProgress: (e) => {
          if (!e.total) return;
          setProgress(Math.round((e.loaded * 100) / e.total));
        }
      });

      setUrl(res.data.url);
      setCopied(false);

    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  /* ===============================
     DELETE
     =============================== */
  const deleteFile = async () => {
    if (!url) return;
    if (!window.confirm("Delete this file from S3?")) return;

    try {
      await api.post("/delete", { url });
      alert("File deleted successfully");
      setUrl("");
      setFile(null);
    } catch {
      alert("Delete failed");
    }
  };

  /* ===============================
     COPY
     =============================== */
  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isVideo = (u) => u.endsWith(".mp4") || u.endsWith(".webm");

  /* ===============================
     UI
     =============================== */
  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <img
          src="https://vimaleshwara-gold-images.s3.ap-south-1.amazonaws.com/desings/logo.png"
          alt="Vimaleshwara Jewellers"
          style={styles.logo}
          loading="lazy"
        />
        <h1 style={styles.title}>VIMALESHWARA JEWELLERS</h1>
        <p style={styles.subtitle}>Admin Upload Panel</p>
      </header>

      <div style={styles.card}>
        <h2 style={styles.cardTitle}>Upload Jewellery Media</h2>

        <label style={styles.label}>Category</label>
        <select
          value={folder}
          onChange={(e) => setFolder(e.target.value)}
          style={styles.select}
        >
          {folders.map((f) => (
            <option key={f.value} value={f.value}>
              {f.label}
            </option>
          ))}
        </select>

        <label style={styles.label}>Select Image / Video</label>
        <input
          type="file"
          accept="image/*,video/mp4,video/webm"
          onChange={handleFileChange}
          style={styles.input}
        />

        <button
          onClick={uploadFile}
          style={styles.uploadBtn}
          disabled={loading}
        >
          {loading ? `Uploading ${progress}%` : "Upload"}
        </button>

        {url && (
          <div style={styles.result}>
            <p><strong>Uploaded URL</strong></p>

            <div style={styles.urlBox}>
              <a href={url} target="_blank" rel="noreferrer" style={styles.urlText}>
                {url}
              </a>
              <button onClick={copyToClipboard} style={styles.copyBtn}>
                {copied ? "✅ Copied" : "📋 Copy"}
              </button>
            </div>

            <div style={{ marginTop: 15 }}>
              {isVideo(url) ? (
                <video src={url} controls width="300" />
              ) : (
                <img src={url} alt="Uploaded" width="300" loading="lazy" />
              )}
            </div>

            <button onClick={deleteFile} style={styles.deleteBtn}>
              Delete from S3
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ===============================
   STYLES (UNCHANGED)
   =============================== */

const styles = {
  page: {
    minHeight: "100vh",
    background: "#fff8e6",
    padding: 30,
    fontFamily: "Segoe UI, sans-serif"
  },
  header: {
    textAlign: "center",
    marginBottom: 30
  },
  logo: {
    width: 90,
    marginBottom: 10
  },
  title: {
    fontFamily: "Playfair Display, serif",
    fontSize: 28,
    color: "#7f1a2b",
    margin: 0
  },
  subtitle: {
    color: "#555",
    marginTop: 4
  },
  card: {
    maxWidth: 420,
    margin: "0 auto",
    background: "#fff",
    padding: 25,
    borderRadius: 16,
    boxShadow: "0 10px 30px rgba(0,0,0,0.08)"
  },
  cardTitle: {
    marginBottom: 20,
    color: "#2e2e2e"
  },
  label: {
    display: "block",
    marginBottom: 6,
    fontWeight: 600
  },
  select: {
    width: "100%",
    padding: 10,
    borderRadius: 8,
    border: "1px solid #ccc",
    marginBottom: 15
  },
  input: {
    width: "100%",
    marginBottom: 20
  },
  uploadBtn: {
    width: "100%",
    padding: 12,
    borderRadius: 10,
    background: "#7f1a2b",
    color: "#fff",
    border: "none",
    fontSize: 16,
    cursor: "pointer"
  },
  result: {
    marginTop: 20,
    textAlign: "center"
  },
  urlBox: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    justifyContent: "center",
    flexWrap: "wrap"
  },
  urlText: {
    maxWidth: 260,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap"
  },
  copyBtn: {
    padding: "6px 10px",
    borderRadius: 6,
    border: "1px solid #7f1a2b",
    background: "#fff",
    color: "#7f1a2b",
    cursor: "pointer",
    fontWeight: 600
  },
  deleteBtn: {
    marginTop: 15,
    padding: 10,
    background: "#c62828",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    cursor: "pointer"
  }
};
