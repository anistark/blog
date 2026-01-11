const handlePrivacyPolicyNoticeDismissal = () => {
  const storage = sessionStorage; // TODO : You may want to delete this line and uncomment the next line when your privacy policy is complete. Why? Because the deployed template should not use localStorage since it lacks a privacy policy.
  // const storage = DEV_MODE ? sessionStorage : localStorage
  const dismissedPrivacyPolicyNotice = storage.getItem(
    'dismissedPrivacyPolicyNotice'
  );
  const privacyNotice = document.getElementById('privacy-notice');

  if (!privacyNotice) return;

  if (!!dismissedPrivacyPolicyNotice) privacyNotice.classList.add('hidden');

  const buttonContainer = document.getElementById('privacy-notice-button-container');

  if (!buttonContainer) return;

  buttonContainer.addEventListener('click', () => {
    storage.setItem('dismissedPrivacyPolicyNotice', 'true');
    privacyNotice.classList.add('hidden');
  });
};

export { handlePrivacyPolicyNoticeDismissal };
