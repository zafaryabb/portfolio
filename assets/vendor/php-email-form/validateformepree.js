(function () {
    "use strict";
  
    let forms = document.querySelectorAll('.php-email-form');
  
    forms.forEach(function (e) {
      e.addEventListener('submit', function (event) {
        event.preventDefault();
  
        let thisForm = this;
  
        let action = thisForm.getAttribute('action');
        let recaptcha = thisForm.getAttribute('data-recaptcha-site-key');
        
        if (!action) {
          displayError(thisForm, 'The form action property is not set!');
          return;
        }
  
        // Show loading state
        thisForm.querySelector('.loading').classList.add('d-block');
        thisForm.querySelector('.error-message').classList.remove('d-block');
        thisForm.querySelector('.sent-message').classList.remove('d-block');
  
        let formData = new FormData(thisForm);
  
        // Handle reCaptcha if present
        if (recaptcha) {
          if (typeof grecaptcha !== "undefined") {
            grecaptcha.ready(function () {
              try {
                grecaptcha.execute(recaptcha, { action: 'php_email_form_submit' })
                  .then(token => {
                    formData.set('recaptcha-response', token);
                    submitForm(thisForm, action, formData);
                  })
              } catch (error) {
                displayError(thisForm, error);
              }
            });
          } else {
            displayError(thisForm, 'The reCaptcha javascript API URL is not loaded!');
          }
        } else {
          submitForm(thisForm, action, formData);
        }
      });
    });
  
    // Function to submit the form to Formspree
    function submitForm(thisForm, action, formData) {
      fetch(action, {
        method: 'POST',
        body: formData,
        headers: { 'X-Requested-With': 'XMLHttpRequest' }
      })
        .then(response => {
          if (response.ok) {
            return response.json();  // Expecting JSON response from Formspree
          } else {
            throw new Error(`${response.status} ${response.statusText} ${response.url}`);
          }
        })
        .then(data => {
          thisForm.querySelector('.loading').classList.remove('d-block');
          if (data.ok) {
            // Success: Show the success message and reset the form
            thisForm.querySelector('.sent-message').classList.add('d-block');
            thisForm.reset();
          } else {
            throw new Error(data.message || 'Form submission failed and no error message returned.');
          }
        })
        .catch((error) => {
          displayError(thisForm, error);
        });
    }
  
    // Function to display error message
    function displayError(thisForm, error) {
      thisForm.querySelector('.loading').classList.remove('d-block');
      thisForm.querySelector('.error-message').innerHTML = error;
      thisForm.querySelector('.error-message').classList.add('d-block');
    }
  
  })();
  