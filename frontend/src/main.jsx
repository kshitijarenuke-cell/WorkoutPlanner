import { StrictMode } from 'react'
import './index.css'
import App from './App.jsx'
import React from 'react';
import ReactDOM from 'react-dom/client';
import { GoogleOAuthProvider } from '@react-oauth/google';

const root = ReactDOM.createRoot(document.getElementById('root'));  

const GOOGLE_CLIENT_ID = "465011250484-d1a4s46vtatdfujp75ibj2c8nc3e3u8q.apps.googleusercontent.com";

root.render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
  <StrictMode>
    <App />
  </StrictMode>
  </GoogleOAuthProvider>
  </React.StrictMode>
);  