"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/src/lib/supabase";

type CartItem = {
  id: string;
  quantity_packs: number;
  product: {
    id: string;
    title: string;
    price_per_pack: number;
    lines_per_pack: number;
  };
};

export default function CartPage() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadCart() {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      window.location.href = "/login";
      return;
    }

    const { data, error } = await supabase
      .from("cart_items")
      .select(`
        id,
        quantity_packs,
        product:products (
          id,
          title,
          price_per_pack,
          lines_per_pack
        )
      `)
      .eq("user_id", user.id);

    if (error) {
      alert(error.message);
      return;
    }

    setItems((data as any) || []);
    setLoading(false);
  }

  useEffect(() => {
    loadCart();
  }, []);

  async function updateQuantity(id: string, quantity: number) {
    if (quantity <= 0) {
      await removeItem(id);
      return;
    }

    await supabase
      .from("cart_items")
      .update({ quantity_packs: quantity })
      .eq("id", id);

    loadCart();
  }

  async function removeItem(id: string) {
    await supabase
      .from("cart_items")
      .delete()
      .eq("id", id);

    loadCart();
  }

  const total = items.reduce((sum, item) => {
    return sum + item.quantity_packs * item.product.price_per_pack;
  }, 0);

  async function checkout() {
    if (total <= 0) {
      alert("El carrito está vacío");
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      window.location.href = "/login";
      return;
    }

    const { data: sessionData } = await supabase.auth.getSession();

    const response = await fetch("/api/create-payment", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${sessionData.session?.access_token}`,
      },
      body: JSON.stringify({
        amount: total,
        userId: user.id,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      alert(data.error || "Error creando pago crypto");
      return;
    }

    window.location.href = data.invoice_url;
  }

  if (loading) {
    return <main className="p-10">Cargando carrito...</main>;
  }

  return (
    <main className="min-h-screen p-10">
      <h1 className="text-3xl font-bold mb-8">Mi carrito</h1>

      <div className="grid gap-5">
        {items.map((item) => (
          <div key={item.id} className="border rounded-2xl p-5">
            <h2 className="text-2xl font-bold">{item.product.title}</h2>

            <p className="mt-2">${item.product.price_per_pack} por paquete</p>
            <p>{item.product.lines_per_pack} líneas por paquete</p>

            <div className="flex items-center gap-3 mt-4">
              <button className="border px-3 py-1 rounded" onClick={() => updateQuantity(item.id, item.quantity_packs - 1)}>
                -
              </button>

              <span>{item.quantity_packs}</span>

              <button className="border px-3 py-1 rounded" onClick={() => updateQuantity(item.id, item.quantity_packs + 1)}>
                +
              </button>

              <button className="ml-4 text-red-500" onClick={() => removeItem(item.id)}>
                Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-10 border-t pt-6">
        <h2 className="text-2xl font-bold">Total: ${total}</h2>

        <button onClick={checkout} className="mt-5 bg-black text-white px-6 py-3 rounded-xl">
          Proceder al pago
        </button>
      </div>
    </main>
  );
}
