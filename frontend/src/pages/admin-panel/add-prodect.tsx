import React, { useState } from "react";
import { j } from "../../api";
import type { Product } from "../../types";
import * as XLSX from "xlsx";
import exampleFile from "../../assets/exampule-formet.xlsx";

function ProductForm({ token, products, setProducts }: any) {
  const [form, setForm] = useState<Partial<Product>>({ is_active: true });
  const [preview, setPreview] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const [bulkFile, setBulkFile] = useState<File | null>(null);
  const [bulkFileName, setBulkFileName] = useState<string>("");
  const [bulkErrors, setBulkErrors] = useState<string[]>([]);

  /** -------- SINGLE IMAGE UPLOAD -------- **/
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setPreview(selectedFile ? URL.createObjectURL(selectedFile) : null);
    setImageUrl(null);
    if (!selectedFile) return;

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const res = await fetch("/api/admin/upload-url", {
        method: "POST",
        body: formData,
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Upload failed");
      }

      const data = await res.json();
      setImageUrl(data.public_url);
    } catch (err: any) {
      console.error("Image upload failed:", err.message);
      setImageUrl(null);
    }
  };

  /** -------- FORM VALIDATION -------- **/
  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    if (!form.name?.trim()) newErrors.name = "Required";
    if (form.mrp === undefined || form.mrp < 0) newErrors.mrp = "Invalid MRP";
    if (form.price === undefined || form.price < 0) newErrors.price = "Invalid Price";
    if (!form.category?.trim()) newErrors.category = "Required";
    if (!imageUrl) newErrors.image_url = "Image required";
    return newErrors;
  };

  /** -------- SAVE SINGLE PRODUCT -------- **/
  const saveProduct = async () => {
    const validationErrors = validateForm();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    const payload = {
      name: form.name!,
      mrp: form.mrp!,
      price: form.price!,
      category: form.category!,
      is_active: form.is_active ?? true,
      description: form.description ?? "",
      image_url: imageUrl!,
    };

    try {
      const newProduct = await j("/api/admin/products", "POST", payload, token);
      setProducts([newProduct, ...products]);
      setForm({ is_active: true });
      setPreview(null);
      setImageUrl(null);
      setErrors({});
    } catch (err: any) {
      console.error("Failed to save product:", err.message);
    }
  };

  /** -------- BULK UPLOAD -------- **/
  const handleBulkFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setBulkFile(selectedFile);
    setBulkFileName(selectedFile ? selectedFile.name : "");
    setBulkErrors([]);
  };

  const uploadBulkProducts = async () => {
    if (!bulkFile) return;

    const data = await bulkFile.arrayBuffer();
    const workbook = XLSX.read(data);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows: any[] = XLSX.utils.sheet_to_json(worksheet);

    const errors: string[] = [];
    const newProducts: Product[] = [];

    for (const row of rows) {
      try {
        let image_url = row.ImageURL || "";
        // If image file path is provided locally (can implement drag-drop per row if needed)
        // Example: you can extend this to handle Base64 or local files in the future

        const payload = {
          name: row.Name,
          mrp: parseFloat(row.MRP),
          price: parseFloat(row.Price),
          category: row.Category,
          description: row.Description || "",
          is_active: row.Active !== undefined ? !!row.Active : true,
          image_url,
        };

        if (!payload.name || !payload.category || isNaN(payload.price) || isNaN(payload.mrp)) {
          errors.push(`Invalid row: ${JSON.stringify(row)}`);
          continue;
        }

        const newProduct = await j("/api/admin/products", "POST", payload, token);
        newProducts.push(newProduct);
      } catch (err) {
        errors.push(`Failed row: ${JSON.stringify(row)}`);
      }
    }

    setProducts([...newProducts, ...products]);
    setBulkErrors(errors);
    setBulkFile(null);
    setBulkFileName("");

    if (errors.length === 0) {
      alert("All products uploaded successfully!");
    } else {
      alert(`Upload completed with ${errors.length} errors!`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6 md:p-10">
      <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-md p-6 sm:p-8 md:p-10 flex flex-col gap-8">
        <h2 className="text-2xl sm:text-3xl font-semibold text-gray-800 border-b pb-3">
          ➕ Add Product or Bulk Upload
        </h2>

        {/* SINGLE PRODUCT FORM */}
        <form
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
          onSubmit={(e) => {
            e.preventDefault();
            saveProduct();
          }}
        >
          <div className="flex flex-col gap-4">
            <input
              placeholder="Product Name"
              value={form.name || ""}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className={`rounded-lg border px-4 py-2 focus:ring-2 focus:ring-green-400 ${
                errors.name ? "border-red-500" : "border-gray-300"
              }`}
            />
            <textarea
              placeholder="Description"
              value={form.description || ""}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="rounded-lg border px-4 py-2 min-h-[80px] focus:ring-2 focus:ring-green-400"
            />
            <div className="grid grid-cols-2 gap-4">
              <input
                type="number"
                placeholder="MRP"
                value={form.mrp || ""}
                onChange={(e) => setForm({ ...form, mrp: parseFloat(e.target.value) })}
                className={`rounded-lg border px-4 py-2 ${
                  errors.mrp ? "border-red-500" : "border-gray-300"
                }`}
              />
              <input
                type="number"
                placeholder="Price"
                value={form.price || ""}
                onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value) })}
                className={`rounded-lg border px-4 py-2 ${
                  errors.price ? "border-red-500" : "border-gray-300"
                }`}
              />
            </div>
            <select
              value={form.category || ""}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className={`w-full rounded-lg border px-4 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.category ? "border-red-500" : "border-gray-300"
              }`}
            >
              <option value="Sparklers">Sparklers</option>
              <option value="Flower Pots">Flower Pots</option>
              <option value="Rockets">Rockets</option>
              <option value="Chakkars">Chakkars</option>
              <option value="Bombs">Bombs</option>
              <option value="Fancy">Fancy</option>
              <option value="Gift Box">Gift Box</option>
              <option value="One Sound">One Sound</option>
              <option value="Lakshmi">Lakshmi</option>
            </select>
            <label className="flex items-center gap-2 mt-2">
              <input
                type="checkbox"
                checked={!!form.is_active}
                onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                className="w-4 h-4 accent-green-500"
              />
              <span className="text-gray-700 text-sm">Active</span>
            </label>
          </div>

          <div className="flex flex-col items-center gap-4">
            <div className="w-full sm:w-64 h-64 border-2 border-dashed rounded-xl flex items-center justify-center relative overflow-hidden">
              {preview ? (
                <img src={preview} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <p className="text-gray-400 text-center text-sm px-2">
                  Drag & Drop or Click to Upload
                </p>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </div>
            {errors.image_url && <p className="text-red-500 text-sm mt-1">{errors.image_url}</p>}
          </div>

          <button
            type="submit"
            className="md:col-span-2 px-6 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition mt-2"
          >
            ✅ Save Product
          </button>
        </form>

        {/* BULK UPLOAD */}
        <div className="flex flex-col gap-4 bg-gray-50 rounded-xl shadow-md p-5 md:p-6">
          <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">📦 Bulk Upload Products (Excel)</h3>

          <a
            href={exampleFile}
            download="example_products.xlsx"
            className="inline-block mb-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm font-medium"
          >
            📄 Download Example Format
          </a>

          <label className="relative flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-lg cursor-pointer hover:border-blue-400 transition">
            <p className="text-gray-500 text-sm text-center">
              Drag & Drop or Click to Select Excel File
            </p>
            <input
              type="file"
              accept=".xlsx, .xls, .csv"
              onChange={handleBulkFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
          </label>

          {bulkFileName && <p className="text-gray-700 text-sm mt-1">Selected File: {bulkFileName}</p>}

          <button
            onClick={uploadBulkProducts}
            className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium mt-2"
          >
            🚀 Upload Bulk Products
          </button>

          {bulkErrors.length > 0 && (
            <div className="bg-red-100 text-red-700 p-3 rounded-lg text-sm mt-2">
              <ul className="list-disc ml-5">
                {bulkErrors.map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            </div>
          )}

          <p className="text-gray-500 text-sm mt-1">
            Excel columns: Name, MRP, Price, Category, Description, ImageURL, Active
          </p>
        </div>
      </div>
    </div>
  );
}

export default ProductForm;
