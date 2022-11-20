const CALC_BUTTON_CLASS = 'calculator__button';
const CALC_CARBS_SELECTOR = '#carbs';
const CALC_GLUCOSE_SELECTOR = '#glucose';
const CALC_UNITS_SELECTOR = '.calculator__units';
const PREFERENCE_KEY_CARBS = 'carbs';
const PREFERENCE_KEY_CARBS_DOSAGE = 'carbs-dosage';
const PREFERENCE_KEY_DOSAGE = 'dosage';
const PREFERENCE_KEY_INCREMENT = 'increment';
const PREFERENCE_KEY_THRESHOLD = 'threshold';
const PREFERENCES_BUTTON_SELECTOR = '.preferences button';
const PREFERENCES_CARBS_DOSAGE_SELECTOR = '#preferences__carbs-dosage';
const PREFERENCES_CARBS_SELECTOR = '#preferences__carbs';
const PREFERENCES_DOSAGE_SELECTOR = '#preferences__dosage';
const PREFERENCES_FORM_SELECTOR = '.preferences';
const PREFERENCES_INCREMENT_SELECTOR = '#preferences__increment';
const PREFERENCES_THRESHOLD_SELECTOR = '#preferences__threshold';
const PREFERENCES_MESSAGE_SELECTOR = '.preferences__message';
const PREFERENCES_MESSAGE_TIMEOUT = 1800;

const GLUCOSE_MODIFIER = {
  'down': -75,
  'slight-down': -50,
  'slight-up': 50,
  'steady': 0,
  'up': 75,
};

const PREFERENCES = {
  carbs: '',
  carbsDosage: '',
  dosage: '',
  increment: '',
  threshold: '',
}

let savePreferencesMessage;

function calculateDose({ carbs, glucose }) {
  let dose = 0;

  if (carbs) {
    dose += carbs / parseInt(PREFERENCES.carbs) * parseInt(PREFERENCES.carbsDosage);
  }

  if (glucose) {
    dose += (glucose - parseInt(PREFERENCES.threshold)) / parseInt(PREFERENCES.increment) * parseInt(PREFERENCES.dosage);
  }

  document.querySelector(CALC_UNITS_SELECTOR).innerHTML = `Dose: ${dose} unit(s) of insulin`
}

function disableSavePreferences() {
  document.querySelector(PREFERENCES_BUTTON_SELECTOR).setAttribute('disabled', true);
}

function displaySavePreferencesMessage(message, callback) {
  savePreferencesMessage.innerHTML = message;

  setTimeout(function() {
    savePreferencesMessage.innerHTML = '';

    if (callback) {
      callback();
    }
  }, PREFERENCES_MESSAGE_TIMEOUT);
}

function enableSavePreferences() {
  document.querySelector(PREFERENCES_BUTTON_SELECTOR).removeAttribute('disabled');
}

function loadPreferences() {
  PREFERENCES.carbs = localStorage.getItem(PREFERENCE_KEY_CARBS);
  PREFERENCES.carbsDosage = localStorage.getItem(PREFERENCE_KEY_CARBS_DOSAGE);
  PREFERENCES.dosage = localStorage.getItem(PREFERENCE_KEY_DOSAGE);
  PREFERENCES.increment = localStorage.getItem(PREFERENCE_KEY_INCREMENT);
  PREFERENCES.threshold = localStorage.getItem(PREFERENCE_KEY_THRESHOLD);

  if (PREFERENCES.carbs)
    document.querySelector(PREFERENCES_CARBS_SELECTOR).value = PREFERENCES.carbs;

  if (PREFERENCES.carbsDosage)
    document.querySelector(PREFERENCES_CARBS_DOSAGE_SELECTOR).value = PREFERENCES.carbsDosage;

  if (PREFERENCES.dosage)
    document.querySelector(PREFERENCES_DOSAGE_SELECTOR).value = PREFERENCES.dosage;

  if (PREFERENCES.increment)
    document.querySelector(PREFERENCES_INCREMENT_SELECTOR).value = PREFERENCES.increment;

  if (PREFERENCES.threshold)
    document.querySelector(PREFERENCES_THRESHOLD_SELECTOR).value = PREFERENCES.threshold;
}

function setUpCalculatorButtonHandler() {
  document.addEventListener('click', function(e) {
    if (e.target.className.includes(CALC_BUTTON_CLASS)) {
      let glucoseInput = document.querySelector(CALC_GLUCOSE_SELECTOR).value;
      let glucose = glucoseInput && parseFloat(glucoseInput) * 18 || 0;
      let carbsInput = document.querySelector(CALC_CARBS_SELECTOR).value;
      let carbs = carbsInput && parseInt(carbsInput) || 0;

      if (glucose === 0 && carbs === 0) return;

      glucose += GLUCOSE_MODIFIER[e.target.dataset.direction];

      calculateDose({ carbs, glucose });
    }
  });
}

function setUpPreferenceFormHandler() {
  document.querySelector(PREFERENCES_FORM_SELECTOR).addEventListener('submit', function(e) {
    e.preventDefault();

    try {
      disableSavePreferences();

      for (let i = 0; i < e.target.length; i++) {
        let el = e.target[i];

        if (el.tagName.toLowerCase() == 'input') {
          localStorage.setItem(el.name, el.value);
        }
      }

      displaySavePreferencesMessage('Preferences were saved', enableSavePreferences);
    } catch(ex) {
      displaySavePreferencesMessage(ex.message, enableSavePreferences);
    }
  });
}

(function main() {
  document.addEventListener('readystatechange', function() {
    if (document.readyState === 'complete') {
      savePreferencesMessage = document.querySelector(PREFERENCES_MESSAGE_SELECTOR);

      setUpCalculatorButtonHandler();
      setUpPreferenceFormHandler();
      loadPreferences();
    }
  });
})();
