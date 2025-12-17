import { useState, useEffect, useRef } from "react";
import axios from "axios";
// Optional: Import a sound effect if you want 'typing' sounds
// import typingSound from "../assets/typing.mp3"; 

const AiCoach = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [pendingWorkout, setPendingWorkout] = useState(null);
  
  // Ref to auto-scroll to bottom
  const messagesEndRef = useRef(null);
  // Ref to keep track of the current typing interval so we can clear it if needed
  const typingIntervalRef = useRef(null);

  const user = JSON.parse(localStorage.getItem("user"));
  const userName = user ? user.name.split(" ")[0] : "Athlete";

  // --- 1. THE BRAIN (Simulated Intelligence) ---
  const brain = {
    tired: [
      "Tired is just a mindset. Your goals don't care about your feelings. Go do 5 minutes!",
      "I get it. But you know what feels better than sleep? Results. Get moving.",
      "Fatigue is mental. Drink some water, put on your favorite song, and GO.",
    ],
    diet: [
      "Abs are revealed in the kitchen. Are you eating enough protein today?",
      "Fuel your body like a Ferrari, not a garbage truck. Eat clean!",
      "Hydrate! Water is the most important supplement you can take.",
    ],
    workout: [
      "Never skip leg day! Chicken legs are forbidden here. 🍗",
      "Focus on your form. Quality over quantity, always.",
      "Sore today, strong tomorrow. Embrace the pain.",
    ],
    greeting: [
      `Hey ${userName}! Ready to crush some goals today?`,
      `Hello! I'm connected and ready. What are we training today?`,
      "Hi there! Let's make today count.",
    ],
    default: [
      "That's interesting. Tell me more about your training plan.",
      "Consistency is the magic pill. Just keep showing up.",
      "Success starts with self-discipline. Keep pushing.",
      "I'm here to keep you accountable. No excuses.",
    ]
  };

  const getSmartResponse = (text) => {
    const lower = text.toLowerCase();
    let category = "default";
    
    if (lower.match(/(hi|hello|hey|yo|morning)/)) category = "greeting";
    else if (lower.match(/(bye|later|cya|night)/)) category = "tired"; // specific context
    else if (lower.match(/(tired|sleep|lazy|can't|hard|exhausted)/)) category = "tired";
    else if (lower.match(/(food|diet|eat|hungry|protein|carb|sugar)/)) category = "diet";
    else if (lower.match(/(gym|lift|run|exercise|workout|muscle)/)) category = "workout";

    const responses = brain[category];
    return responses[Math.floor(Math.random() * responses.length)];
  };

  // --- 2. STREAMING LOGIC (The "OpenAI" Effect) ---
 // --- 2. STREAMING LOGIC (The "OpenAI" Effect) ---
  const streamResponse = (fullText) => {
    setIsTyping(true);
    
    // Create a blank message entry for the AI
    setMessages(prev => [...prev, { sender: "ai", text: "" }]);
    
    let index = 0;
    
    // Clear any existing typing interval to be safe
    if (typingIntervalRef.current) clearInterval(typingIntervalRef.current);

    typingIntervalRef.current = setInterval(() => {
      // 1. Get the next character
      const nextChar = fullText.charAt(index);
      
      // 2. Update the LAST message in the array SAFELY
      setMessages(prev => {
        const newMessages = [...prev]; // Copy array
        const lastMsgIndex = newMessages.length - 1;
        
        // CRITICAL FIX: Create a NEW object for the last message
        // Do NOT use += on the old object
        newMessages[lastMsgIndex] = {
            ...newMessages[lastMsgIndex],
            text: newMessages[lastMsgIndex].text + nextChar
        };
        
        return newMessages;
      });

      index++;

      // 3. Stop when finished
      if (index >= fullText.length) {
        clearInterval(typingIntervalRef.current);
        setIsTyping(false);
      }
      
      // Scroll to bottom
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });

    }, 30); 
  };

  // --- 3. LIFECYCLE HOOKS ---
 // --- 3. LIFECYCLE HOOKS ---
  useEffect(() => {
    // We use a ref to track the timeout so we can clear it if the user leaves the page fast
    let timeoutId;

    // Initial Greeting Stream
    timeoutId = setTimeout(() => {
      streamResponse(`Hello ${userName}! I'm your AI Coach. Ready to work?`);
    }, 500);

    // ... (Your existing checkStatus logic stays here) ...

    // Cleanup function
    return () => {
      clearTimeout(timeoutId); // Stop the 'Hello' if component unmounts
      if (typingIntervalRef.current) clearInterval(typingIntervalRef.current);
    };
  }, []);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return; // Prevent sending while AI is typing

    const userText = input;
    setInput("");
    
    // 1. Add User Message immediately
    setMessages(prev => [...prev, { sender: "user", text: userText }]);

    // 2. Wait a tiny bit to simulate "thinking", then start streaming
    setTimeout(() => {
      let replyText = "";
      // Smart injection of pending workouts
      if (pendingWorkout && Math.random() > 0.8) {
        replyText = `Less chatting, more lifting! You still have to finish ${pendingWorkout}. Go!`;
      } else {
        replyText = getSmartResponse(userText);
      }
      streamResponse(replyText);
    }, 600); 
  };

  return (
    <div className="ai-coach-container" style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 120px)" }}>
      
      {/* ALERT BANNER */}
      {pendingWorkout && (
        <div style={{ 
          background: "rgba(239, 68, 68, 0.1)", color: "#EF4444", padding: "12px", borderRadius: "10px", 
          border: "1px solid #EF4444", marginBottom: "15px", display: "flex", alignItems: "center", gap: "10px",
          fontSize: "0.9rem"
        }}>
          <span>📢</span>
          <div><strong>Unfinished Business:</strong> {pendingWorkout}</div>
        </div>
      )}

      {/* CHAT BOX */}
      <div className="card" style={{ flex: 1, display: "flex", flexDirection: "column", padding: "0", overflow: "hidden" }}>
        
        {/* Header */}
        <div style={{ padding: "15px", background: "var(--bg-main)", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ fontSize: "1.5rem" }}>🤖</div>
          <h3 style={{ margin: 0, color: "var(--text-primary)" }}>AI Coach</h3>
          {isTyping && <span style={{ fontSize: "0.8rem", color: "var(--primary)", marginLeft: "auto", fontWeight: "bold" }}>Typing...</span>}
        </div>

        {/* Messages Area */}
        <div style={{ 
            flex: 1, overflowY: "auto", padding: "20px", 
            display: "flex", flexDirection: "column", gap: "15px", 
            background: "var(--bg-card)"
        }}>
          {messages.map((msg, index) => (
            <div key={index} style={{ 
                alignSelf: msg.sender === "user" ? "flex-end" : "flex-start", 
                maxWidth: "80%" 
            }}>
              <div style={{
                background: msg.sender === "user" ? "var(--primary)" : "var(--bg-main)",
                color: msg.sender === "user" ? "white" : "var(--text-primary)",
                padding: "12px 16px",
                borderRadius: msg.sender === "user" ? "18px 18px 0 18px" : "18px 18px 18px 0",
                fontSize: "0.95rem", lineHeight: "1.5", 
                boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                whiteSpace: "pre-wrap" // Preserves formatting if AI sends lists
              }}>
                {msg.text}
                {/* Add a flashing cursor to the active AI message */}
                {msg.sender === 'ai' && isTyping && index === messages.length - 1 && (
                  <span className="typing-cursor">|</span>
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <form onSubmit={handleSend} style={{ 
            padding: "15px", borderTop: "1px solid var(--border)", 
            background: "var(--bg-main)", display: "flex", gap: "10px" 
        }}>
          <input 
            type="text" placeholder="Ask about fitness, diet, or motivation..." 
            value={input} onChange={(e) => setInput(e.target.value)}
            disabled={isTyping} // Disable input while AI is talking
            autoFocus
            style={{ marginBottom: 0, background: "var(--bg-card)" }} 
          />
          <button type="submit" disabled={isTyping || !input.trim()} style={{ width: "auto" }}>
            ➤
          </button>
        </form>
      </div>
    </div>
  );
};

export default AiCoach;