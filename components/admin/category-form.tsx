"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Category } from "@/types";

type Mode = "create" | "edit";

export function CategoryForm({
  mode,
  initial,
  action,
}: {
  mode: Mode;
  initial?: Category & { sortOrder?: number };
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

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setErr(null);
    const form = new FormData(e.currentTarget);
    try {
      await action(form);
    } catch (e) {
      setSubmitting(false);
      setErr(e instanceof Error ? e.message : "Erro");
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4" encType="multipart/form-data">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="name">Nome</Label>
          <Input id="name" name="name" required defaultValue={initial?.name} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="slug">Slug</Label>
          <Input
            id="slug"
            name="slug"
            required
            pattern="[a-z0-9-]+"
            defaultValue={initial?.slug}
          />
        </div>
        <div className="space-y-1.5 md:col-span-2">
          <Label htmlFor="description">Descrição (opcional)</Label>
          <Input id="description" name="description" defaultValue={initial?.description ?? ""} />
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
          <Label htmlFor="sortOrder">Ordem</Label>
          <Input
            id="sortOrder"
            name="sortOrder"
            type="number"
            min={0}
            defaultValue={initial?.sortOrder ?? 0}
          />
        </div>
      </div>

      {err && <p role="alert" className="text-sm text-destructive">{err}</p>}

      <Button type="submit" disabled={submitting}>
        {submitting ? "Salvando..." : mode === "create" ? "Criar categoria" : "Salvar"}
      </Button>
    </form>
  );
}
