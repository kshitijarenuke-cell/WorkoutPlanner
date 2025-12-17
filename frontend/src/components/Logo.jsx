const Logo = () => {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "40px", height: "40px", background: "linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)", borderRadius: "12px", marginRight: "10px", boxShadow: "0 4px 6px rgba(37, 99, 235, 0.2)" }}>
      {/* Option 1: The Pulse (Heartbeat) */}
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M22 12H18L15 21L9 3L6 12H2" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </div>
  );
};

export default Logo;