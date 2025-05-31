import { describe, it, expect, vi, beforeEach } from 'vitest';
import { onRequestPost } from './contact';

describe('Contact Form Worker', () => {
  let env;
  let request;

  beforeEach(() => {
    env = {
      CONTACT_MESSAGES: {
        put: vi.fn().mockResolvedValue(undefined)
      },
      POSTMARK_API_TOKEN: 'test-token',
      NOTIFICATION_EMAIL: 'test@example.com',
      TURNSTILE_SECRET_KEY: 'test-turnstile-secret'
    };

    // mock fetch for Postmark API and Turnstile
    global.fetch = vi.fn();
  });

  it('should store message in KV and send email for valid submission', async () => {
    // mock successful Turnstile verification
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ success: true })
    });

    // mock successful Postmark API response
    global.fetch.mockResolvedValueOnce({
      ok: true
    });

    request = new Request('http://localhost/api/contact', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'CF-Connecting-IP': '127.0.0.1'
      },
      body: JSON.stringify({
        name: 'Test User',
        email: 'test@example.com',
        message: 'Test message',
        turnstileToken: 'test-turnstile-token'
      })
    });

    const response = await onRequestPost({ request, env });
    const responseText = await response.text();

    expect(response.status).toBe(200);
    expect(responseText).toBe('Message sent successfully');

    expect(global.fetch).toHaveBeenCalledWith(
      'https://challenges.cloudflare.com/turnstile/v0/siteverify',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Content-Type': 'application/json'
        }),
        body: expect.stringContaining('test-turnstile-secret')
      })
    );

    expect(env.CONTACT_MESSAGES.put).toHaveBeenCalled();
    const storedData = JSON.parse(env.CONTACT_MESSAGES.put.mock.calls[0][1]);
    expect(storedData.name).toBe('Test User');
    expect(storedData.email).toBe('test@example.com');
    expect(storedData.message).toBe('Test message');
    expect(storedData.timestamp).toBeDefined();

    expect(global.fetch).toHaveBeenCalledWith(
      'https://api.postmarkapp.com/email',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'X-Postmark-Server-Token': 'test-token'
        }),
        body: expect.stringContaining('Test User')
      })
    );
  });

  it('should return 400 for missing required fields', async () => {
    request = new Request('http://localhost/api/contact', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: 'Test User'
        // missing email, message, and turnstileToken
      })
    });

    const response = await onRequestPost({ request, env });
    const responseText = await response.text();

    expect(response.status).toBe(400);
    expect(responseText).toBe('Missing required fields');
    expect(env.CONTACT_MESSAGES.put).not.toHaveBeenCalled();
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('should return 400 for invalid Turnstile token', async () => {
    // mock failed Turnstile verification
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ success: false })
    });

    request = new Request('http://localhost/api/contact', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'CF-Connecting-IP': '127.0.0.1'
      },
      body: JSON.stringify({
        name: 'Test User',
        email: 'test@example.com',
        message: 'Test message',
        turnstileToken: 'invalid-token'
      })
    });

    const response = await onRequestPost({ request, env });
    const responseText = await response.text();

    expect(response.status).toBe(400);
    expect(responseText).toBe('Invalid Turnstile token');
    expect(env.CONTACT_MESSAGES.put).not.toHaveBeenCalled();
  });

  it('should return 500 when email sending fails', async () => {
    // mock successful Turnstile verification
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ success: true })
    });

    // mock failed Postmark API response
    global.fetch.mockResolvedValueOnce({
      ok: false
    });

    request = new Request('http://localhost/api/contact', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'CF-Connecting-IP': '127.0.0.1'
      },
      body: JSON.stringify({
        name: 'Test User',
        email: 'test@example.com',
        message: 'Test message',
        turnstileToken: 'test-turnstile-token'
      })
    });

    const response = await onRequestPost({ request, env });
    const responseText = await response.text();

    expect(response.status).toBe(500);
    expect(responseText).toBe('Internal server error');
  });
}); 
