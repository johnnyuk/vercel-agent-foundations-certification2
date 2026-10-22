"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Check, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/components/cart-provider";
import { formatPrice } from "@/lib/format";
import type { SearchProductsToolInvocation } from "@/lib/agent";

interface AgentProductListProps {
  invocation: SearchProductsToolInvocation;
}

export function AgentProductList({ invocation }: AgentProductListProps) {
  if (
    invocation.state === "input-streaming" ||
    invocation.state === "input-available"
  ) {
    const query = invocation.input?.query;
    return (
      <div className="rounded-lg border border-border bg-card p-4 text-sm text-muted-foreground">
        Searching{query ? ` for "${query}"` : ""}…
      </div>
    );
  }

  if (invocation.state !== "output-available") return null;

  const output = invocation.output;

  if (!output) return null;

  if ("error" in output && output.error) {
    return (
      <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
        {output.error}
      </div>
    );
  }

  if (output.count === 0) {
    return null;
  }

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card">
      <ul className="divide-y divide-border">
        {output.products.map((product) => (
          <AgentProductListItem key={product.id} product={product} />
        ))}
      </ul>
    </div>
  );
}

interface ProductSummary {
  id: string;
  name: string;
  slug: string;
  image?: string;
  price: number;
  currency: string;
  category: string;
  description: string;
}

function AgentProductListItem({ product }: { product: ProductSummary }) {
  const { addToCart } = useCart();
  const [isAdded, setIsAdded] = useState(false);

  // Search results only carry summary fields, so fill in the rest of the
  // Product shape; the cart is replaced with the server's copy after the add.
  const handleAddToCart = () => {
    addToCart(
      {
        id: product.id,
        name: product.name,
        slug: product.slug,
        description: product.description,
        price: product.price,
        currency: product.currency,
        category: product.category,
        images: product.image ? [product.image] : [],
        tags: [],
        featured: false,
        createdAt: "",
      },
      1,
    );
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  return (
    <li className="flex items-center gap-3 p-3 transition-colors hover:bg-secondary/50">
      <Link
        href={`/products/${product.slug}`}
        className="flex min-w-0 flex-1 items-center gap-3"
      >
        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-md bg-secondary">
          {product.image && (
            <Image
              src={product.image}
              alt={product.name}
              fill
              sizes="56px"
              className="object-cover"
            />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-semibold leading-tight">
            {product.name}
          </h3>
          <p className="text-xs text-muted-foreground">
            {formatPrice(product.price, product.currency)}
          </p>
        </div>
      </Link>
      <Button
        size="sm"
        variant="outline"
        onClick={handleAddToCart}
        aria-label={`Add ${product.name} to cart`}
        className="shrink-0"
      >
        {isAdded ? (
          <>
            <Check className="mr-1 h-4 w-4" />
            Added
          </>
        ) : (
          <>
            <ShoppingCart className="mr-1 h-4 w-4" />
            Add
          </>
        )}
      </Button>
    </li>
  );
}
