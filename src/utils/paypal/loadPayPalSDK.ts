
const PAYPAL_SDK_URL = 'https://www.paypal.com/sdk/js';

export const getPayPalScriptUrl = (config: { clientId: string }) => {
  // Use URL parameters to create a properly encoded URL
  const params = new URLSearchParams({
    'client-id': config.clientId,
    currency: 'USD',
    intent: 'capture',
    components: 'buttons',
    'disable-funding': 'venmo,paylater',
    'debug': 'false',
    'buyer-country': 'US'
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
    if (!clientId) {
      console.error("PayPal client ID is missing");
      reject(new Error("Missing PayPal client ID"));
      return;
    }
    
    console.log("Loading PayPal SDK with client ID:", clientId);
    
    const script = document.createElement('script');
    script.src = getPayPalScriptUrl({ clientId });
    script.async = true;
    script.defer = true;
    
    // Add data attributes for better tracing
    script.setAttribute('data-namespace', 'paypal-sdk');
    script.setAttribute('data-page', 'checkout');

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
