const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({
        error: 'Method not allowed'
      }), {
        status: 405,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });
    }
    const body = await req.json().catch(()=>null);
    if (!body) return new Response(JSON.stringify({
      error: 'Invalid JSON body'
    }), {
      status: 400,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });
    const { client_email, client_name, invitation_url, coach_name, type } = body;
    if (!client_email) {
      return new Response(JSON.stringify({
        error: 'Missing client_email'
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });
    }
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    const FROM_EMAIL = Deno.env.get('FROM_EMAIL') ?? 'no-reply@example.com';
    const BASE_URL = Deno.env.get('BASE_URL') ?? new URL(req.url).origin;
    if (!RESEND_API_KEY) {
      return new Response(JSON.stringify({
        error: 'RESEND_API_KEY not set in environment'
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });
    }
    const subject = type === 'client_invitation' ? `${coach_name ?? 'Un coach'} vous invite sur BYW` : 'Notification';
    const html = `
      <p>Bonjour ${client_name ?? ''},</p>
      <p>${coach_name ?? 'Votre coach'} vous invite à rejoindre BYW.</p>
      <p><a href="${invitation_url ?? BASE_URL}">Rejoindre</a></p>
      <p>— BYW</p>
    `;
    const resp = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${RESEND_API_KEY}`
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: client_email,
        subject,
        html
      })
    });
    const data = await resp.json().catch(()=>({
        message: 'No JSON response from provider'
      }));
    if (!resp.ok) {
      return new Response(JSON.stringify({
        success: false,
        error: data
      }), {
        status: 502,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });
    }
    return new Response(JSON.stringify({
      success: true,
      result: data
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });
  } catch (err) {
    return new Response(JSON.stringify({
      success: false,
      error: String(err)
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });
  }
});
