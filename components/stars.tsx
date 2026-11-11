import { IconStar } from "@/components/icons";

export function Stars({ value }: { value: number }) {
  return (
    <div
      className="flex items-center gap-0.5"
      aria-label={`${value.toFixed(1)} out of 5 stars`}
    >
      {Array.from({ length: 5 }, (_, index) => {
        const fill = Math.min(1, Math.max(0, value - index));
        return (
          <span key={index} className="relative inline-block size-3.5">
            <IconStar className="size-3.5 text-[#e5ddd2]" />
            <span
              className="absolute inset-y-0 left-0 overflow-hidden"
              style={{ width: `${fill * 100}%` }}
            >
              <IconStar className="size-3.5 text-gold" />
            </span>
          </span>
        );
      })}
    </div>
  );
}
