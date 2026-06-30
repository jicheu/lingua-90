type Listener = (msg: string) => void;
let _listener: Listener | null = null;

export function registerToastListener(fn: Listener): void {
  _listener = fn;
}

export function toast(msg: string): void {
  _listener?.(msg);
}
