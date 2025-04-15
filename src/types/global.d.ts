
interface Window {
  paypal: {
    Buttons: (config: {
      style?: {
        shape?: 'rect' | 'pill';
        color?: 'gold' | 'blue' | 'silver' | 'white' | 'black';
        height?: number;
        label?: 'paypal' | 'checkout' | 'buynow';
        layout?: 'vertical' | 'horizontal';
        tagline?: boolean;
      };
      fundingSource?: string;
      createOrder: () => Promise<string | null>;
      onApprove: (data: any, actions: any) => Promise<void>;
      onError?: (err: any) => void;
      onCancel?: () => void;
      onClick?: () => void;
    }) => {
      render: (container: HTMLElement) => void;
      close?: () => void;
      isEligible?: () => boolean;
    };
    FUNDING: {
      PAYPAL: string;
      CREDIT: string;
      CARD: string;
      VENMO: string;
      PAYLATER: string;
    };
  };
}
