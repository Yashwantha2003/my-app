import Cookies from 'js-cookie';

const BASE_URL =
  '[v9fes04dwf.execute-api.eu-north-1.amazonaws.com](https://v9fes04dwf.execute-api.eu-north-1.amazonaws.com/api/referrals)';

export const fetchReferrals = async ({ search, sort, id } = {}) => {
  const params = new URLSearchParams();
  if (search) params.set('search', search);
  if (sort) params.set('sort', sort);
  if (id !== undefined && id !== null) params.set('id', id);

  const query = params.toString();
  const url = query ? `${BASE_URL}?${query}` : BASE_URL;

  const token = Cookies.get('jwt_token');

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  let body = null;
  try {
    body = await response.json();
  } catch {
    body = null;
  }

  if (!response.ok) {
    const message = body?.message || 'Something went wrong';
    const error = new Error(message);
    error.status = response.status;
    error.body = body;
    throw error;
  }

  return body;
};

// Normalizes both shapes:
// { success, data: { metrics, serviceSummary, referral, referrals } }
// or fields sitting beside referrals on the same object
export const parseReferralsResponse = (body) => {
  const data = body?.data ?? body ?? {};
  return {
    metrics: data.metrics ?? [],
    serviceSummary: data.serviceSummary ?? null,
    referral: data.referral ?? null,
    referrals: data.referrals ?? [],
    // for single-referral fetches, the row itself may be `data`
    singleRow:
      data.id !== undefined && data.name !== undefined ? data : null,
  };
};
