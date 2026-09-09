import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  CarouselStatus,
} from "./carousel";
import { Card, CardContent } from "../card";

const meta: Meta<typeof Carousel> = {
  title: "Navigation/Carousel",
  component: Carousel,
  argTypes: {
    orientation: { control: "select", options: ["horizontal", "vertical"] },
  },
};
export default meta;

type Story = StoryObj<typeof Carousel>;

const PRODUCTS = [
  { name: "Beats Headphone 2026", price: "Rp1.335.000" },
  { name: "Apple Watch Series 9", price: "Rp6.499.000" },
  { name: "Galaxy Buds Pro", price: "Rp2.150.000" },
];

/** The Featured Product panel: arrows flanking one slide at a time. */
export const Default: Story = {
  render: () => (
    <div className="w-[22rem]">
      <Carousel aria-label="Produk unggulan">
        <div className="flex items-center gap-3">
          <CarouselPrevious />
          <CarouselContent className="ml-0">
            {PRODUCTS.map((p, i) => (
              <CarouselItem
                key={p.name}
                className="pl-0"
                aria-label={`${i + 1} dari ${PRODUCTS.length}`}
              >
                <div className="flex flex-col items-center gap-2 py-6 text-center">
                  <div className="bg-muted size-28 rounded-2xl" />
                  <span className="font-semibold">{p.name}</span>
                  <span className="text-primary text-sm font-medium">
                    {p.price}
                  </span>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselNext />
        </div>
        <CarouselStatus />
      </Carousel>
    </div>
  ),
};

/** Several slides visible at once — the track is a flex row, so a slide's
 *  basis decides how many fit. */
export const MultipleVisible: Story = {
  render: () => (
    <div className="w-[34rem]">
      <Carousel aria-label="Katalog produk" opts={{ align: "start" }}>
        <CarouselContent>
          {[...PRODUCTS, ...PRODUCTS].map((p, i) => (
            <CarouselItem key={i} className="basis-1/3">
              <Card>
                <CardContent className="flex flex-col items-center gap-2">
                  <div className="bg-muted size-16 rounded-xl" />
                  <span className="truncate text-xs font-medium">{p.name}</span>
                </CardContent>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
        <div className="mt-4 flex items-center justify-between">
          <CarouselStatus visuallyHidden={false} />
          <div className="flex gap-2">
            <CarouselPrevious />
            <CarouselNext />
          </div>
        </div>
      </Carousel>
    </div>
  ),
};

/** Arrow keys move the carousel; with `loop` the arrows never go disabled. */
export const Looping: Story = {
  render: () => (
    <div className="w-[22rem]">
      <Carousel aria-label="Produk unggulan" opts={{ loop: true }}>
        <CarouselContent>
          {PRODUCTS.map((p) => (
            <CarouselItem key={p.name}>
              <div className="bg-muted flex h-32 items-center justify-center rounded-xl font-medium">
                {p.name}
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <div className="mt-4 flex justify-center gap-2">
          <CarouselPrevious />
          <CarouselNext />
        </div>
        <CarouselStatus />
      </Carousel>
    </div>
  ),
};
