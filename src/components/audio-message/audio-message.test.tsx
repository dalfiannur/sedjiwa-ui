import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AudioMessage } from "./audio-message";
import { formatAudioTime } from "./format-audio-time";

function setDuration(audio: HTMLAudioElement, seconds: number) {
  Object.defineProperty(audio, "duration", { configurable: true, value: seconds });
  fireEvent.loadedMetadata(audio);
}

describe("<AudioMessage />", () => {
  it("plays and pauses the hidden audio element", async () => {
    const { container } = render(<AudioMessage src="/a.ogg" />);
    const audio = container.querySelector("audio")!;
    const play = vi.spyOn(audio, "play").mockImplementation(() => {
      fireEvent.play(audio);
      return Promise.resolve();
    });
    await userEvent.click(screen.getByRole("button", { name: "Putar pesan suara" }));
    expect(play).toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "Jeda pesan suara" })).toBeInTheDocument();
    expect(container.firstElementChild).toHaveAttribute("data-state", "playing");
  });

  it("shows the duration before playback and disables seeking until it is known", () => {
    const { container } = render(<AudioMessage src="/a.ogg" />);
    expect(screen.getByRole("slider", { name: "Posisi pesan suara" })).toHaveAttribute("data-disabled");
    setDuration(container.querySelector("audio")!, 75);
    expect(container.querySelector('[data-slot="audio-message-time"]')).toHaveTextContent("1:15");
    expect(screen.getByRole("slider")).not.toHaveAttribute("data-disabled");
  });

  it("reports load failures and forwards audioProps", () => {
    const onError = vi.fn();
    const { container } = render(<AudioMessage src="/x" onError={onError} audioProps={{ "data-test": "a" } as never} />);
    const audio = container.querySelector("audio")!;
    expect(audio).toHaveAttribute("data-test", "a");
    fireEvent.error(audio);
    expect(onError).toHaveBeenCalled();
  });

  it("takes custom labels", () => {
    render(<AudioMessage src="/a" labels={{ play: "Play voice note" }} />);
    expect(screen.getByRole("button", { name: "Play voice note" })).toBeInTheDocument();
  });
});

describe("formatAudioTime", () => {
  it("formats m:ss and survives non-finite input", () => {
    expect(formatAudioTime(0)).toBe("0:00");
    expect(formatAudioTime(9.9)).toBe("0:09");
    expect(formatAudioTime(125)).toBe("2:05");
    expect(formatAudioTime(Infinity)).toBe("0:00");
    expect(formatAudioTime(NaN)).toBe("0:00");
  });
});
