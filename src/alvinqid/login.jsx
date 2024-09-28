import React, { useState } from 'react';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';

const CLIENT_ID = '273715281895-kdsuptbhhcos1p5mv1uf91oib3it6h2v.apps.googleusercontent.com';

const App = () => {
  const [user, setUser] = useState(null);

  const handleLoginSuccess = async (credentialResponse) => {
    const tokenId = credentialResponse.credential;

    try {
      const response = await fetch('https://api.alvinqid.cloud-ip.biz/api/google-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tokenId }),
        credentials: 'include' // Kirim cookie secara otomatis
      });

      const resRes = await response.json();
      console.log(resRes);

      const data = resRes;
      if (data.success) {
        setUser(data.user); // Data user disimpan di state, bukan token
      } else {
        console.log("Login failed:", data);
      }
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  const handleLoginFailure = (error) => {
    console.error('Login failed:', error);
  };

  return (
    <GoogleOAuthProvider clientId={CLIENT_ID}>
      <div>
        {!user ? (
          <GoogleLogin
            onSuccess={handleLoginSuccess}
            onError={handleLoginFailure}
          />
        ) : (
          <div>
            <h1>Welcome, {user.name}</h1>
          </div>
        )}
      </div>
    </GoogleOAuthProvider>
  );
};


const Login = App;
export default Login;
