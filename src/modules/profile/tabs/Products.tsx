"use client";

import React, { useState } from "react";
import { Plus, Package, Trash2 } from "lucide-react";
import {
  FormField, inputCls, DropdownSelect,
  EmptyState, DrawerFooter,
} from "../SharedUI";
import { DrawerBase } from "../DrawerBase";
import { INDUSTRIES, PRODUCT_GRADES, MOQ_UNITS, INVENTORY_UNITS } from "../constants";
import { useProfileStore } from "@/store/useProfileStore";
import type { Product } from "../types";

const EMPTY: Omit<Product, "id"> = {
  name: "", casNo: "", industry: "", grade: "", purity: "",
  moq: "", moqUnit: "kg",
  inventoryStatus: "Made to order",
  availableQty: "", availableUnit: "kg", availableLocation: "",
  crackedChemistry: false, workedOnProduct: false,
};

function AddProductDrawer({ open, onClose, onSave }: {
  open: boolean; onClose: () => void; onSave: (p: Product) => void;
}) {
  const [form, setForm] = useState<Omit<Product, "id">>(EMPTY);
  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
    setForm((p) => ({ ...p, [k]: v }));

  const handleSave = () => {
    if (!form.name.trim()) return;
    onSave({ ...form, id: Date.now().toString() });
    setForm(EMPTY);
    onClose();
  };

  return (
    <DrawerBase open={open} onClose={onClose} title="Add Product"
      footer={<DrawerFooter onCancel={onClose} onSave={handleSave} saveLabel="Save Product" />}>
      <div className="flex flex-col gap-4">
        <FormField label="Product / Chemical Name *">
          <input className={inputCls} value={form.name}
            onChange={(e) => set("name", e.target.value)} placeholder="e.g. Ibuprofen" />
        </FormField>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="CAS Number">
            <input className={inputCls} value={form.casNo}
              onChange={(e) => set("casNo", e.target.value)} placeholder="e.g. 15687-27-1" />
          </FormField>
          <FormField label="Industry">
            <DropdownSelect
              value={form.industry}
              onChange={(v) => set("industry", v)}
              options={INDUSTRIES}
              placeholder="Select industry"
            />
          </FormField>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Grade">
            <DropdownSelect
              value={form.grade}
              onChange={(v) => set("grade", v)}
              options={PRODUCT_GRADES}
              placeholder="Select grade"
            />
          </FormField>
          <FormField label="Purity (%)">
            <input className={inputCls} type="number" min="0" max="100" step="0.01"
              value={form.purity} onChange={(e) => set("purity", e.target.value)}
              placeholder="e.g. 99.5" />
          </FormField>
        </div>

        <FormField label="MOQ (Minimum Order Quantity)">
          <div className="flex gap-2">
            <input className={inputCls + " flex-1 min-w-0"} value={form.moq}
              onChange={(e) => set("moq", e.target.value)} placeholder="e.g. 100" />
            <DropdownSelect
              value={form.moqUnit}
              onChange={(v) => set("moqUnit", v)}
              options={MOQ_UNITS}
              className="w-[90px] flex-shrink-0"
            />
          </div>
        </FormField>

        <FormField label="Commercial & Readiness Status">
          <DropdownSelect
            value={form.inventoryStatus}
            onChange={(v) => set("inventoryStatus", v as Product["inventoryStatus"])}
            options={["In inventory", "Made to order"]}
          />
        </FormField>

        {form.inventoryStatus === "In inventory" && (
          <div className="animate-in fade-in-0 duration-200 flex flex-col gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="Available Quantity">
                <input className={inputCls} type="number" min="0"
                  value={form.availableQty} onChange={(e) => set("availableQty", e.target.value)}
                  placeholder="e.g. 500" />
              </FormField>
              <FormField label="Unit">
                <DropdownSelect
                  value={form.availableUnit}
                  onChange={(v) => set("availableUnit", v)}
                  options={INVENTORY_UNITS}
                />
              </FormField>
            </div>
            <FormField label="Available at Location">
              <input className={inputCls} value={form.availableLocation}
                onChange={(e) => set("availableLocation", e.target.value)}
                placeholder="e.g. Ankleshwar, Gujarat" />
            </FormField>
          </div>
        )}

        <div className="flex flex-col gap-2 pt-1">
          {[
            { key: "crackedChemistry" as const, label: "Cracked Chemistry",
              desc: "You have successfully developed the synthesis route" },
            { key: "workedOnProduct" as const, label: "Worked on this Product",
              desc: "You have prior experience manufacturing this compound" },
          ].map(({ key, label, desc }) => (
            <label key={key} className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={form[key]}
                onChange={(e) => set(key, e.target.checked)}
                className="w-4 h-4 rounded accent-[#1F6F54]" />
              <div>
                <p className="text-sm font-medium text-[#020202]">{label}</p>
                <p className="text-xs text-[#9ca3af]">{desc}</p>
              </div>
            </label>
          ))}
        </div>
      </div>
    </DrawerBase>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-[#f3f4f6] last:border-0 gap-2">
      <span className="text-[11px] text-[#9ca3af] flex-shrink-0">{label}</span>
      <span className="text-[11px] font-semibold text-[#020202] text-right">{value}</span>
    </div>
  );
}

function CollapsibleCardGrid<T extends { id: string }>({
  items,
  renderItem,
  emptyText,
}: {
  items: T[];
  renderItem: (item: T) => React.ReactNode;
  emptyText: string;
}) {
  const [showAll, setShowAll] = React.useState(false);
  const LIMIT = 4;
  const visible = showAll ? items : items.slice(0, LIMIT);
  if (items.length === 0) return <p className="text-xs text-[#9ca3af] py-4 text-center">{emptyText}</p>;
  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {visible.map((item) => renderItem(item))}
      </div>
      {items.length > LIMIT && (
        <button type="button" onClick={() => setShowAll(s => !s)}
          className="mt-3 text-xs font-semibold text-[#1F6F54] hover:text-[#185C45] transition-colors">
          {showAll ? "↑ Show less" : `↓ Show all ${items.length}`}
        </button>
      )}
    </div>
  );
}

function ProductCard({ p, onDelete }: { p: Product; onDelete: () => void }) {
  const isInInventory = p.inventoryStatus === "In inventory";
  return (
    <div className="bg-white rounded-xl border border-[#e4e4e7] shadow-sm flex flex-col">
      {/* Header */}
      <div className="p-3 flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-[#020202] leading-snug truncate">{p.name}</p>
          {p.industry && <p className="text-xs font-medium text-[#1F6F54] mt-0.5 truncate">{p.industry}</p>}
          <span className={`inline-block mt-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full ${
            isInInventory
              ? "bg-[#d1fae5] text-[#065f46]"
              : "bg-[#f3f4f6] text-[#62748e]"
          }`}>
            {isInInventory ? "IN INVENTORY" : "Made to order"}
          </span>
        </div>
        <button onClick={onDelete}
          className="p-1.5 rounded-lg hover:bg-red-50 text-[#d1d5db] hover:text-red-500 transition-colors flex-shrink-0">
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Details */}
      <div className="px-3 pb-2 border-t border-[#f3f4f6] pt-2 flex flex-col flex-1">
        {p.casNo && <DetailRow label="CAS" value={p.casNo} />}
        {p.purity && <DetailRow label="Purity" value={`${p.purity}%`} />}
        {p.moq && <DetailRow label="MOQ" value={`${p.moq} ${p.moqUnit}`} />}
        {p.grade && <DetailRow label="Grade" value={p.grade} />}
        {isInInventory && p.availableQty && (
          <DetailRow label="Available" value={`${p.availableQty} ${p.availableUnit}`} />
        )}
      </div>

      {/* Badges */}
      {(p.crackedChemistry || p.workedOnProduct) && (
        <div className="px-3 pb-3 flex flex-wrap gap-1">
          {p.crackedChemistry && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#ede9fe] text-[#6d28d9] border border-[#ddd6fe]">
              ⚡ CHEMISTRY CRACKED
            </span>
          )}
          {p.workedOnProduct && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#fef3c7] text-[#92400e] border border-[#fde68a]">
              ✓ PAST EXPERIENCE
            </span>
          )}
        </div>
      )}
    </div>
  );
}

export function Products({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const [open, setOpen]   = useState(false);
  const products          = useProfileStore((s) => s.products);
  const addProduct        = useProfileStore((s) => s.addProduct);
  const deleteProduct     = useProfileStore((s) => s.deleteProduct);

  return (
    <>
      <AddProductDrawer open={open} onClose={() => setOpen(false)}
        onSave={(p) => addProduct(p)} />
      <div className="flex flex-col">
        <div className="p-4 sm:p-6 pb-2">
          <div className="flex items-center justify-end mb-4">
            <button onClick={() => setOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-[6px] bg-[#1F6F54] hover:bg-[#185C45] text-white text-sm font-medium transition-colors">
              <Plus className="w-4 h-4" /> Add Product
            </button>
          </div>
          {products.length === 0
            ? <EmptyState icon={Package} title="No products added yet"
                subtitle="Click Add Product to list your chemicals and compounds." />
            : <CollapsibleCardGrid
                items={products}
                emptyText="No products added yet."
                renderItem={(p) => (
                  <ProductCard key={p.id} p={p} onDelete={() => deleteProduct(p.id)} />
                )}
              />
          }
        </div>
        {/* navigation handled by ProfileSetup header */}
      </div>
    </>
  );
}
