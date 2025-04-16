
interface Window {
  paypal: {
    HostedButtons: (config: {
      hostedButtonId: string;
    }) => {
      render: (containerId: string) => void;
    };
    Buttons: (config: any) => {
      render: (containerId: string) => void;
    };
  };
}
