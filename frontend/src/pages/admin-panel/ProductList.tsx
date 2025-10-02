import React, { useState } from "react";
import type { Product } from "../../types";
import { j } from "../../api";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  IconButton,
  TablePagination,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  InputAdornment,
} from "@mui/material";

import {
  Edit,
  Delete,
  PictureAsPdf,
  GridOn,
  Search,
} from "@mui/icons-material";

interface ProductListProps {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  token: string;
}

export default function ProductList({ products, setProducts, token }: ProductListProps) {
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [form, setForm] = useState<Partial<Product>>({});
  const [file, setFile] = useState<File | null>(null);
  const [page, setPage] = useState(0);
  const [searchTerm, setSearchTerm] = useState(""); // ✅ Search state
  const rowsPerPage = 15;

  // Filtered products based on search
  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.category && p.category.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setFile(selectedFile);
    if (selectedFile) setForm({ ...form, image_url: URL.createObjectURL(selectedFile) });
  };

  // Update product
  const updateProduct = async () => {
    if (!editingProduct) return;

    let image_url = form.image_url;
    if (file) {
      const meta = await j("/api/admin/upload-url", "POST", { file }, token);
      await fetch(meta.upload_url, {
        method: "PUT",
        headers: { "Content-Type": "application/octet-stream" },
        body: file,
      });
      image_url = meta.public_url;
    }

    const payload = { ...form, image_url };
    await j(`/api/admin/products/${editingProduct.id}`, "PUT", payload, token);
    setProducts(products.map((p) => (p.id === editingProduct.id ? { ...p, ...payload } : p)));
    setEditingProduct(null);
    setFile(null);
    setForm({});
  };

  // Delete product
  const removeProduct = async (id: string) => {
    await j(`/api/admin/products/${id}`, "DELETE", {}, token);
    setProducts(products.filter((p) => p.id !== id));
  };

  // Export PDF
  const exportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Products List", 14, 20);
    autoTable(doc, {
      startY: 30,
      head: [["Name", "Price (₹)", "Category"]],
      body: filteredProducts.map((p) => [p.name, p.price, p.category || "-"]),
    });
    doc.save("products.pdf");
  };

  // Export Excel
  const exportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      filteredProducts.map((p) => ({ Name: p.name, Price: p.price, Category: p.category || "-" }))
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Products");
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    saveAs(new Blob([excelBuffer], { type: "application/octet-stream" }), "products.xlsx");
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">Products</h2>

      {/* Search & Export */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
        <TextField
          placeholder="Search by name or category..."
          variant="outlined"
          size="small"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
        />
        <div className="flex gap-2">
          <Button variant="contained" color="error" startIcon={<PictureAsPdf />} onClick={exportPDF}>
            Export PDF
          </Button>
          <Button variant="contained" color="success" startIcon={<GridOn />} onClick={exportExcel}>
            Export Excel
          </Button>
        </div>
      </div>

      {/* Table */}
      <TableContainer component={Paper} sx={{ maxHeight: 600 }}>
        <Table stickyHeader>
          <TableHead sx={{ backgroundColor: "#f0f0f0" }}>
            <TableRow>
              <TableCell className="font-semibold">Name & Image</TableCell>
              <TableCell className="font-semibold">MRP</TableCell>
              <TableCell className="font-semibold">Price</TableCell>
              <TableCell className="font-semibold">Category</TableCell>
              <TableCell align="center" className="font-semibold">
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredProducts
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((p) => (
                <TableRow key={p.id} hover>
                  <TableCell sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    {p.image_url && (
                      <img
                        src={p.image_url}
                        alt={p.name}
                        className="w-12 h-12 object-cover rounded border border-gray-200"
                      />
                    )}
                    {p.name}
                  </TableCell>
                  <TableCell>{p.mrp}</TableCell>
                  <TableCell>{p.price}</TableCell>
                  <TableCell>{p.category || "-"}</TableCell>
                  <TableCell align="center">
                    <IconButton
                      color="primary"
                      onClick={() => {
                        setEditingProduct(p);
                        setForm(p);
                      }}
                    >
                      <Edit />
                    </IconButton>
                    <IconButton color="error" onClick={() => removeProduct(p.id)}>
                      <Delete />
                    </IconButton>
                    <IconButton color="secondary">
                      {/* <Visibility /> */}
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component="div"
        count={filteredProducts.length}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        rowsPerPageOptions={[rowsPerPage]}
      />

      {/* Edit Modal */}
      <Dialog open={!!editingProduct} onClose={() => setEditingProduct(null)} fullWidth maxWidth="sm">
        <DialogTitle>Edit Product</DialogTitle>
        <DialogContent className="flex flex-col gap-4 mt-2">
          <TextField
            label="Name"
            value={form.name || ""}
            fullWidth
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <TextField
            label="Category"
            value={form.category || ""}
            fullWidth
            onChange={(e) => setForm({ ...form, category: e.target.value })}
          />
          <TextField
            label="MRP"
            type="number"
            value={form.mrp || 0}
            fullWidth
            onChange={(e) => setForm({ ...form, mrp: Number(e.target.value) })}
          />
          <TextField
            label="Price"
            type="number"
            value={form.price || 0}
            fullWidth
            onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
          />
          <TextField
            label="Sequence Number"
            type="number"
            value={form.sequence_number || 0}
            fullWidth
            onChange={(e) => setForm({ ...form, sequence_number: Number(e.target.value) })}
            helperText="Unique number for ordering products"
          />
          <input type="file" accept="image/*" onChange={handleFileChange} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditingProduct(null)}>Cancel</Button>
          <Button variant="contained" onClick={updateProduct}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
