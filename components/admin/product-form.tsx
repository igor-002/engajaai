"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Product, Category, PaymentMethodKey } from "@/types";

type Mode = "create" | "edit";

export function ProductForm({
  mode,
  categories,
  initial,
  action,
}: {
  mode: Mode;
  categories: Category[];
  initial?: Product & { categoryId?: string };
  action: (formData: FormData) => Promise<void>;
}) {
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(initial?.imageUrl ?? null);
  const [removeImage, setRemoveImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) {
      setPreviewUrl(initial?.imageUrl ?? null);
      return;
    }
    setRemoveImage(false);
    setPreviewUrl(URL.createObjectURL(file));
  }

  function clearImage() {
    if (fileInputRef.current) fileInputRef.current.value = "";
    setPreviewUrl(null);
    setRemoveImage(true);
  }

  const initialCategoryId =
    initial?.categoryId ??
    categories.find((c) => c.slug === initial?.categorySlug)?.id ??
    categories[0]?.id ??
    "";

  const methods: PaymentMethodKey[] = initial?.paymentMethods ?? ["pix"];

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setErr(null);
    const form = new FormData(e.currentTarget);
    try {
      await action(form);
    } catch (e) {
      setSubmitting(false);
      setErr(e instanceof Error ? e.message : "Erro ao salvar");
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5" encType="multipart/form-data">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5 md:col-span-2">
          <Label htmlFor="name">Nome</Label>
          <Input id="name" name="name" required defaultValue={initial?.name} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="slug">Slug (URL)</Label>
          <Input
            id="slug"
            name="slug"
            required
            pattern="[a-z0-9-]+"
            defaultValue={initial?.slug}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="categoryId">Categoria</Label>
          <select
            id="categoryId"
            name="categoryId"
            required
            defaultValue={initialCategoryId}
            className="flex h-9 w-full rounded-md border border-input bg-input px-3 py-1 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5 md:col-span-2">
          <Label htmlFor="description">Descrição</Label>
          <textarea
            id="description"
            name="description"
            required
            rows={4}
            defaultValue={initial?.description}
            className="flex w-full rounded-md border border-input bg-input px-3 py-2 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="priceCents">Preço (centavos)</Label>
          <Input
            id="priceCents"
            name="priceCents"
            type="number"
            min={0}
            required
            defaultValue={initial?.priceCents}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="originalPriceCents">Preço original (centavos, opcional)</Label>
          <Input
            id="originalPriceCents"
            name="originalPriceCents"
            type="number"
            min={0}
            defaultValue={initial?.originalPriceCents ?? ""}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="stock">Estoque</Label>
          <Input
            id="stock"
            name="stock"
            type="number"
            min={0}
            required
            defaultValue={initial?.stock ?? 0}
          />
        </div>
        <div className="space-y-1.5 md:col-span-2">
          <Label htmlFor="image">Imagem (PNG, JPG, WEBP, GIF, SVG — máx 5MB)</Label>
          <div className="flex items-start gap-4">
            {previewUrl ? (
              <div className="relative h-24 w-24 overflow-hidden rounded-md border border-border bg-muted">
                <Image
                  src={previewUrl}
                  alt="Pré-visualização"
                  fill
                  sizes="96px"
                  className="object-cover"
                  unoptimized
                />
              </div>
            ) : (
              <div className="flex h-24 w-24 items-center justify-center rounded-md border border-dashed border-border text-xs text-muted-foreground">
                sem imagem
              </div>
            )}
            <div className="flex-1 space-y-2">
              <Input
                id="image"
                name="image"
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
                ref={fileInputRef}
                onChange={onFileChange}
              />
              {previewUrl && (
                <Button type="button" variant="ghost" size="sm" onClick={clearImage}>
                  Remover imagem
                </Button>
              )}
              <input type="hidden" name="removeImage" value={removeImage ? "1" : ""} />
            </div>
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="deliveryMode">Entrega</Label>
          <select
            id="deliveryMode"
            name="deliveryMode"
            required
            defaultValue={initial?.deliveryMode ?? "auto"}
            className="flex h-9 w-full rounded-md border border-input bg-input px-3 py-1 text-sm shadow-xs"
          >
            <option value="auto">Automática</option>
            <option value="manual">Manual</option>
          </select>
        </div>
        <fieldset className="space-y-2 md:col-span-2">
          <legend className="text-sm font-medium">Métodos de pagamento</legend>
          <label className="inline-flex items-center gap-2 mr-4">
            <input
              type="checkbox"
              name="paymentMethods"
              value="pix"
              defaultChecked={methods.includes("pix")}
            />
            PIX
          </label>
          <label className="inline-flex items-center gap-2">
            <input
              type="checkbox"
              name="paymentMethods"
              value="card"
              defaultChecked={methods.includes("card")}
            />
            Cartão
          </label>
        </fieldset>
        <label className="md:col-span-2 inline-flex items-center gap-2">
          <input
            type="checkbox"
            name="featured"
            defaultChecked={initial?.featured ?? false}
          />
          <span className="text-sm">Destacar na home</span>
        </label>
      </div>

      {err && (
        <p role="alert" className="text-sm text-destructive">
          {err}
        </p>
      )}

      <div className="flex gap-2">
        <Button type="submit" disabled={submitting}>
          {submitting ? "Salvando..." : mode === "create" ? "Criar produto" : "Salvar alterações"}
        </Button>
      </div>
    </form>
  );
}
