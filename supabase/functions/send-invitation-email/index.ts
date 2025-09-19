import "jsr:@supabase/functions-js/edge-runtime.d.ts";

Deno.serve(async (req: Request) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const { client_email, client_name, invitation_url, coach_name } = await req.json();

    // Configuration Resend (remplacez par votre clé API)
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    
    if (!RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY not configured');
    }

    const emailData = {
      from: 'noreply@votre-domaine.com', // Remplacez par votre domaine vérifié
      to: [client_email],
      subject: `Invitation de ${coach_name} - Rejoignez votre plateforme de coaching`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Invitation à rejoindre votre coach</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Invitation à rejoindre</h1>
            <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">Votre coach vous invite sur la plateforme</p>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #333; margin-top: 0;">Bonjour ${client_name} !</h2>
            
            <p>Votre coach <strong>${coach_name}</strong> vous a invité à rejoindre sa plateforme de coaching personnalisé.</p>
            
            <p>Vous pourrez :</p>
            <ul style="color: #666;">
              <li>Consulter vos séances d'entraînement</li>
              <li>Suivre votre progression</li>
              <li>Communiquer avec votre coach</li>
              <li>Accéder à des ressources personnalisées</li>
            </ul>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${invitation_url}" 
                 style="background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                Accepter l'invitation
              </a>
            </div>
            
            <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p style="margin: 0; color: #856404;">
                <strong>⏰ Important :</strong> Cette invitation expire dans 7 jours. 
                Cliquez sur le lien ci-dessus pour créer votre compte et configurer votre mot de passe.
              </p>
            </div>
            
            <p style="color: #666; font-size: 14px; margin-top: 30px;">
              Si vous n'avez pas demandé cette invitation, vous pouvez ignorer cet email.
            </p>
          </div>
        </body>
        </html>
      `,
    };

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailData),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Resend API error: ${error}`);
    }

    const result = await response.json();

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Email sent successfully',
      id: result.id 
    }), {
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error sending email:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});
