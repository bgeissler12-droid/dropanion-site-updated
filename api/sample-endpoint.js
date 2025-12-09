// api/sample-endpoint.js
// Simple GET endpoint for testing. Returns a generic JSON payload.

module.exports = async (req, res) => {
	// Allow simple CORS for quick testing from other origins/tools
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
	res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

	if (req.method === 'OPTIONS') return res.status(200).end();

	if (req.method !== 'GET') {
		return res.status(405).json({ ok: false, error: 'Method not allowed' });
	}

	try {
		const response = {
			ok: true,
			message: 'Sample GET response from sample-endpoint',
			time: new Date().toISOString(),
			query: req.query || null,
		};

		return res.status(200).json(response);
	} catch (err) {
		console.error('sample-endpoint error:', err);
		return res.status(500).json({ ok: false, error: String(err) });
	}
};
