declare module 'reinterval' {
  interface ReInterval {
    _callback?: () => void;
    reschedule(interval: number);
    clear();
    destroy();
  }
  export default function reInterval(
    callback: () => void,
    interval: number
  ): ReInterval;
}
