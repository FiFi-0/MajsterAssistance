const API_KEY_STORAGE_KEY = 'majster_gemini_api_key';

function getSavedApiKey() {
  return localStorage.getItem(API_KEY_STORAGE_KEY) || '';
}

function saveApiKey(key) {
  if (key) {
    localStorage.setItem(API_KEY_STORAGE_KEY, key);
  }
}
