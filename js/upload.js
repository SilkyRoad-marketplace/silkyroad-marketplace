// ==========================
// Supabase config
// ==========================
const SUPABASE_URL = "https://paqvgsruppgadgguynde.supabase.co";  // TODO
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBhcXZnc3J1cHBnYWRnZ3V5bmRlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIzNTg3NTMsImV4cCI6MjA3NzkzNDc1M30.pwEE4WLFu2-tHkmH1fFYYwcEPmLPyavN7ykXdPGQ3AY";         // TODO

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ==========================
// Auto-generate product slug
// ==========================
function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

// ==========================
// Upload function
// ==========================
async function uploadProduct() {
  const title = document.getElementById("title").value;
  const description = document.getElementById("description").value;
  const price = parseFloat(document.getElementById("price").value || 0);
  const category_slug = document.getElementById("category_slug").value.trim();
  const subcategory_slug = document.getElementById("subcategory_slug").value.trim();
  const tagsRaw = document.getElementById("tags").value.trim();
  const coverFile = document.getElementById("cover_file").files[0];
  const productFile = document.getElementById("product_file").files[0];

  if (!title || !description || !productFile) {
    alert("Title, description, and product file are required.");
    return;
  }

  const user = (await supabase.auth.getUser())?.data?.user;
  if (!user) {
    alert("Please log in first.");
    return;
  }

  const userId = user.id;
  const slug = slugify(title) + "-" + Date.now();

  // Convert comma separated tags -> array
  const tags = tagsRaw
    ? tagsRaw.split(",").map(t => t.trim().toLowerCase())
    : [];

  // Auto-detect file extension
  const productExt = productFile.name.split(".").pop().toLowerCase();
  const file_types = [productExt];

  // ==========================
  // Upload cover image
  // ==========================
  let cover_url = null;

  if (coverFile) {
    const coverPath = `${userId}/covers/${Date.now()}-${coverFile.name}`;

    const { data: coverUpload, error: coverErr } = await supabase.storage
      .from("seller-uploads")
      .upload(coverPath, coverFile, {
        cacheControl: "3600",
        upsert: false
      });

    if (coverErr) {
      console.error(coverErr);
      alert("Cover upload failed.");
      return;
    }

    cover_url = supabase.storage.from("seller-uploads").getPublicUrl(coverPath).data.publicUrl;
  }

  // ==========================
  // Upload main product file
  // ==========================
  const filePath = `${userId}/products/${Date.now()}-${productFile.name}`;

  const { data: fileUpload, error: fileErr } = await supabase.storage
    .from("seller-uploads")
    .upload(filePath, productFile, {
      cacheControl: "3600",
      upsert: false
    });

  if (fileErr) {
    console.error(fileErr);
    alert("File upload failed.");
    return;
  }

  const file_url = supabase.storage.from("seller-uploads").getPublicUrl(filePath).data.publicUrl;

  // ==========================
  // Insert product into DB
  // ==========================
  const { data: productRow, error: insertErr } = await supabase
    .from("products")
    .insert({
      title,
      description,
      price,
      category_slug,
      subcategory_slug,
      tags,
      file_types,
      slug,
      cover_url,
      file_url,
      is_active: true,
      seller_name: user.user_metadata.full_name || "Unknown",
      seller_plan: user.user_metadata.plan || "FREE",
      rating_avg: 0,
      rating_count: 0
    })
    .select()
    .single();

  if (insertErr) {
    console.error(insertErr);
    alert("Database insert failed.");
    return;
  }

  // ==========================
  // Success UI + redirect
  // ==========================
  document.getElementById("success-box").style.display = "block";

  setTimeout(() => {
    window.location.href = `/product/${slug}`;
  }, 1500);
}
