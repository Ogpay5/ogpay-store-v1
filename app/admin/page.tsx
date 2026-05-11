"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/src/lib/supabase";

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
  const [products, setProducts] = useState<Product[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [pricePerPack, setPricePerPack] = useState("25");
  const [linesPerPack, setLinesPerPack] = useState("100");
  const [file, setFile] = useState<File | null>(null);

  async function loadProducts() {
    const { data, error } = await supabase
      .from("products")
      .select("id,title,description,price_per_pack,lines_per_pack,stock_count,active")
      .order("created_at", { ascending: false });

    if (error) alert(error.message);
    else setProducts(data || []);
  }

  useEffect(() => {
    loadProducts();
  }, []);

  async function insertLinesInBatches(productId: string, lines: string[]) {
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

  async function addTxtToProduct(product: Product, selectedFile: File) {
    const text = await selectedFile.text();

    const lines = text
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    if (lines.length === 0) {
      alert("El archivo está vacío.");
      return;
    }

    const ok = await insertLinesInBatches(product.id, lines);
    if (!ok) return;

    const { error } = await supabase
      .from("products")
      .update({
        stock_count: product.stock_count + lines.length,
        active: true,
      })
      .eq("id", product.id);

    if (error) alert(error.message);
    else {
      alert(`Se agregaron ${lines.length} líneas al producto`);
      loadProducts();
    }
  }

  async function createProduct() {
    if (!file) {
      alert("Sube un archivo .txt");
      return;
    }

    if (Number(pricePerPack) < 25) {
      alert("El precio mínimo por paquete es $25");
      return;
    }

    const text = await file.text();

    const lines = text
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    if (lines.length < Number(linesPerPack)) {
      alert("El archivo no tiene suficientes líneas para un paquete.");
      return;
    }

    const { data: product, error } = await supabase
      .from("products")
      .insert({
        title,
        description,
        price_per_pack: Number(pricePerPack),
        lines_per_pack: Number(linesPerPack),
        stock_count: lines.length,
        active: true,
      })
      .select()
      .single();

    if (error || !product) {
      alert(error?.message || "No se pudo crear el producto");
      return;
    }

    const ok = await insertLinesInBatches(product.id, lines);
    if (!ok) return;

    alert(`Producto creado con ${lines.length} líneas disponibles`);

    setTitle("");
    setDescription("");
    setPricePerPack("25");
    setLinesPerPack("100");
    setFile(null);
    loadProducts();
  }

  async function updateProduct(product: Product) {
    const { error } = await supabase
      .from("products")
      .update({
        title: product.title,
        description: product.description,
        price_per_pack: Number(product.price_per_pack),
        lines_per_pack: Number(product.lines_per_pack),
        active: product.active,
      })
      .eq("id", product.id);

    if (error) alert(error.message);
    else {
      alert("Producto actualizado");
      loadProducts();
    }
  }

  function changeProduct(id: string, field: keyof Product, value: any) {
    setProducts((items) =>
      items.map((p) => (p.id === id ? { ...p, [field]: value } : p))
    );
  }

  return (
    <main className="min-h-screen p-10">
      <h1 className="text-3xl font-bold mb-6">Panel Admin</h1>

      <section className="max-w-xl border rounded-2xl p-5 mb-10">
        <h2 className="text-xl font-bold mb-4">Crear producto con TXT</h2>

        <input className="w-full border p-3 mb-3 rounded" placeholder="Nombre del producto" value={title} onChange={(e) => setTitle(e.target.value)} />

        <textarea className="w-full border p-3 mb-3 rounded" placeholder="Descripción" value={description} onChange={(e) => setDescription(e.target.value)} />

        <input className="w-full border p-3 mb-3 rounded" placeholder="Precio por paquete mínimo 25" value={pricePerPack} onChange={(e) => setPricePerPack(e.target.value)} />

        <input className="w-full border p-3 mb-3 rounded" placeholder="Líneas por paquete" value={linesPerPack} onChange={(e) => setLinesPerPack(e.target.value)} />

        <input className="w-full border p-3 mb-4 rounded" type="file" accept=".txt" onChange={(e) => setFile(e.target.files?.[0] || null)} />

        <button onClick={createProduct} className="bg-black text-white px-5 py-3 rounded">
          Crear producto
        </button>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">Mis productos</h2>

        <div className="grid gap-5">
          {products.map((product) => (
            <div key={product.id} className="border rounded-2xl p-5 max-w-2xl">
              <input className="w-full border p-3 mb-3 rounded" value={product.title} onChange={(e) => changeProduct(product.id, "title", e.target.value)} />

              <textarea className="w-full border p-3 mb-3 rounded" value={product.description || ""} onChange={(e) => changeProduct(product.id, "description", e.target.value)} />

              <input className="w-full border p-3 mb-3 rounded" value={product.price_per_pack} onChange={(e) => changeProduct(product.id, "price_per_pack", Number(e.target.value))} />

              <input className="w-full border p-3 mb-3 rounded" value={product.lines_per_pack} onChange={(e) => changeProduct(product.id, "lines_per_pack", Number(e.target.value))} />

              <p className="mb-2">Stock disponible: {product.stock_count} líneas</p>

              <input
                className="w-full border p-3 mb-3 rounded"
                type="file"
                accept=".txt"
                onChange={(e) => {
                  const selectedFile = e.target.files?.[0];
                  if (selectedFile) addTxtToProduct(product, selectedFile);
                }}
              />

              <label className="flex items-center gap-2 mb-4">
                <input type="checkbox" checked={product.active} onChange={(e) => changeProduct(product.id, "active", e.target.checked)} />
                Producto activo
              </label>

              <button onClick={() => updateProduct(product)} className="bg-black text-white px-5 py-3 rounded">
                Guardar cambios
              </button>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
