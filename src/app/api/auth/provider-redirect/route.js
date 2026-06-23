import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const healthIdUrl = process.env.HEALTH_ID_URL || 'https://uat-moph.id.th';
    const clientId = process.env.PROVIDER_CLIENT_ID || 'your_provider_client_id_here';
    const redirectUri = process.env.PROVIDER_REDIRECT_URI || 'http://localhost:5177/';

    const targetUrl = `${healthIdUrl}/oauth/redirect?client_id=${encodeURIComponent(clientId)}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code`;
    
    console.log('Redirecting to Health ID login:', targetUrl);
    return NextResponse.redirect(targetUrl);
  } catch (error) {
    console.error('Error generating redirect:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', message: error.message },
      { status: 500 }
    );
  }
}
