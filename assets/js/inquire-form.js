/* Madame Wedding Design — the 5-step inquiry form, as ONE shared component.
   Rendered into every element bearing [data-inquire-form] (the /inquire/ page
   and the closing section of the home page). One markup, one behavior, one
   endpoint — never two copies to maintain.

   Configure your Formspree endpoint below (create one free at formspree.io,
   pointed at hello@madamewedding.design). Until it is set, submissions fall
   back to opening the visitor's email client, pre-filled. */

var FORMSPREE_ENDPOINT = ''; // TODO: e.g. 'https://formspree.io/f/xxxxxxx'

(function () {
  'use strict';

  var MARKUP =
    '<form class="inquire-form" novalidate>' +
      '<div class="form-progress"><div class="form-progress__bar"></div></div>' +

      '<fieldset class="form-step is-active" data-step="1">' +
        '<p class="form-step__eyebrow">Step 1 / 5 — You</p>' +
        '<h3 class="form-step__title">Let us begin with you</h3>' +
        '<div class="field"><label>Full name(s)' +
          '<input type="text" name="names" placeholder="Both partners, if you wish" required></label>' +
          '<p class="field__error">May we have your name?</p></div>' +
        '<div class="field"><label>Email' +
          '<input type="email" name="email" placeholder="you@email.com" required></label>' +
          '<p class="field__error">A valid email lets us reply to you.</p></div>' +
        '<div class="field"><label>Phone / WhatsApp' +
          '<input type="tel" name="phone" placeholder="+1 …"></label></div>' +
        '<div class="field"><span class="field__legend">How did you find us?</span>' +
          '<div class="choices">' +
            ['Instagram', 'Referral', 'Press', 'Google / AI search', 'Other'].map(function (v) {
              return '<label><input type="radio" name="found" value="' + v + '"><span>' + v + '</span></label>';
            }).join('') +
          '</div></div>' +
      '</fieldset>' +

      '<fieldset class="form-step" data-step="2">' +
        '<p class="form-step__eyebrow">Step 2 / 5 — The Celebration</p>' +
        '<h3 class="form-step__title">The celebration</h3>' +
        '<div class="field"><label>Date or timeframe' +
          '<input type="text" name="date" placeholder="A date, a season, or still deciding" required></label>' +
          '<p class="field__error">A season or “still deciding” is perfectly fine.</p></div>' +
        '<div class="field"><label>Destination or location' +
          '<input type="text" name="destination" placeholder="City, country — or open to recommendations" required></label>' +
          '<p class="field__error">“Open to recommendations” is a lovely answer too.</p></div>' +
        '<div class="field"><span class="field__legend">Estimated guests</span>' +
          '<div class="choices">' +
            ['Up to 50', '50–120', '120–250', '250+'].map(function (v) {
              return '<label><input type="radio" name="guests" value="' + v + '"><span>' + v + '</span></label>';
            }).join('') +
          '</div></div>' +
        '<div class="field"><span class="field__legend">Type of celebration</span>' +
          '<div class="choices">' +
            ['Wedding', 'Multi-day celebration', 'Destination wedding', 'Private event'].map(function (v) {
              return '<label><input type="radio" name="type" value="' + v + '"><span>' + v + '</span></label>';
            }).join('') +
          '</div></div>' +
      '</fieldset>' +

      '<fieldset class="form-step" data-step="3">' +
        '<p class="form-step__eyebrow">Step 3 / 5 — The Vision</p>' +
        '<h3 class="form-step__title">Your vision</h3>' +
        '<div class="field"><label>What kind of experience are you dreaming of?' +
          '<textarea name="vision" placeholder="Tell us, in your own words…"></textarea></label></div>' +
        '<div class="field"><span class="field__legend">Which services do you need?</span>' +
          '<div class="choices">' +
            ['Full Wedding Planning & Production', 'Creative Direction', 'Destination & Logistics'].map(function (v) {
              return '<label><input type="checkbox" name="services" value="' + v.replace(/&/g, '&amp;') + '"><span>' + v.replace(/&/g, '&amp;') + '</span></label>';
            }).join('') +
          '</div></div>' +
      '</fieldset>' +

      '<fieldset class="form-step" data-step="4">' +
        '<p class="form-step__eyebrow">Step 4 / 5 — Investment</p>' +
        '<h3 class="form-step__title">Your investment</h3>' +
        '<p class="form-step__intro">To serve you fully, we design celebrations from a certain scale of investment. Please select your range.</p>' +
        '<div class="field"><div class="choices choices--stack" data-required>' +
          ['$100,000 – $250,000', '$250,000 – $500,000', '$500,000 – $1,000,000', '$1,000,000 +', 'Prefer to discuss privately'].map(function (v) {
            return '<label><input type="radio" name="investment" value="' + v + '"><span>' + v + '</span></label>';
          }).join('') +
        '</div>' +
        '<p class="field__error" style="display:none">Please select a range — “prefer to discuss privately” is always available.</p></div>' +
      '</fieldset>' +

      '<fieldset class="form-step" data-step="5">' +
        '<p class="form-step__eyebrow">Step 5 / 5 — A last word</p>' +
        '<h3 class="form-step__title">A last word</h3>' +
        '<div class="field"><label>Anything else we should know?' +
          '<textarea name="more" placeholder="Optional"></textarea></label></div>' +
        '<div class="field">' +
          '<label class="consent"><input type="checkbox" name="consent" value="yes" required>' +
            '<span>I agree to be contacted regarding my enquiry.</span></label>' +
          '<p class="field__error">We need your consent to reply.</p>' +
          '<label class="consent"><input type="checkbox" name="newsletter" value="yes">' +
            '<span>Receive our journal.</span></label>' +
        '</div>' +
      '</fieldset>' +

      '<div class="form-nav">' +
        '<button type="button" class="btn btn--ghost" data-back style="visibility:hidden">← Back</button>' +
        '<button type="button" class="btn" data-next>Continue</button>' +
      '</div>' +
    '</form>' +
    '<div class="form-confirmation">' +
      '<h3>Thank you.</h3>' +
      '<p>Your celebration has our full attention. We reply to every enquiry within 48 hours.</p>' +
    '</div>';

  function init(mount) {
    mount.innerHTML = MARKUP;

    var form = mount.querySelector('.inquire-form');
    var steps = Array.prototype.slice.call(form.querySelectorAll('.form-step'));
    var bar = form.querySelector('.form-progress__bar');
    var backBtn = form.querySelector('[data-back]');
    var nextBtn = form.querySelector('[data-next]');
    var confirmEl = mount.querySelector('.form-confirmation');
    var total = steps.length;
    var step = 1;

    function current() { return steps[step - 1]; }

    function render() {
      steps.forEach(function (s, i) { s.classList.toggle('is-active', i === step - 1); });
      bar.style.width = (step / total * 100) + '%';
      backBtn.style.visibility = step === 1 ? 'hidden' : 'visible';
      nextBtn.textContent = step === total ? 'Send enquiry' : 'Continue';
    }

    function validateStep() {
      var ok = true;
      current().querySelectorAll('.field').forEach(function (field) {
        field.classList.remove('has-error');
        var groupErr = field.querySelector('.field__error');
        if (groupErr) groupErr.style.display = '';
        var input = field.querySelector('input[required], textarea[required]');
        if (input) {
          var bad = input.type === 'checkbox' ? !input.checked :
                    input.type === 'email' ? !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value.trim()) :
                    !input.value.trim();
          if (bad) { field.classList.add('has-error'); ok = false; }
        }
        var group = field.querySelector('.choices[data-required]');
        if (group && !group.querySelector('input:checked')) {
          field.classList.add('has-error');
          var err = field.querySelector('.field__error');
          if (err) err.style.display = 'block';
          ok = false;
        }
      });
      return ok;
    }

    function collect() {
      var data = {};
      new FormData(form).forEach(function (value, key) {
        data[key] = data[key] ? data[key] + ', ' + value : value;
      });
      data._subject = 'New enquiry — ' + (data.names || 'a couple') + (data.destination ? ' · ' + data.destination : '');
      return data;
    }

    function showConfirmation() {
      form.style.display = 'none';
      confirmEl.classList.add('is-visible');
      mount.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    function fail() {
      nextBtn.disabled = false;
      nextBtn.textContent = 'Send enquiry';
      alert('Something interrupted the sending. Please try again, or write to hello@madamewedding.design.');
    }

    function submit() {
      var data = collect();
      nextBtn.disabled = true;
      nextBtn.textContent = 'Sending…';

      if (FORMSPREE_ENDPOINT) {
        // Option A — Formspree (if an endpoint is configured)
        fetch(FORMSPREE_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify(data)
        }).then(function (r) {
          if (r.ok) { showConfirmation(); } else { throw new Error('send failed'); }
        }).catch(fail);
      } else {
        // Option B (default) — Netlify Forms: silent background POST, no email
        // window for the visitor. Pairs with the hidden static form named
        // "inquire" present in the page HTML (required for Netlify detection).
        var body = new URLSearchParams();
        body.append('form-name', 'inquire');
        Object.keys(data).forEach(function (k) {
          if (k[0] !== '_') body.append(k, data[k]);
        });
        fetch('/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: body.toString()
        }).then(function (r) {
          if (r.ok) { showConfirmation(); } else { throw new Error('send failed'); }
        }).catch(fail);
      }
    }

    nextBtn.addEventListener('click', function () {
      if (!validateStep()) return;
      if (step < total) {
        step++;
        render();
        mount.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        submit();
      }
    });

    backBtn.addEventListener('click', function () {
      if (step > 1) { step--; render(); }
    });

    render();
  }

  document.querySelectorAll('[data-inquire-form]').forEach(init);
})();
