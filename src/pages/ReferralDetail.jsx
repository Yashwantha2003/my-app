import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { fetchReferrals, parseReferralsResponse } from '../api/referrals';

const formatDate = (isoDate) => (isoDate ? isoDate.replaceAll('-', '/') : '');

const formatProfit = (value) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value ?? 0);

const ReferralDetail = () => {
  const { id } = useParams();
  const [row, setRow] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      setIsLoading(true);
      setNotFound(false);
      try {
        const body = await fetchReferrals({ id });
        const parsed = parseReferralsResponse(body);

        const match =
          parsed.singleRow && String(parsed.singleRow.id) === String(id)
            ? parsed.singleRow
            : parsed.referrals.find((r) => String(r.id) === String(id));

        if (!isMounted) return;

        if (match) {
          setRow(match);
        } else {
          setNotFound(true);
        }
      } catch {
        if (isMounted) setNotFound(true);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    load();
    return () => {
      isMounted = false;
    };
  }, [id]);

  return (
    <div className="referral-detail-page">
      <Navbar />

      <main>
        {isLoading && <p className="loading-text">Loading...</p>}

        {!isLoading && notFound && <h1>Referral not found</h1>}

        {!isLoading && !notFound && row && (
          <>
            <h1>Referral Details</h1>
            <h2>{row.name}</h2>

            <dl className="referral-details-list">
              <div>
                <dt>Referral ID</dt>
                <dd>{row.id}</dd>
              </div>
              <div>
                <dt>Service Name</dt>
                <dd>{row.serviceName}</dd>
              </div>
              <div>
                <dt>Date</dt>
                <dd>{formatDate(row.date)}</dd>
              </div>
              <div>
                <dt>Profit</dt>
                <dd>{formatProfit(row.profit)}</dd>
              </div>
            </dl>

            <Link to="/" aria-label="Back to dashboard">
              ← Back to dashboard
            </Link>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default ReferralDetail;
