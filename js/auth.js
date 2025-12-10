import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

export const supabase = createClient(
  "https://paqvgsruppgadgguynde.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBhcXZnc3J1cHBnYWRnZ3V5bmRlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIzNTg3NTMsImV4cCI6MjA3NzkzNDc1M30.pwEE4WLFu2-tHkmH1fFYYwcEPmLPyavN7ykXdPGQ3AY"
);

/* -------------------------------
   SHOW / HIDE UI BASED ON LOGIN
-------------------------------- */

function toggleWhen(condition) {
  document.querySelectorAll("[data-when]").forEach(el => {
    const shouldShow = el.getAttribute("data-when") === (condition ? "logged-in" : "logged-out");
    el.style.display = shouldShow ? "" : "none";
  });
}

export async function initAuthUI() {
  const { data } = await supabase.auth.getSession();
  toggleWhen(!!data.session);

  supabase.auth.onAuthStateChange((_event, session) => {
    toggleWhen(!!session);
  });
}

/* -------------------------------
   AUTH ACTIONS
-------------------------------- */

export async function googleAuth() {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: "https://silkyroad.vercel.app/auth-callback.html"
    }
  });
  if (error) console.error(error);
}

export async function emailSignUp(email, password) {
  return supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: "https://silkyroad.vercel.app/verified.html"
    }
  });
}

export async function emailSignIn(email, password) {
  return supabase.auth.signInWithPassword({ email, password });
}

export async function sendPasswordReset(email) {
  return supabase.auth.resetPasswordForEmail(email, {
    redirectTo: "https://silkyroad.vercel.app/reset.html"
  });
}

export async function updatePassword(newPassword) {
  return supabase.auth.updateUser({ password: newPassword });
}

export async function logout() {
  await supabase.auth.signOut();
  window.location.href = "/";
}
