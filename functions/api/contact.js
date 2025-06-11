export async function onRequestPost(context) {
  try {
    const { request, env } = context;
    const { name, email, message, turnstileToken } = await request.json();

    if (!name || !email || !message || !turnstileToken) {
      return new Response('Missing required fields', { status: 400 });
    }

    const turnstileResponse = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        secret: env.TURNSTILE_SECRET_KEY,
        response: turnstileToken,
        remoteip: request.headers.get('CF-Connecting-IP')
      })
    });

    const turnstileResult = await turnstileResponse.json();
    if (!turnstileResult.success) {
      return new Response('Invalid Turnstile token', { status: 400 });
    }

    const messageId = crypto.randomUUID();
    const timestamp = new Date().toISOString();

    // store message in KV
    await env.CONTACT_MESSAGES.put(messageId, JSON.stringify({
      name,
      email,
      message,
      timestamp
    }));

    const emailResponse = await fetch('https://api.postmarkapp.com/email', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'X-Postmark-Server-Token': env.POSTMARK_API_TOKEN
      },
      body: JSON.stringify({
        From: 'contact@gregannandale.com',
        To: env.NOTIFICATION_EMAIL,
        ReplyTo: email,
        Subject: `New contact form submission from ${name}`,
        TextBody: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
        MessageStream: 'outbound'
      })
    });

    if (!emailResponse.ok) {
      throw new Error('Failed to send email');
    }

    return new Response('Message sent successfully', { status: 200 });
  } catch (error) {
    return new Response('Internal server error', { status: 500 });
  }
} 
