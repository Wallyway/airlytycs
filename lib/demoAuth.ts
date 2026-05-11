// Simple local demo authentication helper (localStorage)
export function signInDemo() {
  if (typeof window === "undefined") return null;
  const demo = { id: "demo-client", email: "demo@local" };
  try {
    localStorage.setItem("demo_user", JSON.stringify(demo));
  } catch {
    // ignore
  }
  return demo;
}

export function getDemoUser() {
  if (typeof window === "undefined") return null;
  try {
    const s = localStorage.getItem("demo_user");
    return s ? JSON.parse(s) : null;
  } catch {
    return null;
  }
}

export function signOutDemo() {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem("demo_user");
  } catch {}
}
