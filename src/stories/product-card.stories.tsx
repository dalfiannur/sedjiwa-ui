import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { HeartIcon } from "lucide-react";
import { Button } from "../components/button";
import { Card, CardContent } from "../components/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  CarouselStatus,
} from "../components/carousel";
import { Rating } from "../components/rating";

/**
 * A product card is a **composition, not a component**. Every part of it
 * already ships: `Card` for the shell, `Carousel` for the image strip,
 * `Rating` for the score, and `Button` for both the favourite toggle and the
 * action. Nothing here is exported from the library, and deliberately so —
 * price and product are domain ideas, and putting them in a UI library means
 * every consumer inherits one app's shape of "product".
 *
 * This story is the assembly instructions.
 */
const meta: Meta = {
  title: "Recipes/Product Card",
  parameters: {
    docs: {
      description: {
        component:
          "Card + Carousel + Rating + Button. Copy it into your app and give it your own data shape.",
      },
    },
  },
};
export default meta;

type Story = StoryObj;

type Product = {
  id: string;
  name: string;
  price: string;
  rating: number;
  reviews: number;
  /** One entry per image. Real images go here; these are placeholders. */
  shots: string[];
};

const WATCH: Product = {
  id: "1",
  name: "Apple Watch Series 9",
  price: "Rp6.499.000",
  rating: 4.3,
  reviews: 131,
  shots: ["a", "b", "c"],
};

const PRODUCTS: Product[] = [
  WATCH,
  {
    id: "2",
    name: "Beats Headphone 2026",
    price: "Rp1.335.000",
    rating: 4.8,
    reviews: 42,
    shots: ["a", "b"],
  },
  {
    id: "3",
    name: "Galaxy Buds Pro",
    price: "Rp2.150.000",
    rating: 3.6,
    reviews: 508,
    shots: ["a", "b", "c"],
  },
];

function FavouriteButton({ name }: { name: string }) {
  const [saved, setSaved] = useState(false);
  return (
    <Button
      variant="outline"
      size="icon"
      // `pressed` is what makes this a toggle rather than a button that
      // happens to change colour: it emits aria-pressed and data-state="on",
      // so the state is announced instead of only drawn.
      pressed={saved}
      onClick={() => setSaved((v) => !v)}
      aria-label={saved ? `Hapus ${name} dari favorit` : `Simpan ${name} ke favorit`}
      className="shrink-0 rounded-full"
    >
      <HeartIcon
        aria-hidden="true"
        className={saved ? "fill-destructive text-destructive" : undefined}
      />
    </Button>
  );
}

function ProductCard({ product }: { product: Product }) {
  return (
    <Card className="gap-0 overflow-hidden py-0">
      {/* The image strip is a Carousel with its arrows floated over the
          artwork, which is only positioning — the component needs no variant
          for it. */}
      <Carousel aria-label={`Foto ${product.name}`} className="bg-muted">
        <CarouselContent className="ml-0">
          {product.shots.map((shot, i) => (
            <CarouselItem
              key={shot}
              className="pl-0"
              aria-label={`${i + 1} dari ${product.shots.length}`}
            >
              <div className="flex aspect-4/3 items-center justify-center">
                <div className="bg-background/60 size-32 rounded-2xl" />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="bg-card/80 absolute top-1/2 left-3 -translate-y-1/2 backdrop-blur-sm" />
        <CarouselNext className="bg-card/80 absolute top-1/2 right-3 -translate-y-1/2 backdrop-blur-sm" />
        <CarouselStatus />
      </Carousel>

      <CardContent className="flex flex-col gap-3 p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 flex-col gap-1">
            <span className="truncate font-bold">{product.name}</span>
            <span className="text-primary font-bold">{product.price}</span>
          </div>
          <FavouriteButton name={product.name} />
        </div>

        <Rating value={product.rating} count={product.reviews} size="sm" />

        <Button variant="secondary" className="w-fit">
          Ubah Produk
        </Button>
      </CardContent>
    </Card>
  );
}

export const Default: Story = {
  render: () => (
    <div className="w-80">
      <ProductCard product={WATCH} />
    </div>
  ),
};

/** The grid the Products page actually shows. */
export const Grid: Story = {
  render: () => (
    <div className="bg-surface grid gap-5 p-6 sm:grid-cols-2 xl:grid-cols-3">
      {PRODUCTS.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  ),
};
