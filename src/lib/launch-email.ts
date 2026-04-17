export function buildLaunchEmail(opts: { handle?: string | null; foundingMember?: boolean }) {
  const handleLine = opts.handle ? `Your handle placeholder is @${opts.handle}.` : "";
  const foundingLine = opts.foundingMember
    ? "Your Founding Member badge is permanent. It never comes off."
    : "";

  const text = `Welcome to Coda. You're already in.

Your aura is ready. Your trophies are loaded.
${handleLine}
${foundingLine}

Tap below to pick your handle and claim your page.

https://routinex.org/welcome

— Shaun & the RoutineX team`;

  const html = `<!doctype html>
<html>
  <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #09090B; color: #fff; padding: 40px;">
    <div style="max-width: 480px; margin: 0 auto;">
      <h1 style="font-size: 36px; margin: 0 0 16px; font-family: 'Playfair Display', serif;">
        Welcome to
        <span style="background: linear-gradient(to right, #C084FC, #F472B6, #FBBF24); -webkit-background-clip: text; background-clip: text; color: transparent;">Coda</span>.
      </h1>
      <p style="font-size: 17px; line-height: 1.5; opacity: 0.9;">You're already in.</p>
      <p style="font-size: 15px; line-height: 1.6; opacity: 0.8; margin-top: 24px;">
        Your aura is ready. Your trophies are loaded.<br/>
        ${handleLine}<br/>
        ${foundingLine}
      </p>
      <a href="https://routinex.org/welcome" style="display: inline-block; margin-top: 24px; padding: 12px 28px; border-radius: 999px; background: linear-gradient(135deg, #EC4899, #F97316, #FBBF24); color: #fff; font-weight: 700; text-decoration: none;">
        Claim your page
      </a>
      <p style="font-size: 12px; opacity: 0.5; margin-top: 48px;">— Shaun &amp; the RoutineX team</p>
    </div>
  </body>
</html>`;

  return { subject: "Welcome to Coda. You're already in.", text, html };
}
