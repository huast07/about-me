/* Season palettes for the sakura tree. The story runs through ONE cycle, each season covering a
   contiguous block of highlights; "bloom" is the final full-bloom spring at the crown.
   Spring is the young tree's first spring: mostly buds, a few early blossoms. */
const SEASON_CYCLE = ["spring", "summer", "autumn", "winter"];

const SEASONS = {
  spring: { label: "Spring", sky: ["#fbf1f0", "#f1e6e4"], foliage: "bud",
            colors: ["#f3a9bd", "#e98fa9", "#8fae6a"], fx: "petals" },
  summer: { label: "Summer", sky: ["#f4f1dc", "#e3ead0"], foliage: "leaf",
            colors: ["#5d8a46", "#77a356", "#46703a"], fx: "motes" },
  autumn: { label: "Autumn", sky: ["#f7ead9", "#efd9c0"], foliage: "leaf",
            colors: ["#d9773a", "#c2452f", "#e7a23f"], fx: "leaves" },
  winter: { label: "Winter", sky: ["#eef1f4", "#d6dee4"], foliage: "snow",
            colors: ["#ffffff", "#f3f6f8", "#e6edf1"], fx: "snow" },
  bloom:  { label: "Full bloom", sky: ["#fdf0f2", "#f6dfe5"], foliage: "blossom",
            colors: ["#f7b8c9", "#f09bb3", "#fde1e8"], fx: "petals" }
};
