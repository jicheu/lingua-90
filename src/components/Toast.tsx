import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import { registerToastListener } from "../lib/toast";

export function ToastContainer() {
  const [messages, setMessages] = useState<{ id: number; text: string }[]>([]);

  useEffect(() => {
    let nextId = 0;
    registerToastListener((msg) => {
      const id = nextId++;
      setMessages((ms) => [...ms, { id, text: msg }]);
      setTimeout(() => {
        setMessages((ms) => ms.filter((m) => m.id !== id));
      }, 2000);
    });
    return () => {
      registerToastListener(() => {});
    };
  }, []);

  if (messages.length === 0) return null;

  return (
    <div className="pointer-events-none fixed bottom-20 left-1/2 z-50 flex -translate-x-1/2 flex-col items-center gap-2 sm:bottom-6">
      {messages.map((m) => (
        <div
          key={m.id}
          className="animate-pop flex items-center gap-2 rounded-full bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-lg"
        >
          <Check size={14} /> {m.text}
        </div>
      ))}
    </div>
  );
}
