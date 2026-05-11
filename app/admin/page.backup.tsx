"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/src/lib/supabase";

type UserProfile = {
  id: string;
  email: string;
  approved: boolean;
  role: string | null;
  balance: number;
  created_at: string;
};

type Product = {
  id: string;
  title: string;
  description: string | null;
  price_per_pack: number;
  lines_per_pack: number;
  stock_count: number;
  active: boolean;
};

export default function AdminPage() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [pricePerPack, setPricePerPack] = useState("25");
  const [linesPerPack, setLinesPerPack] = useState("100");
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    loadAdmin();
  }, []);

  async function getToken() {
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token || "";
  }

  async function loadAdmin() {
    await loadUsers();
    await loadProducts();
    setLoading(false);
  }

  async function loadUsers() {
    const token = await getToken();

    const response = await fetch("/api/admin/users", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      alert(data.error || "Failed to load users.");
      return;
    }

    setUsers(data.users || []);
  }

  async function loadProducts() {
    const { data, error } = await supabase
      .from("products")
      .select("id,title,description,price_per_pack,lines_per_pack,stock_count,active")
      .order("created_at", { ascending: false });

    if (error) {
      alert(error.message);
      return;
    }

    setProducts(data || []);
  }

  async function adminAction(userId: string, action: string) {
    const token = await getToken();
    let amount = 0;

    if (action === "add_balance" || action === "remove_balance") {
      const input = prompt("Enter amount");
      if (!input) return;

      amount = Number(input);

      if (!amount || amount <= 0) {
        alert("Invalid amount.");
        return;
      }
    }

    const response = await fetch("/api/admin/users", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        userId,
        action,
        amount,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      alert(data.error || "Action failed.");
      return;
    }

    loadUsers();
  }

  async function insertLines(productId: string, lines: string[]) {
    const batchSize = 500;

    for (let i = 0; i < lines.length; i += batchSize) {
      const batch = lines.slice(i, i + batchSize).map((line) => ({
        product_id: productId,
        content: line,
      }));

      const { error } = await supabase.from("product_lines").insert(batch);

      if (error) {
        alert(error.message);
        return false;
      }
    }

    return true;
  }

  async function createProduct() {
    if (!file) {
      alert("Upload a TXT file.");
      return;
    }

    const text = await file.text();

    const lines = text
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    const linesPerPackValue = Number(linesPerPack);
    const pricePerPackValue = Number(pricePerPack);

    if (!linesPerPackValue || linesPerPackValue <= 0) {
      alert("Invalid lines per pack.");
      return;
    }

    if (!pricePerPackValue || pricePerPackValue <= 0) {
      alert("Invalid price.");
      return;
    }

    if (lines.length < linesPerPackValue) {
      alert("TXT does not have enough lines.");
      return;
    }

    const availablePacks = Math.floor(
      lines.length / linesPerPackValue
    );

    const confirmCreate = confirm(
      `Product Summary\n\n` +
      `Lines Loaded: ${lines.length}\n` +
      `Lines Per Pack: ${linesPerPackValue}\n` +
      `Available Packs: ${availablePacks}\n` +
      `Price Per Pack: $${pricePerPackValue}\n\n` +
      `Create product?`
    );

    if (!confirmCreate) {
      return;
    }

    const { data: product, error } = await supabase
      .from("products")
      .insert({
        title,
        description,
        price_per_pack: pricePerPackValue,
        lines_per_pack: linesPerPackValue,
        stock_count: lines.length,
        active: true,
      })
      .select()
      .single();

    if (error || !product) {
      alert(error?.message || "Failed to create product.");
      return;
    }

    const ok = await insertLines(product.id, lines);
    if (!ok) return;

    alert(`Product created with ${lines.length} lines.`);

    setTitle("");
    setDescription("");
    setPricePerPack("25");
    setLinesPerPack("100");
    setFile(null);

    loadProducts();
  }

  async function toggleProduct(product: Product) {
    const { error } = await supabase
      .from("products")
      .update({
        active: !product.active,
      })
      .eq("id", product.id);

    if (error) {
      alert(error.message);
      return;
    }

    loadProducts();
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#050505] text-white flex items-center justify-center">
        Loading...
      </main>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#050505] text-white">
      <section className="relative z-10 mx-auto max-w-7xl px-6 py-10">
        <div className="mb-10 flex items-center justify-between">
          <h1 className="text-5xl font-black tracking-[0.14em]">
            <span className="bg-gradient-to-r from-violet-500 to-violet-300 bg-clip-text text-transparent">
              OG
            </span>
            <span className="text-zinc-100">ADMIN</span>
          </h1>

          <a href="/dashboard" className="rounded-xl border border-white/10 px-5 py-3 text-sm text-zinc-300 hover:bg-white/5">
            Dashboard
          </a>
        </div>

        <div className="grid gap-8 xl:grid-cols-2">
          <section className="rounded-[2rem] border border-white/10 bg-black/35 p-8 backdrop-blur-xl">
            <h2 className="text-3xl font-bold mb-6">Users</h2>

            <div className="space-y-5">
              {users.map((user) => (
                <div key={user.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                  <p className="font-semibold">{user.email}</p>

                  <div className="mt-3 flex flex-wrap gap-2 text-xs">
                    <span className={user.approved ? "text-emerald-300" : "text-red-300"}>
                      {user.approved ? "Approved" : "Blocked"}
                    </span>
                    <span className="text-violet-300">{user.role || "client"}</span>
                    <span className="text-zinc-300">${Number(user.balance || 0).toFixed(2)}</span>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-3">
                    <button onClick={() => adminAction(user.id, "approve")} className="rounded-xl bg-emerald-600 px-4 py-2 text-sm">
                      Approve
                    </button>
                    <button onClick={() => adminAction(user.id, "block")} className="rounded-xl bg-red-600 px-4 py-2 text-sm">
                      Block
                    </button>
                    <button onClick={() => adminAction(user.id, "add_balance")} className="rounded-xl bg-violet-600 px-4 py-2 text-sm">
                      Add Balance
                    </button>
                    <button onClick={() => adminAction(user.id, "remove_balance")} className="rounded-xl border border-white/10 px-4 py-2 text-sm">
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-[2rem] border border-white/10 bg-black/35 p-8 backdrop-blur-xl">
            <h2 className="text-3xl font-bold mb-6">Create Product</h2>

            <div className="space-y-4">
              <input className="w-full rounded-xl border border-white/10 bg-black/30 px-5 py-4 text-white" placeholder="Product name" value={title} onChange={(e) => setTitle(e.target.value)} />
              <textarea className="w-full rounded-xl border border-white/10 bg-black/30 px-5 py-4 text-white" placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
              <input className="w-full rounded-xl border border-white/10 bg-black/30 px-5 py-4 text-white" placeholder="Price per pack" value={pricePerPack} onChange={(e) => setPricePerPack(e.target.value)} />
              <input className="w-full rounded-xl border border-white/10 bg-black/30 px-5 py-4 text-white" placeholder="Lines per pack" value={linesPerPack} onChange={(e) => setLinesPerPack(e.target.value)} />
              <input className="w-full rounded-xl border border-white/10 bg-black/30 px-5 py-4 text-white" type="file" accept=".txt" onChange={(e) => setFile(e.target.files?.[0] || null)} />

              <button onClick={createProduct} className="w-full rounded-xl bg-violet-600 px-6 py-4 font-semibold uppercase tracking-[0.2em] hover:bg-violet-500">
                Create Product
              </button>
            </div>
          </section>
        </div>

        <section className="mt-8 rounded-[2rem] border border-white/10 bg-black/35 p-8 backdrop-blur-xl">
          <h2 className="text-3xl font-bold mb-6">Products</h2>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {products.map((product) => (
              <div key={product.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                <h3 className="text-xl font-bold">{product.title}</h3>
                <p className="mt-2 text-zinc-400">{product.description}</p>

                <div className="mt-4 text-sm text-zinc-300">
                  <p>Price: ${product.price_per_pack}</p>
                  <p>Pack: {product.lines_per_pack} lines</p>
                  <p>Stock: {product.stock_count} lines</p>
                  <p>Status: {product.active ? "Active" : "Inactive"}</p>
                </div>

                <button onClick={() => toggleProduct(product)} className="mt-5 w-full rounded-xl border border-white/10 px-4 py-3 text-sm hover:bg-white/5">
                  {product.active ? "Deactivate" : "Activate"}
                </button>
              </div>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}
