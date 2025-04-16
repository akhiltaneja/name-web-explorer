
const PAYPAL_SDK_URL = 'https://www.paypal.com/sdk/js';

export const getPayPalScriptUrl = (config: { clientId: string }) => {
  // Use URL parameters to create a properly encoded URL
  const params = new URLSearchParams({
    'client-id': config.clientId,
    currency: 'USD',
    intent: 'capture',
    components: 'buttons',
    'disable-funding': 'venmo,paylater',
    'debug': 'false' // Disable debug mode in production
  });
  
  return `${PAYPAL_SDK_URL}?${params.toString()}`;
};

export const cleanupPayPalScript = () => {
  const existingScript = document.querySelector('script[src*="paypal.com/sdk/js"]');
  if (existingScript) {
    document.head.removeChild(existingScript);
  }

  // Clean up any PayPal button containers
  const container = document.getElementById('paypal-button-container');
  if (container) {
    container.innerHTML = '';
  }
};

export const loadPayPalScript = (clientId: string): Promise<void> => {
  // First clean up any existing PayPal scripts to avoid conflicts
  cleanupPayPalScript();
  
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = getPayPalScriptUrl({ clientId });
    script.async = true;
    script.defer = true;

    script.onload = () => {
      console.log("PayPal SDK loaded successfully");
      resolve();
    };

    script.onerror = (error) => {
      console.error("PayPal SDK failed to load:", error);
      reject(error);
    };

    document.head.appendChild(script);
  });
};
