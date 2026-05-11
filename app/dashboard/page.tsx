"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/src/lib/supabase";

type Product = {
  id: string;
  title: string;
  description: string;
  price_per_pack: number;
  lines_per_pack: number;
  stock_count: number;
};

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        window.location.href = "/login";
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (!profile?.approved) {
        alert("Tu cuenta aún no está aprobada.");
        await supabase.auth.signOut();
        window.location.href = "/login";
        return;
      }

      setEmail(profile.email);

      const { data } = await supabase
        .from("products")
        .select("*")
        .eq("active", true);

      setProducts(data || []);
      setLoading(false);
    }

    load();
  }, []);

  async function addToCart(productId: string) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { data: existing } = await supabase
      .from("cart_items")
      .select("*")
      .eq("user_id", user.id)
      .eq("product_id", productId)
      .maybeSingle();

    if (existing) {
      const { error } = await supabase
        .from("cart_items")
        .update({
          quantity_packs: existing.quantity_packs + 1,
        })
        .eq("id", existing.id);

      if (error) {
        alert(error.message);
        return;
      }
    } else {
      const { error } = await supabase
        .from("cart_items")
        .insert({
          user_id: user.id,
          product_id: productId,
          quantity_packs: 1,
        });

      if (error) {
        alert(error.message);
        return;
      }
    }

    alert("Producto agregado al carrito");
  }

  if (loading) {
    return <main className="p-10">Cargando...</main>;
  }

  return (
    <main className="min-h-screen p-10">
      <h1 className="text-3xl font-bold mb-2">
        Panel Privado
      </h1>

      <p className="mb-8">
        Bienvenido: {email}
      </p>

      <div className="grid gap-5">
        {products.map((product) => (
          <div
            key={product.id}
            className="border rounded-2xl p-5"
          >
            <h2 className="text-2xl font-bold">
              {product.title}
            </h2>

            <p className="mt-2">
              {product.description}
            </p>

            <p className="mt-4">
              ${product.price_per_pack} por {product.lines_per_pack} líneas
            </p>

            <p className="mt-2">
              Stock: {product.stock_count} líneas
            </p>

            <button
              onClick={() => addToCart(product.id)}
              className="mt-4 bg-black text-white px-5 py-3 rounded"
            >
              Agregar al carrito
            </button>
          </div>
        ))}
      </div>
    </main>
  );
}
