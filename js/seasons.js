/* Season palettes for the sakura tree. "bloom" is the final full-bloom spring at the crown. */
const SEASON_CYCLE = ["spring", "summer", "autumn", "winter"];

const SEASONS = {
  spring: { label: "Spring", sky: ["#fbf1f0", "#f1e6e4"], foliage: "blossom",
            colors: ["#f6c1cf", "#f3a9bd", "#fbd9e1"], fx: "petals" },
  summer: { label: "Summer", sky: ["#f4f1dc", "#e3ead0"], foliage: "leaf",
            colors: ["#5d8a46", "#77a356", "#46703a"], fx: "motes" },
  autumn: { label: "Autumn", sky: ["#f7ead9", "#efd9c0"], foliage: "leaf",
            colors: ["#d9773a", "#c2452f", "#e7a23f"], fx: "leaves" },
  winter: { label: "Winter", sky: ["#eef1f4", "#d6dee4"], foliage: "snow",
            colors: ["#ffffff", "#f3f6f8", "#e6edf1"], fx: "snow" },
  bloom:  { label: "Full bloom", sky: ["#fdf0f2", "#f6dfe5"], foliage: "blossom",
            colors: ["#f7b8c9", "#f09bb3", "#fde1e8"], fx: "petals" }
};
