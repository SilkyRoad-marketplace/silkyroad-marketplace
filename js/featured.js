// SUPABASE
import { supabase } from './supabaseClient.js';

// Fetch all products + seller plans
async function loadFeaturedProducts() {
  // 1. Load all products
  const { data: products, error: prodErr } = await supabase
    .from("products")
    .select("*");

  if (prodErr) {
    console.error("Failed to load products:", prodErr);
    return [];
  }

  // 2. Load all profiles (seller plans)
  const { data: profiles, error: profErr } = await supabase
    .from("profiles")
    .select("id, plan");

  if (profErr) {
    console.error("Failed to load profiles:", profErr);
    return [];
  }

  // 3. Attach plan to each product
  const productsWithPlan = products.map((p) => {
    const seller = profiles.find(s => s.id === p.seller_id);
    return {
      ...p,
      plan: seller?.plan || "free"
    };
  });

  return productsWithPlan;
}
