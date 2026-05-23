/**
 * Cloudflare Pages Function — /api/submit
 *
 * Handles both the Contact form and the Donation form.
 * Forms POST a JSON body; this function validates it and emails the
 * team via the Resend API.
 *
 * Required environment variables (set in the Cloudflare Pages dashboard):
 *   RESEND_API_KEY  — your Resend API key
 *   TO_EMAIL        — where submissions are delivered (e.g. wearemorethanfood@gmail.com)
 *   FROM_EMAIL      — a verified Resend sender (e.g. forms@wearemorethanfood.com)
 */

const JSON_HEADERS = { 'Content-Type': 'application/json' };

function json(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: JSON_HEADERS });
}

// Escape user input before placing it inside an HTML email.
function esc(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Render a clean key/value table for the email body.
function rows(fields) {
  return fields
    .filter(([, value]) => value !== undefined && value !== null && String(value).trim() !== '')
    .map(
      ([label, value]) => `
        <tr>
          <td style="padding:8px 14px;background:#f2e9d7;font-weight:600;color:#14492f;
                     vertical-align:top;white-space:nowrap;border-bottom:1px solid #fff;">
            ${esc(label)}
          </td>
          <td style="padding:8px 14px;color:#1c1a17;border-bottom:1px solid #f2e9d7;">
            ${esc(value).replace(/\n/g, '<br>')}
          </td>
        </tr>`
    )
    .join('');
}

function emailTemplate(heading, intro, tableRows) {
  return `
  <div style="font-family:Inter,Arial,sans-serif;background:#fbf6ec;padding:28px;">
    <div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:16px;
                overflow:hidden;border:1px solid #e7ddc6;">
      <div style="background:#14492f;padding:22px 26px;">
        <p style="margin:0;color:#f0852b;font-size:12px;letter-spacing:.14em;
                  text-transform:uppercase;font-weight:700;">More Than Food</p>
        <h1 style="margin:6px 0 0;color:#fbf6ec;font-size:20px;">${esc(heading)}</h1>
      </div>
      <div style="padding:24px 26px;">
        <p style="margin:0 0 16px;color:#1c1a17;font-size:14px;line-height:1.6;">${esc(intro)}</p>
        <table style="width:100%;border-collapse:collapse;font-size:14px;">${tableRows}</table>
      </div>
      <div style="background:#f2e9d7;padding:14px 26px;">
        <p style="margin:0;color:#5a5648;font-size:12px;">
          Sent automatically from the More Than Food website.
        </p>
      </div>
    </div>
  </div>`;
}

export async function onRequestPost({ request, env }) {
  // 1. Parse the JSON body.
  let data;
  try {
    data = await request.json();
  } catch {
    return json({ error: 'Invalid request format.' }, 400);
  }

  // 2. Honeypot — bots fill hidden fields, real visitors do not.
  //    Return a success response so the bot believes it succeeded.
  if (data.company && String(data.company).trim() !== '') {
    return json({ ok: true });
  }

  // 3. Confirm the environment is configured.
  const apiKey = env.RESEND_API_KEY;
  const toEmail = env.TO_EMAIL || 'wearemorethanfood@gmail.com';
  const fromEmail = env.FROM_EMAIL || 'More Than Food <onboarding@resend.dev>';
  if (!apiKey) {
    return json(
      { error: 'The form is not configured yet. Please email wearemorethanfood@gmail.com.' },
      500
    );
  }

  const formType = data.form_type === 'Donation' ? 'Donation' : 'Contact';

  // 4. Build the email for the matching form type.
  let subject;
  let html;
  let replyTo;

  if (formType === 'Donation') {
    const first = String(data.first_name || '').trim();
    const last = String(data.last_name || '').trim();
    const email = String(data.email || '').trim();
    const amount = Number(data.amount);

    if (!first || !last || !email) {
      return json({ error: 'Please fill in your name and email.' }, 400);
    }
    if (!amount || amount < 5 || amount > 1000) {
      return json({ error: 'Donation amount must be between $5 and $1,000.' }, 400);
    }

    replyTo = email;
    subject = `New donation: $${amount} from ${first} ${last}`;
    html = emailTemplate(
      'New donation registered',
      `${first} ${last} has registered a donation of $${amount}.`,
      rows([
        ['Amount', `$${amount}`],
        ['Name', `${first} ${last}`],
        ['Email', email],
        ['Phone', data.phone],
        ['Address', data.address],
        ['Heard about us', data.referral],
        ['Comments', data.comments],
      ])
    );
  } else {
    const name = String(data.name || '').trim();
    const email = String(data.email || '').trim();
    const subjectLine = String(data.subject || '').trim();
    const message = String(data.message || '').trim();

    if (!name || !email || !subjectLine || !message) {
      return json({ error: 'Please fill in all required fields.' }, 400);
    }

    replyTo = email;
    subject = `Contact form: ${subjectLine}`;
    html = emailTemplate(
      'New contact message',
      `${name} sent a message through the website contact form.`,
      rows([
        ['Name', name],
        ['Email', email],
        ['Phone', data.phone],
        ['Address', data.address],
        ['Subject', subjectLine],
        ['Message', message],
      ])
    );
  }

  // 5. Send via Resend.
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [toEmail],
        reply_to: replyTo,
        subject,
        html,
      }),
    });

    if (!res.ok) {
      const detail = await res.text().catch(() => '');
      console.error('Resend error:', res.status, detail);
      return json(
        { error: 'We could not send your message. Please email wearemorethanfood@gmail.com.' },
        502
      );
    }
  } catch (err) {
    console.error('Submit failed:', err);
    return json(
      { error: 'We could not send your message. Please email wearemorethanfood@gmail.com.' },
      500
    );
  }

  return json({ ok: true });
}

// Any non-POST request to /api/submit returns 405 automatically,
// because only onRequestPost is exported.
