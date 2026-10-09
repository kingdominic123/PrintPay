import { useState, type FormEvent } from 'react';
import { ArrowDown, ArrowRight, Check, Fingerprint, Menu, X } from 'lucide-react';

type Interest = 'Customer' | 'Merchant' | 'Partner' | 'General Enquiry';
type FormStatus = { kind: 'success' | 'error' | 'info'; message: string } | null;

const interests: Interest[] = ['Customer', 'Merchant', 'Partner', 'General Enquiry'];
const CONTACT_EMAIL = 'uzojidominion@gmail.com';
const SEND_FAILED_MESSAGE = `We could not send your enquiry just now. Please try again, or email ${CONTACT_EMAIL} directly.`;

/**
 * Optional Formspree form ID (public, read at build time). Accepts a bare ID ("xyzabcde") and also
 * tolerates a pasted endpoint ("https://formspree.io/f/xyzabcde"). Anything else is ignored so the
 * site falls back to the honest email-app flow instead of posting to a broken URL.
 */
function resolveFormId(raw: string | undefined): string | null {
  const value = raw?.trim();
  if (!value) return null;
  const candidate = value.replace(/\/+$/, '').split('/').pop() ?? '';
  if (/^[A-Za-z0-9_-]+$/.test(candidate)) return candidate;
  console.warn('VITE_FORMSPREE_FORM_ID is not a valid Formspree form ID; using the email fallback instead.');
  return null;
}

const formId = resolveFormId(import.meta.env.VITE_FORMSPREE_FORM_ID);
const assetUrl = (file: string) => `${import.meta.env.BASE_URL}${file}`;

function Logo({ small = false }: { small?: boolean }) {
  return (
    <a href="#top" className={`brand-lockup ${small ? 'brand-lockup-small' : ''}`} aria-label="PrintPay home" data-testid="link-brand-home">
      <img src={assetUrl('printpay-logo.png')} alt="PrintPay fingerprint mark" width="800" height="800" />
      <span>PrintPay</span>
    </a>
  );
}

function FingerprintArtwork() {
  return (
    <div className="art-wrap" aria-label="An abstract fingerprint-inspired payment signal illustration" role="img" data-testid="visual-fingerprint-concept">
      <div className="art-orbit orbit-one" />
      <div className="art-orbit orbit-two" />
      <svg className="fingerprint-svg" viewBox="0 0 420 420" fill="none" aria-hidden="true">
        <path className="finger-lines" d="M211 54c-83 0-151 66-151 149 0 48 14 91 4 132M211 82c-68 0-123 54-123 121 0 56 13 91 0 139M211 111c-52 0-94 42-94 94 0 68 15 101-1 147M211 141c-35 0-64 28-64 64 0 74 17 105 0 147M211 173c-18 0-32 14-32 32 0 82 17 119-1 153M211 54c83 0 151 66 151 149 0 48-14 91-4 132M211 82c68 0 123 54 123 121 0 56-13 91 0 139M211 111c52 0 94 42 94 94 0 68-15 101 1 147M211 141c35 0 64 28 64 64 0 74-17 105 0 147" stroke="#087F5B" strokeWidth="3.5" strokeLinecap="round" />
        <circle cx="211" cy="205" r="9" fill="#087F5B" />
        <circle cx="211" cy="205" r="22" stroke="#087F5B" strokeOpacity=".23" />
      </svg>
      <div className="signal-pill hero-glass">
        <span className="signal-dot" />
        <span>Fingerprint-assisted identification</span>
      </div>
      <div className="signal-note hero-glass">
        <span className="note-mark"><Fingerprint size={18} strokeWidth={1.7} /></span>
        <span><b>A more connected payment</b><small>Concept in development</small></span>
      </div>
    </div>
  );
}

function App() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [interest, setInterest] = useState<Interest>('General Enquiry');
  const [status, setStatus] = useState<FormStatus>(null);
  const [submitting, setSubmitting] = useState(false);

  const goToContact = (selected?: Interest) => {
    if (selected) setInterest(selected);
    setMobileOpen(false);
    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
  };

  const submitEnquiry = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus(null);
    const form = event.currentTarget;
    if (!form.reportValidity()) return;
    const values = new FormData(form);
    const name = String(values.get('name') ?? '').trim();
    const email = String(values.get('email') ?? '').trim();
    const category = String(values.get('interest') ?? '');
    const message = String(values.get('message') ?? '').trim();
    if (!name || !email || !category || !message) {
      setStatus({ kind: 'error', message: 'Please complete each field before sending.' });
      return;
    }

    if (!formId) {
      const subject = encodeURIComponent(`PrintPay enquiry — ${category}`);
      const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\nInterest: ${category}\n\nMessage:\n${message}`);
      window.location.href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
      setStatus({ kind: 'info', message: `Your email app should open with your enquiry pre-filled. This page has not submitted a web form; send the message from your email app to complete it. If nothing opens, please email ${CONTACT_EMAIL} directly.` });
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(`https://formspree.io/f/${encodeURIComponent(formId)}`, {
        method: 'POST',
        body: values,
        headers: { Accept: 'application/json' },
      });
      if (!response.ok) {
        const result = await response.json().catch(() => null);
        const detail = result?.errors?.map((item: { message: string }) => item.message).join(' ');
        setStatus({ kind: 'error', message: detail || SEND_FAILED_MESSAGE });
        return;
      }
      form.reset();
      setInterest('General Enquiry');
      setStatus({ kind: 'success', message: 'Your enquiry has been sent. Thank you for getting in touch.' });
    } catch {
      // Network failure, blocked request, etc. Nothing was sent, so say so.
      setStatus({ kind: 'error', message: SEND_FAILED_MESSAGE });
    } finally {
      setSubmitting(false);
    }
  };

  const navLinks = [
    { label: 'The Vision', href: '#vision' },
    { label: 'How It Works', href: '#how-it-works' },
    { label: 'For Merchants', href: '#for-customers-merchants' },
    { label: 'Contact', href: '#contact' },
  ];

  return (
    <div className="site-shell" id="top">
      <header className="site-header">
        <div className="container-wide header-inner">
          <Logo />
          <nav className="desktop-nav" aria-label="Main navigation">
            {navLinks.map((link) => <a key={link.href} href={link.href} data-testid={`link-nav-${link.label.toLowerCase().replaceAll(' ', '-')}`}>{link.label}</a>)}
          </nav>
          <button className="header-cta" onClick={() => goToContact()} data-testid="button-nav-contact">Get in touch <ArrowRight size={15} /></button>
          <button className="menu-toggle" type="button" aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'} aria-expanded={mobileOpen} aria-controls="mobile-navigation" onClick={() => setMobileOpen((open) => !open)} data-testid="button-mobile-menu">
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
        <nav id="mobile-navigation" className="mobile-menu" data-open={mobileOpen} aria-label="Mobile navigation" aria-hidden={!mobileOpen}>
          {navLinks.map((link) => <a key={link.href} href={link.href} onClick={() => setMobileOpen(false)} tabIndex={mobileOpen ? 0 : -1} data-testid={`link-mobile-${link.label.toLowerCase().replaceAll(' ', '-')}`}>{link.label}<ArrowRight size={16} /></a>)}
          <button type="button" className="mobile-contact" onClick={() => goToContact()} tabIndex={mobileOpen ? 0 : -1} data-testid="button-mobile-contact">Get in touch <ArrowRight size={16} /></button>
        </nav>
      </header>

      <main>
        <section className="hero-section" aria-labelledby="hero-title">
          <div className="container-wide hero-grid">
            <div className="hero-copy">
              <div className="announcement reveal"><span className="announcement-dot" /> Introducing PrintPay</div>
              <h1 className="display-font reveal reveal-delay-1" id="hero-title">Your fingerprint.<br /><span>A simpler way to pay.</span></h1>
              <p className="hero-description reveal reveal-delay-2">PrintPay is building a new payment experience that connects fingerprint-based authentication, personal accounts, and merchant POS into one simple vision for everyday payments.</p>
              <div className="hero-actions reveal reveal-delay-2">
                <a className="btn-primary" href="#vision" data-testid="link-discover-vision">Discover the vision <ArrowDown size={16} /></a>
                <button className="btn-secondary" onClick={() => goToContact()} data-testid="button-contact-printpay">Contact PrintPay <ArrowRight size={16} /></button>
              </div>
              <div className="development-label" data-testid="status-development"><span className="pulse-dot" /> In development <i /> Coming soon</div>
            </div>
            <div className="hero-art"><FingerprintArtwork /></div>
          </div>
          <div className="hero-bottom container-wide"><span>PAYMENTS, REIMAGINED AROUND YOU</span><span className="scroll-cue">Scroll to explore <span /></span></div>
        </section>

        <section className="vision-section section-space" id="vision" aria-labelledby="vision-title">
          <div className="container-wide vision-grid">
            <div className="vision-heading">
              <p className="eyebrow">The idea</p>
              <h2 className="display-font" id="vision-title">Payments should feel <em>more natural.</em></h2>
            </div>
            <div className="vision-copy">
              <p>Everyday payments involve accounts, cards, devices, and multiple steps. PrintPay is exploring a more connected experience, using fingerprint-based authentication alongside the familiar safeguards of a transaction PIN.</p>
              <p>By bringing customers and merchants into one connected ecosystem, PrintPay aims to make the payment experience simpler to understand and easier to navigate.</p>
              <div className="vision-footnote"><span className="mini-rule" /> A considered idea for a more connected everyday</div>
            </div>
          </div>
          <div className="container-wide concept-strip">
            <div className="concept-graphic" aria-hidden="true">
              <div className="concept-node"><span className="node-icon"><Fingerprint size={24} /></span><span>Customer</span></div>
              <div className="concept-connection"><span /><span /><span /></div>
              <div className="concept-node concept-node-center"><span className="node-core">P</span><span>PrintPay</span></div>
              <div className="concept-connection"><span /><span /><span /></div>
              <div className="concept-node"><span className="node-icon pos-icon">POS</span><span>Merchant</span></div>
            </div>
            <span className="strip-caption">The idea: customer account + fingerprint-assisted identification + merchant POS</span>
          </div>
        </section>

        <section className="steps-section section-space" id="how-it-works" aria-labelledby="steps-title">
          <div className="container-wide">
            <div className="section-heading">
              <p className="eyebrow">The envisioned experience</p>
              <h2 className="display-font" id="steps-title">One connected experience.</h2>
              <p>Three parts, thoughtfully brought together. This describes the intended concept—not a service currently available to the public.</p>
            </div>
            <div className="steps-grid">
              <article className="step-item" data-testid="card-step-account">
                <div className="step-top"><span>01</span><div className="step-icon"><span className="account-symbol"><i /><i /><i /></span></div></div>
                <h3>Your account</h3>
                <p>Customers will be able to manage their PrintPay account, view their balance and transactions, and manage their linked payment card.</p>
                <span className="step-index">CUSTOMER</span>
              </article>
              <article className="step-item" data-testid="card-step-pos">
                <div className="step-top"><span>02</span><div className="step-icon"><span className="terminal-symbol"><i /><i /></span></div></div>
                <h3>The merchant POS</h3>
                <p>Participating merchants will have a dedicated POS experience for customer registration, payment initiation, and fingerprint enrollment using compatible hardware.</p>
                <span className="step-index">MERCHANT</span>
              </article>
              <article className="step-item" data-testid="card-step-payment">
                <div className="step-top"><span>03</span><div className="step-icon"><Fingerprint size={28} strokeWidth={1.4} /></div></div>
                <h3>A more connected payment</h3>
                <p>The vision is to identify a customer through fingerprint authentication, verify transaction authorization, and process a payment through the connected PrintPay account.</p>
                <span className="step-index">A CONNECTED IDEA</span>
              </article>
            </div>
          </div>
        </section>

        <section className="audience-section section-space" id="for-customers-merchants" aria-labelledby="audience-title">
          <div className="container-wide">
            <div className="audience-heading">
              <div><p className="eyebrow">Two sides, one experience</p><h2 className="display-font" id="audience-title">Designed around both sides <em>of a payment.</em></h2></div>
              <p>Different needs at the counter and in your pocket, considered as part of the same idea.</p>
            </div>
            <div className="audience-panels">
              <article className="audience-panel customer-panel" data-testid="card-audience-customer">
                <div className="panel-art customer-art" aria-hidden="true">
                  <div className="account-window"><div className="window-top"><span /><span /><span /></div><div className="account-avatar">P</div><div className="window-line long" /><div className="window-line" /><div className="window-card"><span>ACCOUNT CONCEPT</span><b>Made to feel familiar.</b></div></div>
                  <span className="panel-art-label">CUSTOMER ACCOUNT · CONCEPT</span>
                </div>
                <div className="audience-panel-copy">
                  <p className="eyebrow">For customers</p><h3 className="display-font">Your money.<br />Your account.</h3>
                  <p>PrintPay is being designed to give customers a clear place to manage their account information, view their balance and transactions, manage a linked card, and control their fingerprint enrollment status.</p>
                  <ul className="feature-list">{['Personal account', 'Balance and transactions', 'Card management', 'Fingerprint status and control'].map((item) => <li key={item}><Check size={15} />{item}</li>)}</ul>
                  <button className="text-link panel-link" onClick={() => goToContact('Customer')} data-testid="button-interest-customer">Interested as a Customer? <ArrowRight size={16} /></button>
                </div>
              </article>
              <article className="audience-panel merchant-panel" data-testid="card-audience-merchant">
                <div className="panel-art merchant-art" aria-hidden="true">
                  <div className="counter-illustration"><div className="merchant-counter"><div className="counter-screen"><div className="screen-logo">P</div><span className="screen-rule" /><span className="screen-rule short" /><div className="screen-action">Ready for a new idea</div></div><div className="terminal-base" /></div><div className="counter-orb" /></div>
                  <span className="panel-art-label">MERCHANT POS · CONCEPT</span>
                </div>
                <div className="audience-panel-copy">
                  <p className="eyebrow">For merchants</p><h3 className="display-font">Payments built<br />around your counter.</h3>
                  <p>PrintPay's merchant experience is being designed around POS operations, customer registration, fingerprint enrollment, and payment processing in a single connected workflow.</p>
                  <ul className="feature-list">{['Merchant POS experience', 'Customer registration', 'Fingerprint enrollment', 'Payment and transaction records'].map((item) => <li key={item}><Check size={15} />{item}</li>)}</ul>
                  <button className="text-link panel-link" onClick={() => goToContact('Merchant')} data-testid="button-interest-merchant">Interested as a Merchant? <ArrowRight size={16} /></button>
                </div>
              </article>
            </div>
          </div>
        </section>

        <section className="coming-section" aria-labelledby="coming-title">
          <div className="coming-texture" aria-hidden="true" />
          <div className="container-wide coming-content">
            <p className="eyebrow">A new idea, taking shape</p>
            <h2 className="display-font" id="coming-title">We're building<br />what comes next.</h2>
            <p>PrintPay is currently in development. We're working towards a connected payment experience that brings customers, merchants, and fingerprint-enabled POS together.</p>
            <button className="btn-primary coming-button" onClick={() => goToContact()} data-testid="button-stay-connected">Stay connected <ArrowRight size={16} /></button>
            <span className="coming-note">Want to learn more, collaborate, or explore the idea with us? We'd love to hear from you.</span>
          </div>
          <div className="coming-mark" aria-hidden="true"><img src={assetUrl('printpay-logo.png')} alt="" width="800" height="800" /></div>
        </section>

        <section className="contact-section section-space" id="contact" aria-labelledby="contact-title">
          <div className="container-wide contact-grid">
            <div className="contact-intro">
              <p className="eyebrow">Start a conversation</p>
              <h2 className="display-font" id="contact-title">Let's talk about PrintPay.</h2>
              <p>Interested in the idea? Are you a potential merchant, customer, collaborator, or someone who wants to learn more? Get in touch.</p>
              <div className="contact-direct">
                <span>Prefer email?</span>
                <a href={`mailto:${CONTACT_EMAIL}`} data-testid="link-contact-email">uzojidominion@gmail.com <ArrowRight size={15} /></a>
                <span className="phone-label">Or call</span>
                <a href="tel:09063540737" data-testid="link-contact-phone">09063540737 <ArrowRight size={15} /></a>
              </div>
              {!formId && import.meta.env.DEV && <div className="setup-note" data-testid="status-mailto-fallback">Email-app fallback is active. Add <code>VITE_FORMSPREE_FORM_ID</code> to enable direct form submission.</div>}
            </div>
            <form className="contact-card" onSubmit={submitEnquiry} noValidate data-testid="form-contact">
              <div className="form-heading"><span>Tell us a little about it</span><span className="required-note">All fields required</span></div>
              <div className="form-two">
                <label>Name<span className="required-star"> *</span><input className="form-control" type="text" name="name" placeholder="Your name" autoComplete="name" required minLength={2} data-testid="input-name" /></label>
                <label>Email<span className="required-star"> *</span><input className="form-control" type="email" name="email" placeholder="you@example.com" autoComplete="email" required data-testid="input-email" /></label>
              </div>
              <label>I am interested as<span className="required-star"> *</span>
                <select className="form-control" name="interest" value={interest} onChange={(event) => setInterest(event.target.value as Interest)} required data-testid="select-interest">
                  {interests.map((option) => <option key={option} value={option}>{option}</option>)}
                </select>
              </label>
              <label>Message<span className="required-star"> *</span><textarea className="form-control message-box" name="message" placeholder="What would you like to explore?" required minLength={8} rows={4} data-testid="input-message" /></label>
              <input type="text" name="_gotcha" tabIndex={-1} autoComplete="off" className="honeypot" aria-hidden="true" />
              <button className="btn-primary submit-button" type="submit" disabled={submitting} data-testid="button-submit-enquiry">{submitting ? 'Sending…' : 'Send enquiry'} {!submitting && <ArrowRight size={16} />}</button>
              <p className="privacy-note">Your details will only be used to respond to your enquiry.</p>
              {status && <div className={`status-message status-${status.kind}`} role={status.kind === 'error' ? 'alert' : 'status'} aria-live="polite" data-testid={`status-form-${status.kind}`}>{status.message}</div>}
            </form>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="container-wide footer-main">
          <div className="footer-brand"><Logo small /><p>Exploring a more connected<br />way to pay.</p></div>
          <div className="footer-nav-wrap">
            <div><span className="footer-label">Explore</span><a href="#vision" data-testid="link-footer-vision">The Vision</a><a href="#how-it-works" data-testid="link-footer-how-it-works">How It Works</a><a href="#for-customers-merchants" data-testid="link-footer-audiences">For Customers &amp; Merchants</a></div>
            <div><span className="footer-label">Say hello</span><a href="#contact" data-testid="link-footer-contact">Contact PrintPay</a><a href={`mailto:${CONTACT_EMAIL}`} data-testid="link-footer-email">uzojidominion@gmail.com</a></div>
          </div>
          <div className="footer-status"><span className="pulse-dot" /> Currently in development</div>
        </div>
        <div className="container-wide footer-bottom"><span>© {new Date().getFullYear()} PrintPay. All rights reserved.</span><span>Made for a more natural way to pay.</span></div>
      </footer>
    </div>
  );
}

export default App;
