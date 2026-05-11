"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/src/lib/supabase";

type Order = {
  id: string;
  total_price: number;
  status: string;
  delivered_content: string | null;
  created_at: string;
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);

  async function loadOrders() {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      window.location.href = "/login";
      return;
    }

    const { data, error } = await supabase
      .from("orders")
      .select(`
        id,
        total_price,
        status,
        delivered_content,
        created_at
      `)
      .eq("user_id", user.id)
      .order("created_at", {
        ascending: false,
      });

    if (error) {
      alert(error.message);
      return;
    }

    setOrders(data || []);
  }

  useEffect(() => {
    loadOrders();
  }, []);

  function downloadTxt(content: string, id: string) {
    const blob = new Blob([content], {
      type: "text/plain",
    });

    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");

    a.href = url;
    a.download = `order-${id}.txt`;

    a.click();

    URL.revokeObjectURL(url);
  }

  return (
    <main className="min-h-screen p-10">
      <h1 className="text-3xl font-bold mb-8">
        Mis órdenes
      </h1>

      <div className="grid gap-5">
        {orders.map((order) => (
          <div
            key={order.id}
            className="border rounded-2xl p-5"
          >
            <h2 className="text-2xl font-bold">
              Orden #{order.id.slice(0, 8)}
            </h2>

            <p className="mt-2">
              Estado: {order.status}
            </p>

            <p>
              Total: ${order.total_price}
            </p>

            <p>
              Fecha:{" "}
              {new Date(order.created_at)
                .toLocaleString()}
            </p>

            {order.delivered_content && (
              <button
                onClick={() =>
                  downloadTxt(
                    order.delivered_content!,
                    order.id
                  )
                }
                className="mt-5 bg-black text-white px-5 py-2 rounded-xl"
              >
                Descargar TXT
              </button>
            )}
          </div>
        ))}
      </div>
    </main>
  );
}
