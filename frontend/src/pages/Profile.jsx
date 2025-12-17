import { useState, useContext } from "react";
import axios from "axios";
import AuthContext from "../context/AuthContext";
import LanguageContext from "../context/LanguageContext"; // <--- 1. Import Language Context

// YOUR CUSTOM PINTEREST AVATAR LIST
const AVATAR_OPTIONS = [
  "https://i.pinimg.com/736x/38/24/ae/3824ae069d1d98af56193dfb252f3117.jpg",
  "https://i.pinimg.com/736x/32/d6/03/32d603476c874db687a7634a16bfac9d.jpg",
  "https://i.pinimg.com/736x/6e/52/14/6e5214b1bd71d4ac8c4350301bea7593.jpg",
  "https://i.pinimg.com/736x/6c/d0/66/6cd066eeadab12895f25bcf0d14077d6.jpg",
  "https://i.pinimg.com/736x/df/16/57/df165790d80fa38530f128f350fb315a.jpg",
  "https://i.pinimg.com/736x/7e/2b/57/7e2b57b6a3f2ac1e313095d8024af84f.jpg",
  "https://i.pinimg.com/1200x/33/68/c4/3368c4cf650b851ed3f13b87bc882db9.jpg",
  "https://i.pinimg.com/736x/be/09/81/be0981c4652679ab4db74f764d405132.jpg",
  "https://i.pinimg.com/1200x/d2/fa/c8/d2fac83f8aa6a7b7a6cf1be6a7430d01.jpg",
  "https://i.pinimg.com/736x/e5/59/43/e5594307621cc83a9eb1e5f15cb957e0.jpg",
];

const DEFAULT_PLACEHOLDER = "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png";

const Profile = () => {
  const { user } = useContext(AuthContext);
  const { language, setLanguage, t } = useContext(LanguageContext); // <--- 2. Get Language Tools
  
  const [name, setName] = useState(user?.name || "");
  const [mode, setMode] = useState("sticker"); 
  
  const isCustom = user?.avatar && user.avatar.startsWith("data:image");
  const [selectedAvatar, setSelectedAvatar] = useState(isCustom ? AVATAR_OPTIONS[0] : (user?.avatar || AVATAR_OPTIONS[0]));
  const [customImage, setCustomImage] = useState(isCustom ? user.avatar : "");
  const [loading, setLoading] = useState(false);

  // --- HANDLE FILE ---
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCustomImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveProfile = () => {
    setCustomImage("");
    setMode("sticker");
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);

    let finalAvatar = mode === "sticker" ? selectedAvatar : (customImage || DEFAULT_PLACEHOLDER);

    if (mode === "custom" && !customImage) {
        alert("Please upload an image first!");
        setLoading(false);
        return;
    }

    try {
      const token = user?.token || JSON.parse(localStorage.getItem('user'))?.token;
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      const { data } = await axios.put("/api/users/profile", {
        name,
        avatar: finalAvatar
      }, config);

      localStorage.setItem("user", JSON.stringify(data));
      alert(t('save_changes') + " Success!"); // Using translation here
      window.location.reload(); 
    } catch (error) {
      console.error(error);
      alert("Failed to update profile.");
    }
    setLoading(false);
  };

  const currentPreview = mode === "sticker" ? selectedAvatar : (customImage || DEFAULT_PLACEHOLDER);

  return (
    <div className="card" style={{ maxWidth: "600px", margin: "30px auto", textAlign: "center", paddingBottom: "40px" }}>
      <h2 style={{ color: "#3B82F6", marginBottom: "10px" }}>{t('profile')}</h2>
      
      {/* --- PREVIEW CIRCLE --- */}
      <div style={{ margin: "20px auto", width: "150px", height: "150px", position: "relative", flexShrink: 0 }}>
        <img 
          src={currentPreview} 
          alt="Preview" 
          style={{ width: "100%", height: "100%", borderRadius: "50%", border: "4px solid #3B82F6", objectFit: "cover", background: "#f3f4f6" }}
        />
        <div style={{ 
            position: "absolute", bottom: "5px", right: "5px", background: "#3B82F6", color: "white", padding: "6px", borderRadius: "50%", 
            fontSize: "1rem", border: "2px solid white", boxShadow: "0 4px 6px rgba(0,0,0,0.3)" 
        }}>✏️</div>
      </div>

      {/* --- TABS --- */}
      <div style={{ display: "flex", justifyContent: "center", gap: "10px", marginBottom: "20px" }}>
        <button type="button" onClick={() => setMode("sticker")} style={{ background: mode === "sticker" ? "#3B82F6" : "#E5E7EB", color: mode === "sticker" ? "white" : "#374151", width: "auto", borderRadius: "20px", fontSize: "0.9rem" }}>
            🙂 Stickers
        </button>
        <button type="button" onClick={() => setMode("custom")} style={{ background: mode === "custom" ? "#3B82F6" : "#E5E7EB", color: mode === "custom" ? "white" : "#374151", width: "auto", borderRadius: "20px", fontSize: "0.9rem" }}>
            🖼️ Gallery Upload
        </button>
      </div>

      {/* --- AVATAR SELECTION AREA --- */}
      <div style={{ background: "#F9FAFB", padding: "20px", borderRadius: "12px", marginBottom: "20px", border: "1px solid #E5E7EB" }}>
        
        {/* STICKER GRID */}
        {mode === "sticker" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(80px, 1fr))", gap: "10px" }}>
            {AVATAR_OPTIONS.map((url, index) => (
              <div 
                key={index} 
                onClick={() => setSelectedAvatar(url)}
                style={{ 
                  position: "relative", width: "100%", paddingTop: "100%", borderRadius: "10px", cursor: "pointer", 
                  border: selectedAvatar === url ? "3px solid #3B82F6" : "2px solid transparent", overflow: "hidden", background: "white"
                }}
              >
                <img src={url} alt={`Avatar ${index}`} style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
            ))}
          </div>
        )}

        {/* CUSTOM UPLOAD */}
        {mode === "custom" && (
          <div style={{ textAlign: "left" }}>
            <label style={{ fontSize: "0.9rem", fontWeight: "bold" }}>📂 Select from Device:</label>
            <input 
              type="file" accept="image/*" onChange={handleFileChange}
              style={{ width: "100%", padding: "10px", marginTop: "5px", borderRadius: "8px", border: "1px solid #D1D5DB", background: "white" }}
            />
            {customImage && (
                <button type="button" onClick={handleRemoveProfile} style={{ marginTop: "10px", background: "#FECACA", color: "#EF4444", border: "1px solid #EF4444", fontSize: "0.8rem", padding: "5px 10px", width: "auto" }}>🗑️ Remove Photo</button>
            )}
          </div>
        )}
      </div>

      {/* --- 3. LANGUAGE SWITCHER (NEW) --- */}
      <div style={{ background: "#EFF6FF", padding: "15px", borderRadius: "12px", marginBottom: "20px", border: "1px solid #BFDBFE", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontSize: "1.5rem" }}>🌐</span>
          <span style={{ fontWeight: "bold", color: "#1E40AF" }}>{t('language')}</span>
        </div>

        <select 
          value={language} 
          onChange={(e) => setLanguage(e.target.value)}
          style={{ 
            padding: "8px 12px", borderRadius: "8px", border: "1px solid #93C5FD", 
            background: "white", cursor: "pointer", width: "auto", marginBottom: 0,
            color: "#1E40AF", fontWeight: "bold"
          }}
        >
          <option value="en">English 🇺🇸</option>
          <option value="es">Español 🇪🇸</option>
          <option value="hi">Hindi 🇮🇳</option>
          <option value="fr">Français 🇫🇷</option>
        </select>
      </div>

      {/* --- SAVE FORM --- */}
      <form onSubmit={handleUpdate} style={{ textAlign: "left", maxWidth: "400px", margin: "0 auto" }}>
        <label style={{ fontWeight: "bold", fontSize: "0.9rem" }}>Display Name</label>
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} style={{ marginBottom: "15px" }} />

        <button type="submit" disabled={loading} style={{ marginTop: "20px", width: "100%", padding: "12px", fontSize: "1rem" }}>
          {loading ? "Saving..." : t('save_changes')}
        </button>
      </form>
    </div>
  );
};

export default Profile;