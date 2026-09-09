import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { ChatBubble, ChatBubbleList } from "./chat-bubble";

describe("<ChatBubbleList />", () => {
  // A conversation grows at the end. `log` is the role that tells assistive
  // tech to announce arrivals without dragging the reader back to the top.
  it("is a labelled polite log", () => {
    render(
      <ChatBubbleList aria-label="Percakapan dengan Minerva">
        <ChatBubble author="Minerva">halo</ChatBubble>
      </ChatBubbleList>,
    );
    const log = screen.getByRole("log", { name: "Percakapan dengan Minerva" });
    expect(log).toHaveAttribute("aria-live", "polite");
    expect(log).toHaveAttribute("aria-relevant", "additions");
  });
});

describe("<ChatBubble />", () => {
  it("renders its message", () => {
    render(<ChatBubble author="Minerva">Sampai jumpa besok</ChatBubble>);
    expect(screen.getByText("Sampai jumpa besok")).toBeInTheDocument();
  });

  // On screen the author is colour plus which side the bubble sits on. A
  // screen reader gets neither, and would otherwise hear an unattributed run
  // of sentences with no way to tell the speakers apart.
  it("always announces the author, even when not shown", () => {
    const { container } = render(<ChatBubble author="Minerva">halo</ChatBubble>);
    const name = container.querySelector('[data-slot="chat-bubble-author"]');
    expect(name).toHaveTextContent("Minerva");
    expect(name).toHaveClass("sr-only");
  });

  it("can show the author on screen", () => {
    const { container } = render(
      <ChatBubble author="Minerva" showAuthor>
        halo
      </ChatBubble>,
    );
    expect(
      container.querySelector('[data-slot="chat-bubble-author"]'),
    ).not.toHaveClass("sr-only");
  });

  it("defaults to incoming", () => {
    const { container } = render(<ChatBubble author="Minerva">halo</ChatBubble>);
    expect(container.firstChild).toHaveAttribute("data-side", "incoming");
  });

  it.each([
    ["incoming", "bg-muted"],
    ["outgoing", "bg-primary"],
  ] as const)("fills a %s bubble from the %s token", (side, fill) => {
    const { container } = render(
      <ChatBubble author="Moni" side={side}>
        halo
      </ChatBubble>,
    );
    expect(
      container.querySelector('[data-slot="chat-bubble-surface"]'),
    ).toHaveClass(fill);
  });

  // --primary-foreground on --primary is 4.66:1 — no headroom to dim against.
  // Incoming sits on --muted and can afford it.
  it("dims the timestamp only where contrast allows", () => {
    const { container: incoming } = render(
      <ChatBubble author="Minerva" time="18.30">halo</ChatBubble>,
    );
    expect(
      incoming.querySelector('[data-slot="chat-bubble-meta"]'),
    ).toHaveClass("text-muted-foreground");

    const { container: outgoing } = render(
      <ChatBubble author="Moni" side="outgoing" time="18.34">halo</ChatBubble>,
    );
    const meta = outgoing.querySelector('[data-slot="chat-bubble-meta"]');
    expect(meta).toHaveClass("text-primary-foreground");
    expect(meta).not.toHaveClass("text-muted-foreground");
  });

  it("omits the meta row when there is neither time nor actions", () => {
    const { container } = render(<ChatBubble author="Minerva">halo</ChatBubble>);
    expect(container.querySelector('[data-slot="chat-bubble-meta"]')).toBeNull();
  });

  it("hides the avatar from assistive tech", () => {
    const { container } = render(
      <ChatBubble author="Minerva" avatar={<span>MB</span>}>
        halo
      </ChatBubble>,
    );
    expect(
      container.querySelector('[data-slot="chat-bubble-avatar"]'),
    ).toHaveAttribute("aria-hidden", "true");
  });

  // An outgoing message is the reader's own; a portrait of themselves beside
  // every line is noise, and the source design leaves it out too.
  it("drops the avatar on an outgoing bubble", () => {
    const { container } = render(
      <ChatBubble author="Moni" side="outgoing" avatar={<span>MR</span>}>
        halo
      </ChatBubble>,
    );
    expect(container.querySelector('[data-slot="chat-bubble-avatar"]')).toBeNull();
  });

  it("renders an actions slot inside the bubble", () => {
    render(
      <ChatBubble author="Minerva" actions={<button type="button">Opsi</button>}>
        halo
      </ChatBubble>,
    );
    expect(screen.getByRole("button", { name: "Opsi" })).toBeInTheDocument();
  });
});
