/* Madame Wedding Design — the 5-step inquiry form.
   Configure your Formspree endpoint below (create one free at formspree.io,
   pointed at hello@madamewedding.design). Until it is set, submissions fall
   back to opening the visitor's email client, pre-filled. */

var FORMSPREE_ENDPOINT = ''; // TODO: e.g. 'https://formspree.io/f/xxxxxxx'

(function () {
  var form = document.getElementById('inquireForm');
  var steps = Array.prototype.slice.call(form.querySelectorAll('.form-step'));
  var bar = document.getElementById('bar');
  var backBtn = document.getElementById('backBtn');
  var nextBtn = document.getElementById('nextBtn');
  var confirm = document.getElementById('confirm');
  var total = steps.length;
  var step = 1;

  function current() { return steps[step - 1]; }

  function render() {
    steps.forEach(function (s, i) { s.classList.toggle('is-active', i === step - 1); });
    bar.style.width = (step / total * 100) + '%';
    backBtn.style.visibility = step === 1 ? 'hidden' : 'visible';
    nextBtn.textContent = step === total ? 'Send enquiry' : 'Continue';
  }

  /* ---------- Gentle validation, one step at a time ---------- */

  function validateStep() {
    var ok = true;
    current().querySelectorAll('.field').forEach(function (field) {
      field.classList.remove('has-error');
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
        ok = false;
      }
    });
    return ok;
  }

  /* ---------- Collect & submit ---------- */

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
    confirm.classList.add('is-visible');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function submit() {
    var data = collect();
    nextBtn.disabled = true;
    nextBtn.textContent = 'Sending…';

    if (FORMSPREE_ENDPOINT) {
      fetch(FORMSPREE_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(data)
      }).then(function (r) {
        if (r.ok) { showConfirmation(); }
        else { throw new Error('send failed'); }
      }).catch(function () {
        nextBtn.disabled = false;
        nextBtn.textContent = 'Send enquiry';
        alert('Something interrupted the sending. Please try again, or write to hello@madamewedding.design.');
      });
    } else {
      // No endpoint configured yet — open the visitor's email client, pre-filled.
      var lines = Object.keys(data).filter(function (k) { return k[0] !== '_'; }).map(function (k) {
        return k + ': ' + data[k];
      });
      window.location.href = 'mailto:hello@madamewedding.design' +
        '?subject=' + encodeURIComponent(data._subject) +
        '&body=' + encodeURIComponent(lines.join('\n'));
      showConfirmation();
    }
  }

  nextBtn.addEventListener('click', function () {
    if (!validateStep()) return;
    if (step < total) {
      step++;
      render();
      form.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      submit();
    }
  });

  backBtn.addEventListener('click', function () {
    if (step > 1) { step--; render(); }
  });

  render();
})();
