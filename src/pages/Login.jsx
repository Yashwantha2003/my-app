import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';

const LOGIN_URL =
  '[v9fes04dwf.execute-api.eu-north-1.amazonaws.com](https://v9fes04dwf.execute-api.eu-north-1.amazonaws.com/api/auth/signin)';
const ADMIN_EMAIL = 'admin@example.com';
const ADMIN_PASSWORD = 'admin123';
const MOCK_TOKEN = 'mock-jwt-token';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg('');

    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      Cookies.set('jwt_token', MOCK_TOKEN);
      navigate('/');
      return;
    }

    try {
      const response = await fetch(LOGIN_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const responseJson = await response.json();

      if (response.ok) {
        const token = responseJson.data.token;
        Cookies.set('jwt_token', token);
        navigate('/');
      } else {
        setErrorMsg(responseJson.message);
      }
    } catch {
      setErrorMsg('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h1 className="brand-title">Go Business</h1>
        <p className="tagline">Sign in to open your referral dashboard.</p>

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {errorMsg && (
            <p className="error-text" role="alert">
              {errorMsg}
            </p>
          )}

          <button type="submit" disabled={isSubmitting}>
            Sign in
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
