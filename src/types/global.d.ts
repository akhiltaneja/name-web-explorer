
interface Window {
  paypal: {
    HostedButtons: (config: {
      hostedButtonId: string;
    }) => {
      render: (containerId: string) => void;
    };
  };
}
