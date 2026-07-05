import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { fetchReferrals, parseReferralsResponse } from '../api/referrals';

const PAGE_SIZE = 10;

const formatDate = (isoDate) => {
  if (!isoDate) return '';
  return isoDate.replaceAll('-', '/');
};

const formatProfit = (value) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value ?? 0);

const Dashboard = () => {
  const [metrics, setMetrics] = useState([]);
  const [serviceSummary, setServiceSummary] = useState(null);
  const [referral, setReferral] = useState(null);
  const [referrals, setReferrals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [copiedField, setCopiedField] = useState('');

  const navigate = useNavigate();

  const loadReferrals = useCallback(async (search, sort) => {
    setIsLoading(true);
    setError(null);
    try {
      const body = await fetchReferrals({ search, sort });
      const parsed = parseReferralsResponse(body);
      setMetrics(parsed.metrics);
      setServiceSummary(parsed.serviceSummary);
      setReferral(parsed.referral);
      setReferrals(parsed.referrals);
      setCurrentPage(1);
    } catch (err) {
      setError({ message: err.message, status: err.status });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadReferrals(searchTerm, sortOrder);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadReferrals(searchTerm, sortOrder);
    }, 300);
    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, sortOrder]);

  const handleCopy = async (text, field) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(''), 1500);
    } catch {
      // clipboard may be unavailable; fail silently
    }
  };

  const totalEntries = referrals.length;
  const totalPages = Math.max(1, Math.ceil(totalEntries / PAGE_SIZE));
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const pageRows = referrals.slice(startIndex, startIndex + PAGE_SIZE);
  const from = totalEntries === 0 ? 0 : startIndex + 1;
  const to = Math.min(startIndex + PAGE_SIZE, totalEntries);

  return (
    <div className="dashboard-page">
      <Navbar />

      <main>
        <header className="page-header">
          <h1>Referral Dashboard</h1>
          <p>Track your referrals, earnings, and partner activity in one place.</p>
        </header>

        {isLoading && <p className="loading-text">Loading...</p>}

        {error && (
          <p className="error-text" role="alert">
            {error.message}
            {error.status ? ` (Status: ${error.status})` : ''}
          </p>
        )}

        {!isLoading && !error && (
          <>
            <section
              role="region"
              aria-label="Overview metrics"
              className="overview-section"
            >
              <h2>Overview</h2>
              <div className="metrics-grid">
                {metrics.map((metric) => (
                  <div key={metric.id} className="metric-card">
                    <p className="metric-label">{metric.label}</p>
                    <p className="metric-value">{metric.value}</p>
                  </div>
                ))}
              </div>
            </section>

            {serviceSummary && (
              <section
                aria-label="Service summary"
                className="service-summary-section"
              >
                <h2>Service summary</h2>
                <div className="summary-grid">
                  <div>
                    <p className="summary-label">Service</p>
                    <p className="summary-value">{serviceSummary.service}</p>
                  </div>
                  <div>
                    <p className="summary-label">Your Referrals</p>
                    <p className="summary-value">
                      {serviceSummary.yourReferrals}
                    </p>
                  </div>
                  <div>
                    <p className="summary-label">Active Referrals</p>
                    <p className="summary-value">
                      {serviceSummary.activeReferrals}
                    </p>
                  </div>
                  <div>
                    <p className="summary-label">Total Ref. Earnings</p>
                    <p className="summary-value">
                      {serviceSummary.totalRefEarnings}
                    </p>
                  </div>
                </div>
              </section>
            )}

            {referral && (
              <section aria-label="Share referral" className="share-section">
                <h2>Refer friends and earn more</h2>

                <div className="share-field">
                  <label htmlFor="referral-link">Your Referral Link</label>
                  <div className="share-row">
                    <input id="referral-link" readOnly value={referral.link} />
                    <button onClick={() => handleCopy(referral.link, 'link')}>
                      {copiedField === 'link' ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                </div>

                <div className="share-field">
                  <label htmlFor="referral-code">Your Referral Code</label>
                  <div className="share-row">
                    <input id="referral-code" readOnly value={referral.code} />
                    <button onClick={() => handleCopy(referral.code, 'code')}>
                      {copiedField === 'code' ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                </div>
              </section>
            )}

            <section className="referrals-section">
              <div className="referrals-header">
                <h2>All referrals</h2>

                <div className="referrals-controls">
                  <input
                    type="search"
                    placeholder="Name or service…"
                    aria-label="Search referrals"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />

                  <label>
                    Sort by date
                    <select
                      value={sortOrder}
                      onChange={(e) => setSortOrder(e.target.value)}
                    >
                      <option value="desc">Newest first</option>
                      <option value="asc">Oldest first</option>
                    </select>
                  </label>
                </div>
              </div>

              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Service</th>
                    <th>Date</th>
                    <th>Profit</th>
                  </tr>
                </thead>
                <tbody>
                  {pageRows.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="empty-state">
                        No matching entries
                      </td>
                    </tr>
                  ) : (
                    pageRows.map((row) => (
                      <tr
                        key={row.id}
                        onClick={() => navigate(`/referral/${row.id}`)}
                        tabIndex={0}
                        role="button"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') navigate(`/referral/${row.id}`);
                        }}
                        className="referral-row"
                      >
                        <td>{row.name}</td>
                        <td>{row.serviceName}</td>
                        <td>{formatDate(row.date)}</td>
                        <td>{formatProfit(row.profit)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>

              <div className="pagination">
                <p>
                  Showing {from}–{to} of {totalEntries} entries
                </p>

                {totalPages > 1 && (
                  <div className="pagination-controls">
                    <button
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage((p) => p - 1)}
                    >
                      Previous
                    </button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (pageNum) => (
                        <button
                          key={pageNum}
                          className={pageNum === currentPage ? 'active' : ''}
                          onClick={() => setCurrentPage(pageNum)}
                        >
                          {pageNum}
                        </button>
                      )
                    )}

                    <button
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage((p) => p + 1)}
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>
            </section>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Dashboard;
