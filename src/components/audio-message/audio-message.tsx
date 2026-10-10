import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";
import { Pause, Play } from "lucide-react";
import { cn } from "../../lib/cn";
import { formatAudioTime } from "./format-audio-time";
import {
  audioMessageButtonVariants,
  audioMessageRangeVariants,
  audioMessageThumbVariants,
  audioMessageTrackVariants,
  type AudioMessageVariants,
} from "./audio-message.variants";

export type AudioMessageProps = Omit<React.ComponentProps<"div">, "onError"> &
  AudioMessageVariants & {
    src: string;
    /** Wording for the controls. */
    labels?: { play?: string; pause?: string; seek?: string };
    /** The audio failed to load — let the caller swap in a download link. */
    onError?: React.ReactEventHandler<HTMLAudioElement>;
    /** Passed to the underlying `<audio>`, e.g. a test id. */
    audioProps?: React.ComponentProps<"audio">;
  };

/**
 * A voice note: play/pause, a seek slider and the time. Built for chat
 * bubbles, where the browser's native controls are too wide and cannot
 * follow the bubble's colours.
 *
 * The native `<audio>` stays in the DOM, uncontrolled and hidden, as the
 * source of truth. The slider is Radix's, so seeking works from the keyboard.
 * The time shows the duration until playback starts, then the position.
 */
export function AudioMessage({
  src,
  tone = "default",
  labels,
  onError,
  audioProps,
  className,
  ...props
}: AudioMessageProps) {
  const audio = React.useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = React.useState(false);
  const [position, setPosition] = React.useState(0);
  const [duration, setDuration] = React.useState(0);
  const known = Number.isFinite(duration) && duration > 0;

  const toggle = () => {
    const a = audio.current;
    if (!a) return;
    if (a.paused) void a.play();
    else a.pause();
  };

  return (
    <div
      data-slot="audio-message"
      data-state={playing ? "playing" : "paused"}
      className={cn("flex min-w-[220px] items-center gap-3", className)}
      {...props}
    >
      <button
        type="button"
        data-slot="audio-message-toggle"
        aria-label={playing ? (labels?.pause ?? "Jeda pesan suara") : (labels?.play ?? "Putar pesan suara")}
        className={audioMessageButtonVariants({ tone })}
        onClick={toggle}
      >
        {playing ? <Pause fill="currentColor" aria-hidden="true" /> : <Play fill="currentColor" aria-hidden="true" />}
      </button>
      <SliderPrimitive.Root
        data-slot="audio-message-seek"
        className="relative flex flex-1 touch-none items-center select-none"
        min={0}
        max={known ? duration : 1}
        step={0.1}
        value={[known ? Math.min(position, duration) : 0]}
        disabled={!known}
        onValueChange={([v]) => {
          if (audio.current && v !== undefined) audio.current.currentTime = v;
        }}
      >
        <SliderPrimitive.Track className={audioMessageTrackVariants({ tone })}>
          <SliderPrimitive.Range className={audioMessageRangeVariants({ tone })} />
        </SliderPrimitive.Track>
        {/* The thumb carries role="slider", so it carries the name too. */}
        <SliderPrimitive.Thumb
          aria-label={labels?.seek ?? "Posisi pesan suara"}
          aria-valuetext={formatAudioTime(position)}
          className={audioMessageThumbVariants({ tone })}
        />
      </SliderPrimitive.Root>
      <span data-slot="audio-message-time" className="shrink-0 text-xs tabular-nums">
        {formatAudioTime(playing || position > 0 ? position : duration)}
      </span>
      <audio
        ref={audio}
        src={src}
        preload="metadata"
        className="hidden"
        {...audioProps}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
        onDurationChange={(e) => setDuration(e.currentTarget.duration)}
        onTimeUpdate={(e) => setPosition(e.currentTarget.currentTime)}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => {
          setPlaying(false);
          setPosition(0);
        }}
        onError={onError}
      />
    </div>
  );
}
