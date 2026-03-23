/**
 * Shared auth layout — navy left panel + cream right panel.
 * Used by Login, StudentRegister, FacultyRegister.
 */

const AUTH_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;600&family=DM+Sans:wght@400;500;600&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  @keyframes authFadeUp {
    from { opacity: 0; transform: translateY(22px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes authFadeIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  @keyframes panelSlide {
    from { opacity: 0; transform: translateX(-18px); }
    to   { opacity: 1; transform: translateX(0); }
  }

  .auth-field-anim {
    opacity: 0;
    animation: authFadeUp 0.5s cubic-bezier(0.22, 1, 0.36, 1) forwards;
  }

  .auth-left-anim {
    opacity: 0;
    animation: panelSlide 0.7s cubic-bezier(0.22, 1, 0.36, 1) forwards;
  }

  .auth-right-anim {
    opacity: 0;
    animation: authFadeIn 0.6s ease forwards;
    animation-delay: 0.15s;
  }

  .auth-input {
    width: 100%;
    background: transparent;
    border: none;
    border-bottom: 1.5px solid #d1cbc0;
    padding: 10px 0 8px;
    font-size: 0.925rem;
    font-family: 'DM Sans', 'Trebuchet MS', sans-serif;
    color: #0d1b2a;
    outline: none;
    transition: border-color 0.2s;
    -webkit-appearance: none;
    border-radius: 0;
  }
  .auth-input::placeholder { color: #b5aea6; }
  .auth-input:focus { border-bottom-color: #c9a84c; }
  .auth-input.has-error { border-bottom-color: #c0392b; }

  .auth-submit {
    width: 100%;
    padding: 13px;
    background: #0d1b2a;
    color: #fff;
    border: none;
    border-radius: 10px;
    font-size: 0.9rem;
    font-weight: 600;
    font-family: 'DM Sans', 'Trebuchet MS', sans-serif;
    cursor: pointer;
    letter-spacing: 0.04em;
    transition: background 0.2s, transform 0.15s;
    margin-top: 8px;
  }
  .auth-submit:hover:not(:disabled) { background: #c9a84c; color: #0d1b2a; }
  .auth-submit:active:not(:disabled) { transform: scale(0.985); }
  .auth-submit:disabled { opacity: 0.5; cursor: not-allowed; }
  .auth-submit:focus-visible { outline: 2px solid #c9a84c; outline-offset: 2px; }

  .auth-link {
    color: #c9a84c;
    text-decoration: none;
    font-weight: 600;
    transition: color 0.15s;
  }
  .auth-link:hover { color: #a07830; }
  .auth-link:focus-visible { outline: 2px solid #c9a84c; outline-offset: 2px; border-radius: 2px; }

  /* Decorative dot grid on left panel */
  .dot-grid {
    position: absolute;
    bottom: 60px; right: 30px;
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    gap: 10px;
    opacity: 0.18;
  }
  .dot-grid span {
    width: 3px; height: 3px;
    border-radius: 50%;
    background: #c9a84c;
    display: block;
  }

  @media (max-width: 720px) {
    .auth-left { display: none !important; }
    .auth-right { min-height: 100vh; }
    .auth-mobile-header { display: flex !important; }
  }
`;

// 30 dot elements for the decorative grid
const DotGrid = () => (
  <div className="dot-grid">
    {Array.from({ length: 42 }).map((_, i) => <span key={i} />)}
  </div>
);

export default function AuthLayout({ children }) {
  return (
    <>
      <style>{AUTH_CSS}</style>
      <div style={{ display: 'flex', minHeight: '100vh', fontFamily: "'DM Sans', 'Trebuchet MS', sans-serif" }}>

        {/* ── Mobile top bar (hidden on desktop) ── */}
        <div className="auth-mobile-header" style={{
          display: 'none',
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 10,
          background: '#0d1b2a', height: 56,
          alignItems: 'center', padding: '0 20px', gap: 10,
        }}>
          <div style={{
            width: 30, height: 30, borderRadius: 7,
            background: 'linear-gradient(135deg, #c9a84c, #e8c96b)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.6rem', fontWeight: 800, color: '#0d1b2a',
            fontFamily: 'Georgia, serif', letterSpacing: '0.06em',
          }}>GAS</div>
          <span style={{ color: '#fff', fontSize: '0.85rem', fontWeight: 700, fontFamily: 'Georgia, serif' }}>
            Guide Allocation System
          </span>
        </div>

        {/* ── Left panel ── */}
        <div className="auth-left" style={{
          width: '42%', flexShrink: 0,
          background: '#0d1b2a',
          position: 'relative', overflow: 'hidden',
          display: 'flex', flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '48px 44px 48px 44px',
        }}>
          {/* Large circle decoration */}
          <div style={{
            position: 'absolute',
            right: -120, bottom: -120,
            width: 400, height: 400,
            borderRadius: '50%',
            border: '1.5px solid rgba(201,168,76,0.18)',
            pointerEvents: 'none',
          }} />
          <div style={{
            position: 'absolute',
            right: -60, bottom: -60,
            width: 260, height: 260,
            borderRadius: '50%',
            border: '1px solid rgba(201,168,76,0.1)',
            pointerEvents: 'none',
          }} />
          {/* Thin horizontal rule accent */}
          <div style={{
            position: 'absolute',
            top: 0, left: 44,
            width: 48, height: 3,
            background: 'linear-gradient(90deg, #c9a84c, transparent)',
          }} />

          <DotGrid />

          {/* Top: logo mark */}
          <div className="auth-left-anim" style={{ animationDelay: '0s' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 0 }}>
              <div style={{
                width: 42, height: 42, borderRadius: 10, flexShrink: 0,
                background: 'linear-gradient(135deg, #c9a84c 0%, #e8c96b 100%)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.68rem', fontWeight: 800, color: '#0d1b2a',
                fontFamily: 'Georgia, serif', letterSpacing: '0.06em',
              }}>GAS</div>
              <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                Guide Allocation System
              </div>
            </div>
          </div>

          {/* Center: hero text */}
          <div className="auth-left-anim" style={{ animationDelay: '0.1s', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', paddingTop: 20 }}>
            <div style={{
              fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.18em',
              textTransform: 'uppercase', color: '#c9a84c',
              marginBottom: 20,
            }}>
              Academic Year 2024–25
            </div>
            <div style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: 'clamp(2.8rem, 4vw, 4rem)',
              fontWeight: 300,
              color: '#fff',
              lineHeight: 1.05,
              letterSpacing: '-0.01em',
            }}>
              The Right<br />
              <span style={{ color: '#c9a84c', fontWeight: 600 }}>Guide</span><br />
              Changes<br />Everything.
            </div>
            <div style={{
              marginTop: 28,
              width: 40, height: 1.5,
              background: 'linear-gradient(90deg, #c9a84c, rgba(201,168,76,0.2))',
            }} />
            <div style={{
              marginTop: 16,
              fontSize: '0.8rem',
              color: 'rgba(255,255,255,0.4)',
              lineHeight: 1.7,
              maxWidth: 280,
              fontWeight: 400,
            }}>
              A platform for students and faculty to connect meaningfully around project work and research guidance.
            </div>
          </div>

          {/* Bottom: version */}
          <div className="auth-left-anim" style={{ animationDelay: '0.2s' }}>
            <div style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.2)', letterSpacing: '0.06em' }}>
              v2.0 · Sprint 2
            </div>
          </div>
        </div>

        {/* ── Right panel ── */}
        <div className="auth-right" style={{
          flex: 1,
          background: '#ede9e3',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '48px 40px',
          overflowY: 'auto',
        }}>
          <div style={{ width: '100%', maxWidth: 420 }}>
            {children}
          </div>
        </div>
      </div>
    </>
  );
}
