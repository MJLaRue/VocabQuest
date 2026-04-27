<script lang="ts">
  import { TrendingUp, ChevronRight } from "lucide-svelte";
  import { push } from "svelte-spa-router";
  import Card from "$lib/components/ui/Card.svelte";
  import type { TestAttempt } from "$lib/api/test";

  export let attempts: TestAttempt[] = [];

  // SVG layout constants
  const W = 480;
  const H = 200;
  const PT = 30; // padding top
  const PB = 30; // padding bottom
  const PL = 44; // padding left (for Y-axis labels)
  const PR = 16; // padding right
  const CHART_W = W - PL - PR;
  const CHART_H = H - PT - PB;
  const Y_TICKS = [0, 25, 50, 75, 100];

  // Convert accuracy % to SVG Y coordinate
  function toY(acc: number): number {
    return PT + CHART_H - (acc / 100) * CHART_H;
  }

  // Convert data index to SVG X coordinate
  function toX(i: number, n: number): number {
    return n <= 1 ? PL + CHART_W / 2 : PL + (i / (n - 1)) * CHART_W;
  }

  // Sort DESC → take 20 most recent → reverse to ascending (left = oldest)
  $: chartData = attempts
    .filter(
      (a) => a.status === "completed" && a.results?.accuracy != null && a.completedAt
    )
    .sort(
      (a, b) =>
        new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime()
    )
    .slice(0, 20)
    .reverse();

  $: hasEnoughData = chartData.length >= 2;

  // Polyline points string
  $: linePoints = chartData
    .map((d, i) => `${toX(i, chartData.length)},${toY(d.results!.accuracy)}`)
    .join(" ");

  // Area polygon (close back along the bottom)
  $: areaPoints =
    chartData.length >= 2
      ? `${linePoints} ${toX(chartData.length - 1, chartData.length)},${PT + CHART_H} ${toX(0, chartData.length)},${PT + CHART_H}`
      : "";

  // X-axis date labels (up to 5 evenly spaced)
  $: xLabels = (() => {
    if (chartData.length === 0) return [];
    const n = chartData.length;
    const maxLabels = Math.min(5, n);
    const indices =
      maxLabels === 1
        ? [0]
        : Array.from({ length: maxLabels }, (_, i) =>
            Math.round((i / (maxLabels - 1)) * (n - 1))
          );
    return indices.map((idx) => ({
      x: toX(idx, n),
      label: new Date(chartData[idx].completedAt!).toLocaleDateString(
        undefined,
        { month: "short", day: "numeric" }
      ),
    }));
  })();

  $: lastCompletedAt = chartData.length > 0 ? chartData[chartData.length - 1].completedAt : null;
  $: daysSinceTest = lastCompletedAt
    ? Math.floor((Date.now() - new Date(lastCompletedAt).getTime()) / 86_400_000)
    : null;
  $: showInlineNudge = daysSinceTest !== null && daysSinceTest >= 3;

  // Tooltip state
  interface TooltipData {
    attempt: TestAttempt;
    screenX: number;
    screenY: number;
    flipLeft: boolean;
  }
  let tooltip: TooltipData | null = null;
  let svgEl: SVGSVGElement;
  let hideTimer: ReturnType<typeof setTimeout> | null = null;

  function showTooltip(
    e: MouseEvent | FocusEvent,
    attempt: TestAttempt,
    cx: number,
    cy: number
  ) {
    if (hideTimer) { clearTimeout(hideTimer); hideTimer = null; }
    if (!svgEl) return;
    const rect = svgEl.getBoundingClientRect();
    const scale = rect.width / W;
    tooltip = {
      attempt,
      screenX: cx * scale,
      screenY: cy * (rect.height / H),
      flipLeft: cx > W * 0.6,   // flip to left side for right-side dots
    };
  }

  function scheduleHide() {
    hideTimer = setTimeout(() => { tooltip = null; hideTimer = null; }, 180);
  }

  function cancelHide() {
    if (hideTimer) { clearTimeout(hideTimer); hideTimer = null; }
  }

  function formatDateTime(dateStr: string) {
    return new Date(dateStr).toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  }

  function formatMode(mode: string) {
    return mode.charAt(0).toUpperCase() + mode.slice(1);
  }
</script>

<Card>
  <div class="p-6 space-y-4">
    <div class="flex items-center justify-between">
      <h3
        class="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2"
      >
        <TrendingUp class="w-5 h-5 text-teal-600 dark:text-teal-400" />
        Test Score Trend
      </h3>
      <div class="flex items-center gap-3">
        {#if chartData.length > 0}
          <span class="text-sm text-gray-500 dark:text-gray-400">
            Last {chartData.length} test{chartData.length === 1 ? "" : "s"}
          </span>
        {/if}
        <button
          type="button"
          on:click={() => push("/test")}
          class="flex items-center gap-1 text-sm font-medium text-teal-600 dark:text-teal-400
                 hover:text-teal-700 dark:hover:text-teal-300 transition-colors"
        >
          View all
          <ChevronRight class="w-3.5 h-3.5" />
        </button>
      </div>
    </div>

    {#if chartData.length === 0}
      <!-- Empty state: no completed tests -->
      <div class="flex flex-col items-center justify-center py-10 text-center space-y-3">
        <span class="text-4xl" aria-hidden="true">🎯</span>
        <div>
          <p class="text-sm font-semibold text-gray-700 dark:text-gray-200">No tests yet</p>
          <p class="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-xs mx-auto">
            Tests lock in your learning and show where to focus. They also earn bonus XP!
          </p>
        </div>
        <button
          type="button"
          on:click={() => push('/test')}
          class="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition-colors"
        >
          Take a Test Now →
        </button>
      </div>
    {:else if chartData.length === 1}
      <!-- Not enough data for a line yet -->
      <div class="flex flex-col items-center justify-center py-10 text-center space-y-3">
        <TrendingUp class="w-10 h-10 opacity-40 text-gray-400 dark:text-gray-500" />
        <div>
          <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Only 1 test completed</p>
          <p class="text-xs mt-1 text-gray-400 dark:text-gray-500">Complete one more test to see your trend</p>
        </div>
        {#if showInlineNudge}
          <button
            type="button"
            on:click={() => push('/test')}
            class="text-sm font-semibold text-blue-500 hover:text-blue-400 transition-colors"
          >
            Take a Test →
          </button>
        {/if}
      </div>
    {:else}
      <!-- SVG Chart -->
      <div class="relative select-none">
        <svg
          bind:this={svgEl}
          viewBox="0 0 {W} {H}"
          class="w-full overflow-visible"
          aria-label="Test score trend chart"
          role="img"
        >
          <defs>
            <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#14b8a6" stop-opacity="0.25" />
              <stop offset="100%" stop-color="#14b8a6" stop-opacity="0.02" />
            </linearGradient>
          </defs>

          <!-- Y-axis gridlines and labels -->
          {#each Y_TICKS as tick}
            {@const y = toY(tick)}
            <line
              x1={PL}
              y1={y}
              x2={W - PR}
              y2={y}
              stroke="currentColor"
              stroke-width="0.5"
              class="text-gray-200 dark:text-slate-700"
            />
            <text
              x={PL - 6}
              y={y}
              text-anchor="end"
              dominant-baseline="middle"
              font-size="10"
              class="fill-gray-400 dark:fill-slate-500"
            >
              {tick}%
            </text>
          {/each}

          <!-- Area fill -->
          {#if areaPoints}
            <polygon
              points={areaPoints}
              fill="url(#trendGradient)"
            />
          {/if}

          <!-- Trend line -->
          <polyline
            points={linePoints}
            fill="none"
            stroke="#14b8a6"
            stroke-width="2"
            stroke-linejoin="round"
            stroke-linecap="round"
          />

          <!-- Data dots -->
          {#each chartData as d, i}
            {@const cx = toX(i, chartData.length)}
            {@const cy = toY(d.results?.accuracy ?? 0)}
            <circle
              {cx}
              {cy}
              r="4"
              fill="#14b8a6"
              stroke="white"
              stroke-width="1.5"
              class="cursor-pointer transition-all duration-150 hover:r-6"
              on:mouseenter={(e) => showTooltip(e, d, cx, cy)}
              on:mouseleave={scheduleHide}
              on:focus={(e) => showTooltip(e, d, cx, cy)}
              on:blur={scheduleHide}
              on:click={() => push(`/test/results/${d.id}`)}
              on:keydown={(e) => e.key === "Enter" && push(`/test/results/${d.id}`)}
              role="button"
              tabindex="0"
              aria-label="{d.results?.accuracy}% on {formatDateTime(d.completedAt ?? d.startedAt)} — click to view"
            />
          {/each}

          <!-- X-axis date labels -->
          {#each xLabels as { x, label }}
            <text
              {x}
              y={H - 4}
              text-anchor="middle"
              font-size="9"
              class="fill-gray-400 dark:fill-slate-500"
            >
              {label}
            </text>
          {/each}
        </svg>

        <!-- Tooltip -->
        {#if tooltip}
          {@const a = tooltip.attempt}
          {@const r = a.results}
          <div
            role="tooltip"
            class="absolute z-10 bg-white dark:bg-slate-800
                   border border-gray-200 dark:border-slate-600
                   rounded-xl shadow-lg p-3 w-52 text-xs"
            style="
              top: {Math.max(0, tooltip.screenY - 8)}px;
              left: {tooltip.flipLeft ? tooltip.screenX - 12 : tooltip.screenX + 12}px;
              transform: {tooltip.flipLeft ? 'translateX(-100%)' : 'none'};
            "
            on:mouseenter={cancelHide}
            on:mouseleave={scheduleHide}
          >
            <!-- Date -->
            <p class="font-semibold text-gray-700 dark:text-gray-200 mb-2">
              {formatDateTime(a.completedAt ?? a.startedAt)}
            </p>

            {#if r}
              <!-- Score row -->
              <div class="flex items-center justify-between mb-1">
                <span class="text-gray-500 dark:text-gray-400">Score</span>
                <span class="font-bold text-gray-900 dark:text-white">
                  {r.score}/{r.total}
                  <span class="text-teal-600 dark:text-teal-400 ml-1">{r.accuracy}%</span>
                </span>
              </div>

              <!-- XP row -->
              <div class="flex items-center justify-between mb-1">
                <span class="text-gray-500 dark:text-gray-400">XP Earned</span>
                <span class="font-semibold text-amber-600 dark:text-amber-400">+{r.xpEarned}</span>
              </div>

              <!-- Length bonus row -->
              {#if r.lengthBonus > 1}
                <div class="flex items-center justify-between mb-2">
                  <span class="text-gray-500 dark:text-gray-400">Length Bonus</span>
                  <span class="font-semibold text-indigo-600 dark:text-indigo-400">{r.lengthBonus.toFixed(2)}×</span>
                </div>
              {/if}

              <!-- Per-mode breakdown -->
              {#if r.byMode && Object.keys(r.byMode).length > 0}
                <div class="border-t border-gray-100 dark:border-slate-700 pt-2 mt-1 space-y-0.5">
                  {#each Object.entries(r.byMode) as [mode, stat]}
                    <div class="flex items-center justify-between">
                      <span class="text-gray-500 dark:text-gray-400 capitalize">{formatMode(mode)}</span>
                      <span class="text-gray-700 dark:text-gray-300">
                        {stat.correct}/{stat.total}
                        <span class="text-gray-400 dark:text-gray-500 ml-0.5">({stat.accuracy}%)</span>
                      </span>
                    </div>
                  {/each}
                </div>
              {/if}
            {/if}

            <!-- Navigation link -->
            <div class="border-t border-gray-100 dark:border-slate-700 pt-2 mt-2">
              <button
                type="button"
                on:click={() => push(`/test/results/${a.id}`)}
                class="w-full flex items-center justify-center gap-1 py-1 rounded-lg
                       text-teal-600 dark:text-teal-400 font-semibold
                       hover:bg-teal-50 dark:hover:bg-teal-900/20 transition-colors"
              >
                View full results
                <ChevronRight class="w-3 h-3" />
              </button>
            </div>
          </div>
        {/if}
      </div>
      {#if showInlineNudge}
        <p class="text-xs text-gray-500 dark:text-gray-400 flex items-center justify-between gap-2">
          <span>Keep your trend going — last test was {daysSinceTest} {daysSinceTest === 1 ? 'day' : 'days'} ago.</span>
          <button
            type="button"
            on:click={() => push('/test')}
            class="font-semibold text-blue-500 hover:text-blue-400 transition-colors whitespace-nowrap flex-shrink-0"
          >
            Take a Test →
          </button>
        </p>
      {/if}
    {/if}
  </div>
</Card>
