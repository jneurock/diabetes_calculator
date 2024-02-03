const CALC_BUTTON_CLASS = 'calculator__button';
const CALC_CARBS_SELECTOR = '#carbs';
const CALC_GLUCOSE_SELECTOR = '#glucose';
const CALC_UNITS_SELECTOR = '.calculator__units';

const DOSE_CEILING_THRESHOLD = 0.3;

const PREFERENCE_KEY_CARBS = 'carbs';
const PREFERENCE_KEY_CARBS_DOSAGE = 'carbs-dosage';
const PREFERENCE_KEY_DOSAGE = 'dosage';
const PREFERENCE_KEY_INCREMENT = 'increment';
const PREFERENCE_KEY_SCALE = 'scale';
const PREFERENCE_KEY_THRESHOLD = 'threshold';

const PREFERENCES_DEFAULT_SCALE = 'mg';

const PREFERENCES_MESSAGE_TIMEOUT = 1800;

const PREFERENCES_SELECTOR_BUTTON = '.preferences button';
const PREFERENCES_SELECTOR_CARBS_DOSAGE = '#preferences__carbs-dosage';
const PREFERENCES_SELECTOR_CARBS = '#preferences__carbs';
const PREFERENCES_SELECTOR_DOSAGE = '#preferences__dosage';
const PREFERENCES_SELECTOR_FORM = '.preferences';
const PREFERENCES_SELECTOR_INCREMENT = '#preferences__increment';
const PREFERENCES_SELECTOR_SCALE = '#scale';
const PREFERENCES_SELECTOR_THRESHOLD = '#preferences__threshold';
const PREFERENCES_SELECTOR_MESSAGE = '.preferences__message';

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
  scale: PREFERENCES_DEFAULT_SCALE,
  threshold: '',
}

const SCALE_MODIFIER = {
  mg: 1,
  mm: 18
};

let savePreferencesMessage;

function calculateDose({ carbs, glucose }) {
  let dose = 0;

  if (carbs)
    dose += carbs / parseInt(PREFERENCES.carbs) * parseInt(PREFERENCES.carbsDosage);

  if (glucose)
    dose += (glucose - parseInt(PREFERENCES.threshold)) / parseInt(PREFERENCES.increment) * parseInt(PREFERENCES.dosage);

  if (dose < 0) dose = 0;

  document.querySelector(CALC_UNITS_SELECTOR).innerHTML = `Dose: ${roundDose(dose)} unit(s) of insulin`
}

function disableSavePreferences() {
  document.querySelector(PREFERENCES_SELECTOR_BUTTON).setAttribute('disabled', true);
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
  document.querySelector(PREFERENCES_SELECTOR_BUTTON).removeAttribute('disabled');
}

function loadPreferences() {
  savePreferences();

  if (PREFERENCES.carbs)
    document.querySelector(PREFERENCES_SELECTOR_CARBS).value = PREFERENCES.carbs;

  if (PREFERENCES.carbsDosage)
    document.querySelector(PREFERENCES_SELECTOR_CARBS_DOSAGE).value = PREFERENCES.carbsDosage;

  if (PREFERENCES.dosage)
    document.querySelector(PREFERENCES_SELECTOR_DOSAGE).value = PREFERENCES.dosage;

  if (PREFERENCES.increment)
    document.querySelector(PREFERENCES_SELECTOR_INCREMENT).value = PREFERENCES.increment;

  if (PREFERENCES.scale) {
    document.querySelector(PREFERENCES_SELECTOR_SCALE).value = PREFERENCES.scale;
    document
      .querySelectorAll(`${PREFERENCES_SELECTOR_SCALE} option`)
      .forEach(function(option) {
        if (option.value === PREFERENCES.scale) {
          option.toggleAttribute('selected');
        }
      });
  }

  if (PREFERENCES.threshold)
    document.querySelector(PREFERENCES_SELECTOR_THRESHOLD).value = PREFERENCES.threshold;
}

function roundDose(dose) {
  if (dose - Math.trunc(dose) > DOSE_CEILING_THRESHOLD) {
    return Math.ceil(dose);
  }

  return Math.floor(dose);
}

function savePreferences() {
  PREFERENCES.carbs = localStorage.getItem(PREFERENCE_KEY_CARBS);
  PREFERENCES.carbsDosage = localStorage.getItem(PREFERENCE_KEY_CARBS_DOSAGE);
  PREFERENCES.dosage = localStorage.getItem(PREFERENCE_KEY_DOSAGE);
  PREFERENCES.increment = localStorage.getItem(PREFERENCE_KEY_INCREMENT);
  PREFERENCES.scale = localStorage.getItem(PREFERENCE_KEY_SCALE);
  PREFERENCES.threshold = localStorage.getItem(PREFERENCE_KEY_THRESHOLD);
}

function setUpCalculatorButtonHandler() {
  document.addEventListener('click', function(e) {
    if (e.target.className.includes(CALC_BUTTON_CLASS)) {
      let glucoseInput = document.querySelector(CALC_GLUCOSE_SELECTOR).value;
      let scaleModifier = SCALE_MODIFIER[PREFERENCES.scale];
      let glucose = glucoseInput && parseFloat(glucoseInput) * scaleModifier || 0;
      let carbsInput = document.querySelector(CALC_CARBS_SELECTOR).value;
      let carbs = carbsInput && parseInt(carbsInput) || 0;

      if (glucose === 0 && carbs === 0) return;

      glucose += GLUCOSE_MODIFIER[e.target.dataset.direction];

      calculateDose({ carbs, glucose });
    }
  });
}

function setUpScaleChangeHandler() {
  document.querySelector(PREFERENCES_SELECTOR_SCALE).addEventListener('change', function(e) {
    let scale = e.target.value;

    localStorage.setItem(PREFERENCE_KEY_SCALE, scale);

    savePreferences();
  });
}

function setUpPreferenceFormHandler() {
  document.querySelector(PREFERENCES_SELECTOR_FORM).addEventListener('submit', function(e) {
    e.preventDefault();

    try {
      disableSavePreferences();

      for (let i = 0; i < e.target.length; i++) {
        let el = e.target[i];

        if (el.tagName.toLowerCase() == 'input') {
          localStorage.setItem(el.name, el.value);
        }
      }

      savePreferences();

      displaySavePreferencesMessage('Preferences were saved', enableSavePreferences);
    } catch(ex) {
      displaySavePreferencesMessage(ex.message, enableSavePreferences);
    }
  });
}

(function main() {
  document.addEventListener('readystatechange', function() {
    if (document.readyState === 'complete') {
      savePreferencesMessage = document.querySelector(PREFERENCES_SELECTOR_MESSAGE);

      setUpCalculatorButtonHandler();
      setUpPreferenceFormHandler();
      setUpScaleChangeHandler();

      loadPreferences();
    }
  });
})();
