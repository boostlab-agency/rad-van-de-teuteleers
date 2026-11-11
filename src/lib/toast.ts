export interface ToastMsg {
  id: number;
  text: string;
  emoji: string;
}

type Listener = (t: ToastMsg) => void;
const listeners = new Set<Listener>();
let counter = 0;

export function toast(text: string, emoji = '🎉') {
  const msg = { id: ++counter, text, emoji };
  listeners.forEach((l) => l(msg));
}

export function onToast(l: Listener) {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
}
