// Health check serverless function
export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Initialize OpenAI check
  let openaiAvailable = false;
  try {
    // Check if OpenAI package is available and API key is set
    openaiAvailable = !!process.env.OPENAI_API_KEY;
  } catch (error) {
    openaiAvailable = false;
  }

  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    mode: 'vercel-serverless',
    openaiAvailable: openaiAvailable,
    environment: process.env.NODE_ENV || 'development'
  });
};
