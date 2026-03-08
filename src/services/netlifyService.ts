/**
 * Simple Netlify Deployment Service
 * Note: In a real app, this would use the Netlify API with an OAuth token.
 * For this demo, we'll simulate the deployment process.
 */

export const deployToNetlify = async (siteName: string, htmlCode: string, files: any[] = [], userId?: string) => {
  try {
    const response = await fetch('/api/deploy', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        siteName,
        code: htmlCode,
        files,
        userId
      }),
    });

    const contentType = response.headers.get('content-type');
    if (!response.ok) {
      let errorMessage = 'Deployment failed';
      if (contentType && contentType.includes('application/json')) {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } else {
        const errorText = await response.text();
        console.error('Non-JSON error response:', errorText);
        errorMessage = `Server error (${response.status}): ${errorText.substring(0, 100)}...`;
      }
      throw new Error(errorMessage);
    }

    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      console.error('Expected JSON but got:', text);
      throw new Error('Invalid server response format');
    }

    const data = await response.json();
    
    return {
      success: true,
      url: data.url,
      admin_url: `https://app.netlify.com/sites/${siteName.toLowerCase().replace(/\s+/g, '-')}`
    };
  } catch (error: any) {
    console.error('Deployment service error:', error);
    throw error;
  }
};
