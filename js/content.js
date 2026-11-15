/* =====================================================================
   CONTENT - edit this file only to change what the main page says.
   Highlights are listed oldest first. The tree grows one highlight per
   step and the seasons cycle spring > summer > autumn > winter as it grows.
   age: a number, or null for a milestone with a custom heading.
   Main-page milestones supplied by Sterling; keep text verbatim.
   emphasis lists exact phrases to display in bold without changing the text.
   ===================================================================== */
const SITE = {
  name: "Sterling Huang",
  education: "UTS'25 and University of Toronto Engineering Science 2T9",
  linkedin: "https://www.linkedin.com/in/sterling-huang-20206b24b/",

  highlights: [
    { age: null, heading: "Roots in Toronto", tag: "Toronto", emphasis: ["Toronto", "North York"], text: "Sterling was born in Toronto and grew up in North York." },
    { age: 11, tag: "Leadership", emphasis: ["Principal's Award for Student Leadership"], text: "At age 11, Sterling was awarded the Principal's Award for Student Leadership in his graduating class." },
    { age: 15, tag: "Science Olympiad", emphasis: ["Junior Science Olympiad", "Alternate Member for Team Canada"], text: "At age 15, Sterling particated in the Junior Science Olympiad and become an Alternate Member for Team Canada." },
    { age: 16, tag: "Chemistry", emphasis: ["bronze medal", "Canadian Chemistry Olympiad", "National Training Camp"], text: "At age 16, Sterling won a bronze medal at the Canadian Chemistry Olympiad and qualified for the National Training Camp. It was around the same time that Sterling first began auditing university lectures at the University of Toronto." },
    { age: 16, tag: "Investing & Science", emphasis: ["Global Semifinalist", "Wharton Global High School Investing Competition", "ICDC", "Ontario DECA", "bronze medal", "Canada-Wide Science Fair"], text: "In the same year, Sterling led his team to qualify as a Global Semifinalist out of 1600 teams in the Wharton Global High School Investing Competition, qualified for ICDC at Ontario DECA, and won a bronze medal at the Canada-Wide Science Fair." },
    { age: 17, tag: "Service", emphasis: ["Canadian Armed Forces", "naval reservist", "Basic Military Qualification"], text: "At age 17, Sterling joined the Canadian Armed Forces as a naval reservist, committing to serve Canada before self. Sterling would complete Basic Military Qualification in the summer of 2025." },
    { age: 17, tag: "MILSET", emphasis: ["MILSET International Science Expo", "CBC", "Best Delegation Award"], text: "In the same year, Sterling was selected to represent Team Canada at the MILSET International Science Expo and was interviewed by CBC after receving the Best Delegation Award." },
    { age: 18, tag: "ISEF", emphasis: ["shortlist candidate", "Regeneron International Science and Engineering Fair"], text: "At age 18, Sterling was selected as a shortlist candidate to represent Team Canada for the Regeneron International Science and Engineering Fair." },
    { age: 18, tag: "World Series", emphasis: ["Canadian Flag", "Game 7 of the 2025 World Series"], text: "Later in the year, Sterling was selected to represent the Canadian Armed Forces in carrying the Canadian Flag at Game 7 of the 2025 World Series." },
    { age: 19, tag: "BikeTO & Research", emphasis: ["BikeTO", "MITACS Globalink Research Award", "Bangkok, Thailand"], text: "At age 19, Sterling published BikeTO to the App Store and was awarded a MITACS Globalink Research Award for a research exchange in Bangkok, Thailand." }
  ],

  motto: {
    latin: "Velut Arbor Aevo",
    translation: "As a tree through the ages",
    note: "Crescit occulto velut arbor aevo fama Marcelli.",
    citation: "Horace, Odes I.12, lines 45–46"
  },

  /* Contact links shown under the finale. An empty value hides that link. */
  contact: {
    github: "https://github.com/huast07",
    email: "sterling.huang@mail.utoronto.ca"
  },

  /* Faded verses drawn vertically behind the tree. Lines are columns, read right to left. */
  verses: [
    { id: "haiku", lang: "ja", lines: ["世の中は", "三日見ぬ間の", "桜かな"], author: "大島蓼太" },
    /* Text confirmed by Sterling. Author attribution (李商隱) still to confirm. */
    { id: "poem", lang: "zh-Hant", title: "櫻桃花下",
      lines: ["流鶯舞蝶兩相欺", "不取花芳正結時", "他日未開今日謝", "嘉辰長短是參差"], author: "李商隱" }
  ],

  /* The branches the finale leads to. Each gets its own theme later. */
  paths: [
    { href: "research.html", title: "Research", blurb: "Matter Lab, KMUTT and the science fair years." },
    { href: "industry.html", title: "Industry Projects", blurb: "Sun Life, Maplecrown, BikeTO and more." },
    { href: "travels.html", title: "Travels", blurb: "Denmark, Thailand and seventeen more countries." },
    { href: "volunteering.html", title: "Volunteering", blurb: "FIFA, city events, farm life and advocacy." },
    { href: "military.html", title: "Military Service", blurb: "Canadian Armed Forces." },
    { href: "readings.html", title: "Readings and Hobbies", blurb: "The weekly book club and things I write." }
  ]
};
