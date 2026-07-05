import { Link } from 'react-router-dom';

const NotFound = () => (
  <div className="not-found-page">
    <h1>404</h1>
    <p>Page not found</p>
    <Link to="/" aria-label="Back to dashboard">
      Back to dashboard
    </Link>
  </div>
);

export default NotFound;
