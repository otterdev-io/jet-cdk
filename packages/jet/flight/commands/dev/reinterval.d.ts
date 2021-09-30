declare module 'reinterval' {
  interface ReInterval {
    reschedule(interval: number);
    clear();
    destroy();
  }
  export default function reInterval(
    callback: () => void,
    interval: number
  ): ReInterval;
}
