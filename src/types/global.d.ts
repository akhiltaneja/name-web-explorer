
interface Window {
  paypal: {
    Buttons: (config: {
      style?: {
        shape?: 'rect' | 'pill';
        color?: 'gold' | 'blue' | 'silver' | 'white' | 'black';
        height?: number;
        label?: 'paypal' | 'checkout' | 'buynow';
        layout?: 'vertical' | 'horizontal';
      };
      createOrder: () => Promise<string>;
      onApprove: (data: any, actions: any) => Promise<void>;
      onError?: (err: any) => void;
      onCancel?: () => void;
    }) => {
      render: (container: HTMLElement | string) => void;
    };
  };
}
