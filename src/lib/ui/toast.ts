// Aviso emergente breve (por ejemplo, «¡Logro desbloqueado!»).
// Se anuncia a lectores de pantalla (aria-live) y desaparece solo a los 5 segundos.
interface ToastData { kicker: string; title: string; text: string; color: string }

export function toast({ kicker, title, text, color }: ToastData) {
  let box = document.getElementById("forja-toasts");
  if (!box) {
    box = document.createElement("div");
    box.id = "forja-toasts";
    box.setAttribute("role", "status");
    box.setAttribute("aria-live", "polite");
    document.body.append(box);
  }
  const t = document.createElement("div");
  t.className = "forja-toast";
  t.style.setProperty("--c", color);
  const sw = document.createElement("span");
  sw.className = "sw";
  const body = document.createElement("div");
  const k = document.createElement("small");
  k.textContent = kicker;
  const b = document.createElement("b");
  b.textContent = title;
  const p = document.createElement("span");
  p.textContent = text;
  body.append(k, b, p);
  t.append(sw, body);
  box.append(t);
  setTimeout(() => t.classList.add("out"), 5000);
  setTimeout(() => t.parentNode?.removeChild(t), 5600);
}
