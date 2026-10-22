"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Check, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/components/cart-provider";
import { formatPrice } from "@/lib/format";
import type { ProductDetailsToolInvocation } from "@/lib/agent";

interface AgentProductCardProps {
  invocation: ProductDetailsToolInvocation;
}

export function AgentProductCard({ invocation }: AgentProductCardProps) {
  const { addToCart } = useCart();
  const [isAdded, setIsAdded] = useState(false);

  if (
    invocation.state === "input-streaming" ||
    invocation.state === "input-available"
  ) {
    const id = invocation.input?.idOrSlug;
    return (
      <div className="rounded-lg border border-border bg-card p-4 text-sm text-muted-foreground">
        Looking up{id ? ` "${id}"` : ""}…
      </div>
    );
  }

  if (invocation.state !== "output-available") return null;

  const output = invocation.output;

  if (!output) return null;

  if ("error" in output) {
    return (
      <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
        {output.error as string}
      </div>
    );
  }

  const { stock, inStock, lowStock, ...product } = output;
  const image = product.images[0];
  const stockLabel = !inStock
    ? "Out of stock"
    : lowStock
      ? `Only ${stock} left`
      : `In stock (${stock})`;
  const stockClass = !inStock
    ? "text-destructive"
    : lowStock
      ? "text-amber-600"
      : "text-emerald-600";

  const handleAddToCart = () => {
    if (!inStock) return;
    addToCart(product, 1);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card">
      {image && (
        <div className="relative aspect-4/3 bg-secondary">
          <Image
            src={image}
            alt={product.name}
            fill
            sizes="(min-width: 768px) 480px, 100vw"
            className="object-cover"
          />
        </div>
      )}
      <div className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-base font-semibold leading-tight">
              {product.name}
            </h3>
            <p className="text-sm text-muted-foreground">
              {formatPrice(product.price, product.currency)}
            </p>
          </div>
          <span className={`shrink-0 text-xs font-medium ${stockClass}`}>
            {stockLabel}
          </span>
        </div>
        <p className="line-clamp-3 text-sm text-muted-foreground">
          {product.description}
        </p>
        {product.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {product.tags.slice(0, 5).map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-secondary px-2 py-0.5 text-xs text-muted-foreground"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
        <div className="flex items-center justify-between gap-3">
          <Button size="sm" onClick={handleAddToCart} disabled={!inStock}>
            {isAdded ? (
              <>
                <Check className="mr-1 h-4 w-4" />
                Added to cart
              </>
            ) : !inStock ? (
              "Out of stock"
            ) : (
              <>
                <ShoppingCart className="mr-1 h-4 w-4" />
                Add to cart
              </>
            )}
          </Button>
          <Link
            href={`/products/${product.slug}`}
            className="inline-flex text-sm font-medium text-foreground underline-offset-4 hover:underline"
          >
            View product →
          </Link>
        </div>
      </div>
    </div>
  );
}
