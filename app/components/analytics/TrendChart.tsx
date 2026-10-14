"use client";

import { useRef, useState } from "react";
import { useTheme } from "@/app/providers/ThemeProvider";
import { categoricalColor } from "./chart-colors";

export type TrendPoint = {
  label: string;
  values: number[];
};

function compact(n: number): string {
  if (Math.abs(n) >= 1_000_000) return `${(n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 1)}M`;
  if (Math.abs(n) >= 1_000) return `${(n / 1_000).toFixed(n % 1_000 === 0 ? 0 : 1)}K`;
  return String(Math.round(n));
}

const WIDTH = 720;
const HEIGHT = 260;
const PAD_LEFT = 48;
const PAD_RIGHT = 12;
const PAD_TOP = 16;
const PAD_BOTTOM = 28;
const PLOT_W = WIDTH - PAD_LEFT - PAD_RIGHT;
const PLOT_H = HEIGHT - PAD_TOP - PAD_BOTTOM;

/**
 * Monthly line/area chart, 1 or 2 series — a trend's job is "change over
 * time," so line (area for a single series) is the right default form per
 * the dataviz skill, not a bar. One series: brand-sequential color with a
 * ~10%-opacity area wash under the line (single-hue, the chart title already
 * names it, no legend box). Two series: the validated categorical slots 1-2,
 * clean lines (no area — overlapping washes get muddy for a comparison),
 * legend always shown. A crosshair + tooltip follows the pointer, per the
 * skill's interaction rule for line/area forms; the last point of each
 * series is also direct-labelled with its value.
 */
export function TrendChart({
  data,
  seriesNames,
  singleSeriesVar,
  surface = "dash",
  formatValue = compact,
}: {
  data: TrendPoint[];
  seriesNames: string[];
  /** CSS var name (e.g. "--brand") to use when there's exactly one series — brand-sequential, not categorical. */
  singleSeriesVar?: string;
  surface?: "dash" | "admin";
  formatValue?: (n: number) => string;
}) {
  const { theme } = useTheme();
  const svgRef = useRef<SVGSVGElement>(null);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const textVar = `var(--${surface}-text)`;
  const mutedVar = `var(--${surface}-muted)`;
  const borderVar = `var(--${surface}-border)`;
  const surfaceVar = `var(--${surface}-surface)`;

  const seriesCount = seriesNames.length;
  const colors =
    seriesCount <= 1 && singleSeriesVar
      ? [`var(${singleSeriesVar})`]
      : seriesNames.map((_, i) => categoricalColor(i, theme));

  if (data.length === 0) {
    return (
      <div className="flex h-60 items-center justify-center rounded-2xl border text-sm" style={{ borderColor: borderVar, color: mutedVar }}>
        No data for this range yet.
      </div>
    );
  }

  const max = Math.max(1, ...data.flatMap((d) => d.values));
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((f) => Math.round(max * f));
  const stepX = data.length > 1 ? PLOT_W / (data.length - 1) : 0;
  const xFor = (i: number) => PAD_LEFT + (data.length > 1 ? i * stepX : PLOT_W / 2);
  const yFor = (v: number) => PAD_TOP + PLOT_H - (max > 0 ? (v / max) * PLOT_H : 0);

  const seriesPaths = Array.from({ length: seriesCount }, (_, s) => {
    const points = data.map((d, i) => [xFor(i), yFor(d.values[s] ?? 0)] as const);
    const linePath = points.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x},${y}`).join(" ");
    const areaPath = `${linePath} L${points[points.length - 1][0]},${PAD_TOP + PLOT_H} L${points[0][0]},${PAD_TOP + PLOT_H} Z`;
    return { points, linePath, areaPath };
  });

  function handleMove(event: React.PointerEvent<SVGSVGElement>) {
    const svg = svgRef.current;
    if (!svg || data.length === 0) return;
    const rect = svg.getBoundingClientRect();
    const relX = ((event.clientX - rect.left) / rect.width) * WIDTH;
    const index = data.length > 1 ? Math.round((relX - PAD_LEFT) / stepX) : 0;
    setHoverIndex(Math.min(Math.max(index, 0), data.length - 1));
  }

  const hovered = hoverIndex != null ? data[hoverIndex] : null;

  return (
    <div>
      {seriesCount >= 2 && (
        <div className="mb-4 flex flex-wrap items-center gap-4 text-xs font-semibold" style={{ color: mutedVar }}>
          {seriesNames.map((name, i) => (
            <span key={name} className="flex items-center gap-1.5">
              <span className="h-0.5 w-4 rounded-full" style={{ background: colors[i] }} aria-hidden />
              {name}
            </span>
          ))}
        </div>
      )}

      <div className="relative">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          width="100%"
          height={HEIGHT}
          role="img"
          aria-label={`Trend chart: ${seriesNames.join(", ")} across ${data.length} months`}
          onPointerMove={handleMove}
          onPointerLeave={() => setHoverIndex(null)}
          className="overflow-visible"
        >
          {/* Gridlines + y-axis ticks. Keyed by index, not value: small/flat
              data (e.g. an all-zero range) rounds multiple fractions of max
              to the same integer, so the tick *value* can repeat even though
              each is still a distinct gridline position. */}
          {ticks.map((tick, tickIndex) => (
            <g key={tickIndex}>
              <line x1={PAD_LEFT} x2={WIDTH - PAD_RIGHT} y1={yFor(tick)} y2={yFor(tick)} stroke={borderVar} strokeWidth={1} />
              <text x={PAD_LEFT - 8} y={yFor(tick)} textAnchor="end" dominantBaseline="middle" fontSize={10} fill={mutedVar}>
                {compact(tick)}
              </text>
            </g>
          ))}

          {/* x-axis labels (sparing: first, last, and the hovered one) */}
          {data.map((point, i) => {
            const show = i === 0 || i === data.length - 1 || i === hoverIndex;
            if (!show) return null;
            return (
              <text key={point.label} x={xFor(i)} y={HEIGHT - 8} textAnchor={i === 0 ? "start" : i === data.length - 1 ? "end" : "middle"} fontSize={10} fontWeight={i === hoverIndex ? 700 : 500} fill={i === hoverIndex ? textVar : mutedVar}>
                {point.label}
              </text>
            );
          })}

          {/* Series: area (single series only) + line + end marker + endpoint label */}
          {seriesPaths.map((series, s) => (
            <g key={s}>
              {seriesCount === 1 && <path d={series.areaPath} fill={colors[s]} opacity={0.1} stroke="none" />}
              <path d={series.linePath} fill="none" stroke={colors[s]} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
              {series.points.map(([x, y], i) => {
                const isEnd = i === data.length - 1;
                const isHovered = i === hoverIndex;
                if (!isEnd && !isHovered) return null;
                return (
                  <circle key={i} cx={x} cy={y} r={isHovered ? 5 : 4} fill={colors[s]} stroke={surfaceVar} strokeWidth={2} />
                );
              })}
              {(() => {
                const last = data.length - 1;
                const [x, y] = series.points[last];
                const value = data[last].values[s] ?? 0;
                return (
                  <text x={x - 6} y={y - 10} textAnchor="end" fontSize={10} fontWeight={700} fill={textVar}>
                    {formatValue(value)}
                  </text>
                );
              })()}
            </g>
          ))}

          {/* Crosshair */}
          {hoverIndex != null && (
            <line x1={xFor(hoverIndex)} x2={xFor(hoverIndex)} y1={PAD_TOP} y2={PAD_TOP + PLOT_H} stroke={mutedVar} strokeWidth={1} strokeDasharray="3 3" />
          )}
        </svg>

        {hovered && hoverIndex != null && (
          <div
            className="pointer-events-none absolute top-0 rounded-lg px-3 py-2 text-xs shadow-md"
            style={{
              left: `${(xFor(hoverIndex) / WIDTH) * 100}%`,
              transform: hoverIndex > data.length / 2 ? "translateX(-100%)" : "translateX(0)",
              background: surfaceVar,
              border: `1px solid ${borderVar}`,
              color: textVar,
            }}
          >
            <p className="mb-1 font-bold">{hovered.label}</p>
            {seriesNames.map((name, s) => (
              <p key={name} className="flex items-center gap-2 whitespace-nowrap" style={{ color: mutedVar }}>
                <span className="h-2 w-2 rounded-full" style={{ background: colors[s] }} aria-hidden />
                {name}: <span className="font-semibold" style={{ color: textVar }}>{formatValue(hovered.values[s] ?? 0)}</span>
              </p>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
