import { Link, useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';

const Navbar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    Cookies.remove('jwt_token');
    navigate('/login');
  };

  return (
    <header className="navbar">
      <Link to="/" className="brand-link" aria-label="Go to dashboard home">
        Go Business
      </Link>
      <nav aria-label="Primary">
        <Link to="/">Home</Link>
      </nav>
      <button onClick={handleLogout} className="logout-btn">
        Log out
      </button>
    </header>
  );
};

export default Navbar;
