import { Handler } from '@netlify/functions';

export const handler: Handler = async (event) => {
  // ── CORS headers (adapte l'origine à ton domaine) ──
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': 'https://cook-ia.online',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  // Preflight OPTIONS
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ success: false, message: 'Méthode non autorisée.' }),
    };
  }

  try {
    const body = JSON.parse(event.body || '{}');
    const token: string = body.token;

    if (!token || typeof token !== 'string') {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ success: false, message: 'Token manquant ou invalide.' }),
      };
    }

    // ── Secret key depuis la variable d'environnement Netlify ──
    const secretKey = process.env.RECAPTCHA_SECRET_KEY;

    if (!secretKey) {
      console.error('RECAPTCHA_SECRET_KEY non définie dans les variables Netlify.');
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ success: false, message: 'Configuration serveur manquante.' }),
      };
    }

    // ── Vérification auprès de Google ──
    const googleRes = await fetch(
      'https://www.google.com/recaptcha/api/siteverify',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `secret=${secretKey}&response=${token}`,
      }
    );

    const googleData = await googleRes.json();

    console.log('Google reCAPTCHA response:', googleData);

    if (googleData.success) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, message: 'Humain vérifié ✅' }),
      };
    } else {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: false,
          message: 'Vérification échouée. Réessaie.',
          errors: googleData['error-codes'] || [],
        }),
      };
    }
  } catch (err) {
    console.error('Erreur verify-captcha:', err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ success: false, message: 'Erreur serveur interne.' }),
    };
  }
};