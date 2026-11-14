/* =====================================================================
   CONTENT - edit this file only to change what the main page says.
   Highlights are listed oldest first. The tree grows one highlight per
   step and the seasons cycle spring > summer > autumn > winter as it grows.
   age: a number, or null while unknown (shows as "??" with a TBD marker).
   Every sentence below is placeholder copy until Sterling confirms it.
   ===================================================================== */
const SITE = {
  name: "Sterling Huang",
  linkedin: "https://www.linkedin.com/in/sterling-huang-20206b24b/",

  highlights: [
    { age: null, tag: "UTS", text: "Sterling started at University of Toronto Schools, and convinced a coat hanger it was an antenna." },
    { age: null, tag: "Science fair", text: "Sterling took his science fair project all the way to the Canada-Wide Science Fair." },
    { age: null, tag: "Chemistry", text: "Sterling sat the Canadian Chemistry Olympiad." },
    { age: null, tag: "ISEF", text: "Sterling was shortlisted for ISEF Team Canada." },
    { age: null, tag: "EngSci", text: "Sterling began Engineering Science at the University of Toronto." },
    { age: null, tag: "Research", text: "Sterling joined the Matter Lab as a researcher." },
    { age: null, tag: "FIFA", text: "Sterling volunteered with FIFA." },
    { age: null, tag: "Maplecrown", text: "Sterling started building Maplecrown." },
    { age: null, tag: "Denmark", text: "Sterling crossed the Atlantic for an exchange in Denmark." },
    { age: null, tag: "Thailand", text: "Sterling flew to Bangkok for a research exchange at KMUTT." }
  ],

  motto: {
    latin: "Velut Arbor Aevo",
    translation: "As a tree through the ages",
    note: "The University of Toronto motto, and still the plan."
  },

  /* Contact links shown under the finale. An empty value hides that link. */
  contact: {
    github: "https://github.com/huast07",
    email: "sterling.huang@mail.utoronto.ca"
  },

  /* Faded verses drawn vertically behind the tree. Lines are columns, read right to left.
     seal: characters cut into the red seal stamped under the author (white-on-red, read top to bottom). */
  verses: [
    { id: "haiku", lang: "ja", lines: ["世の中は", "三日見ぬ間の", "桜かな"], author: "大島蓼太", seal: "櫻" },
    /* Text confirmed by Sterling. Author attribution (李商隱) still to confirm. */
    { id: "poem", lang: "zh-Hant", title: "櫻桃花下",
      lines: ["流鶯舞蝶兩相欺", "不取花芳正結時", "他日未開今日謝", "嘉辰長短是參差"], author: "李商隱", seal: "如樹" }
  ],

  /* Background painting and soundtrack, with the attribution their licences require. */
  painting: {
    src: "assets/art/whispering-pines.webp",
    credit: "Tang Yin, Whispering Pines on a Mountain Path (Ming dynasty), National Palace Museum, Taipei. Public domain.",
    url: "https://commons.wikimedia.org/wiki/File:Tang_Yin_Whispering_Pines.jpg"
  },
  music: [
    { src: "assets/music/guqin-zuiyu-changwan.m4a", title: "醉漁唱晚 Evening Song of the Drunken Fisherman",
      url: "https://commons.wikimedia.org/wiki/File:Guqin-Zuiyu_Changwan.ogg" },
    { src: "assets/music/guqin-yangguan-sandie.m4a", title: "陽關三疊 Three Refrains on the Yang Pass",
      url: "https://commons.wikimedia.org/wiki/File:Guqin-Yangguan_Sandie.ogg" }
  ],
  musicCredit: { performer: "Charlie Huang", instrument: "guqin", license: "CC BY-SA 3.0", licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0/" },

  /* The branches the finale leads to. Each gets its own theme later. */
  paths: [
    { href: "research.html", title: "Research", blurb: "Matter Lab, KMUTT and the science fair years." },
    { href: "industry.html", title: "Industry Projects", blurb: "Sun Life, Maplecrown, BikeTO and more." },
    { href: "travels.html", title: "Travels", blurb: "Denmark, Thailand and seventeen more countries." },
    { href: "volunteering.html", title: "Volunteering", blurb: "FIFA, city events, farm life and advocacy." },
    { href: "military.html", title: "Military Service", blurb: "Canadian Armed Forces." },
    { href: "readings.html", title: "Readings and Blogs", blurb: "The weekly book club and things I write." }
  ]
};
