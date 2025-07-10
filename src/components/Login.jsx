import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../api/api';
import '../styles.css';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await login(username, password);
      localStorage.setItem('token', data.token);
      navigate('/notes');
    } catch (error) {
      alert('Invalid credentials or backend is still waking up.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="login-form">
        <h2>Login</h2>
        <input
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit" disabled={loading}>
          Login
        </button>
      </form>

      {loading && (
        <div className="loading-overlay">
          <div className="spinner"></div>
          <p>Starting backend, please wait...</p>
        </div>
      )}
    </>
  );
};

export default Login;
