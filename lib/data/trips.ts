export type TripCategory =
  | "day_exploration"
  | "parents_event"
  | "trek"
  | "weekend_escape"
  | "post_midterm"
  | "post_endterm";

export type TripSource = "mystrip" | "sundarone";

export interface ItineraryTrack {
  name: string;
  tagline: string;
  highlights: string[];
}

export interface Trip {
  id: string;
  slug: string;
  title: string;
  shortTitle: string;
  destination: string;
  state: string;
  category: TripCategory;
  source: TripSource;
  startDate: string;
  endDate: string;
  departureTime?: string;
  returnTime?: string;
  basePrice: number;
  maxSlots: number;
  bookedSlots: number;
  difficulty: "Easy" | "Moderate" | "Hard";
  coverImage: string;
  shortDescription: string;
  longDescription: string;
  highlights: string[];
  tracks?: ItineraryTrack[];
  included: string[];
  excluded: string[];
  registrationOpen: boolean;
  inAppRegistration?: boolean; // if true, "Register Now" collects a form + UPI payment instead of linking to WhatsApp
  tag: string;
  tagColor: string;
  accentColor: string;
}

// ─────────────────────────────────────────────────────────────
// MYSTRIP CALENDAR — July to December 2026
// ─────────────────────────────────────────────────────────────

const MYSTRIP_TRIPS: Trip[] = [
  // 1. Hatni Kund Trek (Aug 22)
  {
    id: "hatni-kund-aug22",
    slug: "hatni-kund-trek",
    title: "Hatni Kund Trek",
    shortTitle: "Hatni Kund",
    destination: "Aravali Range, Jaipur",
    state: "Rajasthan",
    category: "trek",
    source: "mystrip",
    startDate: "2026-08-22",
    endDate: "2026-08-22",
    departureTime: "4:30 AM",
    returnTime: "12:00 PM",
    basePrice: 799,
    maxSlots: 35,
    bookedSlots: 0,
    difficulty: "Moderate",
    coverImage: "/trips/gallery-saan-forest-walk.jpg",
    shortDescription:
      "4:30 AM departure. Aravali sunrise over ancient waterholes. Back before noon. Your morning has never been this alive.",
    longDescription:
      "Hatni Kund is a hidden jewel in the Aravali ranges — ancient natural waterholes carved into rock, surrounded by forest that wakes up with you at dawn. MysTrip's first trek of the season.",
    highlights: [
      "4:30 AM departure — catch the Aravali dawn",
      "Ancient natural waterholes (Hatni Kund)",
      "Dense Aravali forest trail",
      "Summit by sunrise",
      "Back by noon — full day still ahead",
    ],
    included: ["Transport", "Trek guide", "First aid", "Energy snacks", "Trip photos"],
    excluded: ["Meals", "Personal water (bring 2L+)"],
    registrationOpen: true,
    tag: "TREK",
    tagColor: "#01574A",
    accentColor: "#01574A",
  },

  // 2. Pushkar Weekend Escape (Sep 4–5, Janmashtami)
  {
    id: "pushkar-sep4-5",
    slug: "pushkar-weekend-escape-janmashtami",
    title: "Pushkar Weekend Escape",
    shortTitle: "Pushkar",
    destination: "Pushkar",
    state: "Rajasthan",
    category: "weekend_escape",
    source: "mystrip",
    startDate: "2026-09-04",
    endDate: "2026-09-05",
    departureTime: "6:00 AM Saturday",
    returnTime: "9:00 PM Sunday",
    basePrice: 3499,
    maxSlots: 40,
    bookedSlots: 0,
    difficulty: "Easy",
    coverImage: "/trips/card-jaisalmer-local.jpg",
    shortDescription:
      "Pushkar during Janmashtami — a sacred lake, a camel bazaar, a 1,000-year-old temple, and a festival that takes over the entire town.",
    longDescription:
      "Pushkar during Janmashtami is something you can't plan for — it just happens to you. The ghats fill with devotees, midnight celebrations spill into the streets, and the town transforms. One night. Completely worth it.",
    highlights: [
      "Janmashtami celebrations at Pushkar ghats",
      "Brahma Temple — one of the few in the world",
      "Sunrise aarti at Pushkar Lake",
      "Camel bazaar walk",
      "Rooftop dinner with lake view",
      "Overnight stay",
    ],
    included: ["Transport", "1 night accommodation", "Welcome dinner", "Breakfast Day 2", "MysTrip host", "Trip photos"],
    excluded: ["Lunch Day 1", "Personal shopping"],
    registrationOpen: true,
    tag: "WEEKEND ESCAPE",
    tagColor: "#FFB001",
    accentColor: "#7c2d12",
  },

  // 3. Mount Sumel Trek (Sep 6)
  {
    id: "mount-sumel-sep6",
    slug: "mount-sumel-trek",
    title: "Mount Sumel Trek",
    shortTitle: "Mount Sumel",
    destination: "Aravali Range, Jaipur",
    state: "Rajasthan",
    category: "trek",
    source: "mystrip",
    startDate: "2026-09-06",
    endDate: "2026-09-06",
    departureTime: "4:30 AM",
    returnTime: "12:00 PM",
    basePrice: 899,
    maxSlots: 35,
    bookedSlots: 0,
    difficulty: "Moderate",
    coverImage: "/trips/card-mount-sumel-group.jpg",
    shortDescription:
      "One of the highest points in Jaipur's Aravali range. 4:30 AM start. Panoramic sunrise views across the Shekhawati plains.",
    longDescription:
      "Mount Sumel is MysTrip's second trek of the season — a notch harder than Hatni Kund, with a wider panoramic payoff. 360° views of Jaipur's outskirts and the Shekhawati plains beyond.",
    highlights: [
      "360° panoramic summit view",
      "Dense Aravali jungle trail",
      "Post-trek chai at the base",
    ],
    included: ["Transport", "Trek guide", "First aid", "Energy snacks", "Trip photos"],
    excluded: ["Meals", "Personal water (bring 2L+)"],
    registrationOpen: true,
    tag: "TREK",
    tagColor: "#01574A",
    accentColor: "#01574A",
  },

  // 4. Rishikesh + Mussoorie Post-Midterm (Sep 26–29)
  {
    id: "rishikesh-mussoorie-sep26-29",
    slug: "rishikesh-mussoorie-post-midterm",
    title: "Rishikesh · Mussoorie · Landour",
    shortTitle: "Uttarakhand",
    destination: "Rishikesh, Mussoorie, Landour, Dhanaulti",
    state: "Uttarakhand",
    category: "post_midterm",
    source: "mystrip",
    startDate: "2026-09-26",
    endDate: "2026-09-29",
    departureTime: "Evening Sep 26 (post-midterms)",
    returnTime: "Night Sep 29",
    basePrice: 8999,
    maxSlots: 45,
    bookedSlots: 0,
    difficulty: "Easy",
    coverImage: "/trips/card-saan-valley.jpg",
    shortDescription:
      "Mid-terms end September 25. By evening of September 26, you're on a bus to the mountains. 3 nights, 4 cities, zero stress.",
    longDescription:
      "Post-midterm trips exist for one reason: to remind you why you're here. We depart the next evening after mid-terms — Rishikesh by morning, Mussoorie the day after, then Landour's pine forests and Dhanaulti's silence before heading back.",
    highlights: [
      "Rishikesh — Ganga ghats, Laxman Jhula, café hopping",
      "Rafting on the Ganga (Shivpuri stretch)",
      "Mussoorie — Mall Road, Gun Hill, Kempty Falls",
      "Landour — Ruskin Bond's neighbourhood, Char Dukan cafés",
      "Dhanaulti — dense cedar forest, Eco Park",
    ],
    included: ["Sleeper bus (Jaipur ↔ Rishikesh)", "Local transport", "3 nights accommodation", "Daily breakfast", "Rafting", "MysTrip host", "Trip photos"],
    excluded: ["Lunch & dinner (paid separately)", "Personal adventure activities beyond rafting"],
    registrationOpen: true,
    tag: "POST-MIDTERM TRIP",
    tagColor: "#FF6016",
    accentColor: "#1e3a5f",
  },

  // 5. Ranthambore Safari — Weekend Escape (Oct 17–18)
  {
    id: "ranthambore-oct17-18",
    slug: "ranthambore-safari",
    title: "Ranthambore — Educational Safari",
    shortTitle: "Ranthambore",
    destination: "Ranthambore National Park",
    state: "Rajasthan",
    category: "weekend_escape",
    source: "mystrip",
    startDate: "2026-10-17",
    endDate: "2026-10-18",
    departureTime: "5:00 AM Saturday",
    returnTime: "Evening Sunday",
    basePrice: 4999,
    maxSlots: 20,
    bookedSlots: 0,
    difficulty: "Easy",
    coverImage: "/trips/card-raghunath-trail.jpg",
    shortDescription:
      "Ranthambore reopens after monsoon on October 1. We go in on Oct 17 — when the jungle is freshest. Morning safari, fort ruins, 1 night stay.",
    longDescription:
      "Ranthambore shuts every monsoon and reopens October 1. The first weeks of October are peak jungle — dense, watered, and wild. This is an educational safari with a naturalist guide. We learn to read the jungle, not just look for the tiger.",
    highlights: [
      "Morning safari (Zone 3 or 4 — best tiger territory)",
      "Naturalist-guided educational session",
      "Ranthambore Fort ruins (UNESCO World Heritage)",
      "1 night jungle stay",
      "Wildlife photography basics",
    ],
    included: ["Transport from Jaipur", "Safari gypsy booking", "Naturalist guide", "1 night accommodation", "Breakfast + 1 dinner", "Park entry fees", "Trip photos"],
    excluded: ["Lunch", "Personal gear", "Extra safaris"],
    registrationOpen: true,
    tag: "WEEKEND ESCAPE",
    tagColor: "#FFB001",
    accentColor: "#78350f",
  },

  // 6. Ban ki Ghati Trek (Oct 31)
  {
    id: "ban-ki-ghati-oct31",
    slug: "ban-ki-ghati-trek",
    title: "Ban ki Ghati Trek",
    shortTitle: "Ban ki Ghati",
    destination: "Aravali Range, Jaipur",
    state: "Rajasthan",
    category: "trek",
    source: "mystrip",
    startDate: "2026-10-31",
    endDate: "2026-10-31",
    departureTime: "4:30 AM",
    returnTime: "12:00 PM",
    basePrice: 899,
    maxSlots: 40,
    bookedSlots: 0,
    difficulty: "Moderate",
    coverImage: "/trips/gallery-banki-ridge-line.jpg",
    shortDescription:
      "Halloween morning in the Aravali jungle. Ancient rocky ravines, dense forest, and a summit that makes every early alarm worth it.",
    longDescription:
      "Ban ki Ghati — 'the forest ravine' — is MysTrip's favourite trek in Jaipur. The trail winds through dense Aravali scrub, past ancient rock formations, and up through a narrow gorge to a plateau summit with views across the city.",
    highlights: [
      "Through the ancient rocky ravine (the 'Ghati')",
      "Dense forest trail — real jungle feel",
      "Rocky plateau summit",
      "Oct 31 — Halloween in the Aravali",
    ],
    included: ["Transport", "Trek guide", "First aid", "Energy snacks", "Trip photos"],
    excluded: ["Meals", "Personal water (bring 2L+)"],
    registrationOpen: true,
    tag: "TREK",
    tagColor: "#01574A",
    accentColor: "#01574A",
  },

  // 7. Raghunath Fort Trek (Dec 3 AM)
  {
    id: "raghunath-fort-dec3",
    slug: "raghunath-fort-trek",
    title: "Raghunath Fort Trek",
    shortTitle: "Raghunath Fort",
    destination: "Aravali Range, Jaipur",
    state: "Rajasthan",
    category: "trek",
    source: "mystrip",
    startDate: "2026-12-03",
    endDate: "2026-12-03",
    departureTime: "4:30 AM",
    returnTime: "11:00 AM",
    basePrice: 799,
    maxSlots: 40,
    bookedSlots: 0,
    difficulty: "Moderate",
    coverImage: "/trips/card-raghunath-trail.jpg",
    shortDescription:
      "End-terms over. First breath of December air. Raghunath Fort at sunrise — and then that same evening, we leave for Jaisalmer.",
    longDescription:
      "End-term exams end December 2nd. At 4:30 AM on December 3rd, we're on the trail to Raghunath Fort. The winter air hits different in the Aravali. Post-trek, everyone boards the bus for Jaisalmer that same evening. This trek is the breath before the plunge.",
    highlights: [
      "Winter sunrise at Raghunath Fort ruins",
      "Historic fortification in Aravali hills",
      "First trek of the post-term season",
      "Same evening: depart for Jaisalmer (combo discount available)",
    ],
    included: ["Transport", "Trek guide", "First aid", "Snacks", "Trip photos"],
    excluded: ["Meals (post-trek breakfast on your own)", "Personal water"],
    registrationOpen: false,
    tag: "TREK",
    tagColor: "#01574A",
    accentColor: "#01574A",
  },

  // 8. Jaisalmer Post-Endterm (Dec 4–7)
  {
    id: "jaisalmer-dec4-7",
    slug: "jaisalmer-post-endterm",
    title: "Jaisalmer — The Desert Finale",
    shortTitle: "Jaisalmer",
    destination: "Jaisalmer",
    state: "Rajasthan",
    category: "post_endterm",
    source: "mystrip",
    startDate: "2026-12-04",
    endDate: "2026-12-07",
    departureTime: "Night Dec 3 (depart after Raghunath Trek)",
    returnTime: "Night Dec 7",
    basePrice: 10999,
    maxSlots: 50,
    bookedSlots: 0,
    difficulty: "Easy",
    coverImage: "/trips/card-jaisalmer-golden-hour.jpg",
    shortDescription:
      "4 days, 3 nights. The Golden City at the end of the semester. Dunes, forts, desert camps, and a sky full of stars you've never seen that clearly before.",
    longDescription:
      "End-terms end December 2nd. You've survived the semester. Now you go to the desert. Jaisalmer in December is as close to perfect as weather gets — crisp days, cold nights under stars, and a city that turns gold at every hour of sunlight.",
    highlights: [
      "Jaisalmer Fort — sunrise walk inside a living fort",
      "Sam Sand Dunes — camel trek + sunset",
      "Desert camp — bonfire, folk music, stargazing",
      "Patwon Ki Haveli and Gadsisar Lake",
      "Desert village cultural immersion",
      "Night drive through Thar under a full December sky",
    ],
    included: ["AC sleeper bus (Jaipur ↔ Jaisalmer)", "3 nights accommodation (2 hotel + 1 desert camp)", "Daily breakfast + 2 dinners", "Camel trek + jeep safari", "All entry tickets", "MysTrip host", "Trip photos & reels"],
    excluded: ["Lunch all days", "Personal shopping", "Additional activities"],
    registrationOpen: false,
    tag: "POST-ENDTERM TRIP",
    tagColor: "#FF6016",
    accentColor: "#b45309",
  },
];

// ─────────────────────────────────────────────────────────────
// SUNDARONE CALENDAR — July to December 2026
// ─────────────────────────────────────────────────────────────

const SUNDARONE_TRIPS: Trip[] = [
  // Parents' Networking Week (Jul 15–19) — multiple single-day options
  {
    id: "sundarone-parents-jul15-19",
    slug: "sundarone-parents-networking",
    title: "Parents' Networking Week",
    shortTitle: "Parents Week",
    destination: "Jaipur & Khatu Shyamji",
    state: "Rajasthan",
    category: "parents_event",
    source: "sundarone",
    startDate: "2026-07-15",
    endDate: "2026-07-19",
    departureTime: "7:00 AM (daily)",
    returnTime: "8:00 PM",
    basePrice: 999,
    maxSlots: 30,
    bookedSlots: 0,
    difficulty: "Easy",
    coverImage: "/trips/card-udaipur-couple.jpg",
    shortDescription:
      "For parents dropping their children at Sundarone Hostels. A day out together — Jaipur exploration or Khatu Shyamji darshan — so parents can meet, connect, and travel as a community.",
    longDescription:
      "When parents drop their children at a hostel for the first time, they leave a little anxious. This event is for them. A curated day out — either a cultural exploration of Jaipur or a spiritual visit to Khatu Shyamji — where parents of Sundarone residents can meet each other, travel together, and return knowing their child's community. Organised by MysTrip, exclusively for Sundarone parents.",
    highlights: [
      "Jaipur Exploration OR Khatu Shyamji Darshan (choose your day)",
      "Parents-only group experience",
      "Meet other Sundarone families",
      "Guided by MysTrip team",
      "Running daily Jul 15–19",
    ],
    tracks: [
      {
        name: "Jaipur Exploration",
        tagline: "See the city your child will call home",
        highlights: ["Amer Fort", "Hawa Mahal", "City Palace", "Old City food trail", "Johari Bazaar"],
      },
      {
        name: "Khatu Shyamji Darshan",
        tagline: "A blessed beginning to the academic year",
        highlights: ["Khatu Shyamji Temple (Sikar)", "Devotional morning aarti", "Prasad distribution", "Return by evening"],
      },
    ],
    included: ["AC transport", "Breakfast", "Entry fees / darshan arrangements", "MysTrip coordinator"],
    excluded: ["Personal shopping", "Lunch (on your own)"],
    registrationOpen: true,
    tag: "PARENTS EVENT",
    tagColor: "#FF7800",
    accentColor: "#FF7800",
  },

  // Sundarone Tribe — Sunrise to Skyline, Batch 1 (Sat Jul 25)
  {
    id: "sundarone-sunrise-skyline-jul25",
    slug: "sundarone-sunrise-to-skyline-jul-25",
    title: "Sunrise to Skyline",
    shortTitle: "Sunrise to Skyline B1",
    destination: "Jaipur",
    state: "Rajasthan",
    category: "day_exploration",
    source: "sundarone",
    startDate: "2026-07-25",
    endDate: "2026-07-25",
    departureTime: "4:30 AM",
    returnTime: "9:15 PM",
    basePrice: 1499,
    maxSlots: 20,
    bookedSlots: 0,
    difficulty: "Easy",
    coverImage: "/trips/card-raghunath-group.jpg",
    shortDescription:
      "A full day through Jaipur's forts — from a lakeside sunrise to a hilltop city skyline at night. Limited to 20 seats.",
    longDescription:
      "One day, three sunrises' worth of views, and a status update with the most loved travel tribe on campus. Sunrise at Jal Mahal, boating below Amer Fort, the Sheesh Mahal's mirrored halls, Jaigarh's giant cannon, and Jaipur lit up from Padao Nahargarh after dark.",
    highlights: [
      "Sunrise over Jal Mahal — the water palace at dawn",
      "Maota Lake boating below Amer Fort",
      "Amer Fort — Sheesh Mahal, courtyards & ramparts",
      "Panna Meena ka Kund stepwell",
      "Jaigarh Fort — home to the world's largest wheeled cannon",
      "Sunset at Padao Nahargarh — Jaipur's best sunset point",
      "Jaipur's skyline lit up at night",
    ],
    included: ["All monument entry tickets (Amer, Jaigarh, Nahargarh)", "Maota Lake boating & Padao Nahargarh entry", "Full transport from & back to MUJ", "On-ground Sundarone Tribe crew"],
    excluded: ["Meals (breakfast, lunch, snacks)", "Optional Nahargarh Wax Museum + Sheesh Mahal (~₹500, pay at venue)", "Personal shopping / souvenirs"],
    registrationOpen: true,
    inAppRegistration: true,
    tag: "SUNDARONE TRIBE",
    tagColor: "#FF7800",
    accentColor: "#FF7800",
  },

  // Sundarone Tribe — Sunrise to Skyline, Batch 2 (Sat Aug 1)
  {
    id: "sundarone-sunrise-skyline-aug1",
    slug: "sundarone-sunrise-to-skyline-aug-1",
    title: "Sunrise to Skyline",
    shortTitle: "Sunrise to Skyline B2",
    destination: "Jaipur",
    state: "Rajasthan",
    category: "day_exploration",
    source: "sundarone",
    startDate: "2026-08-01",
    endDate: "2026-08-01",
    departureTime: "4:30 AM",
    returnTime: "9:15 PM",
    basePrice: 1499,
    maxSlots: 20,
    bookedSlots: 0,
    difficulty: "Easy",
    coverImage: "/trips/card-raghunath-group.jpg",
    shortDescription:
      "A full day through Jaipur's forts — from a lakeside sunrise to a hilltop city skyline at night. Limited to 20 seats.",
    longDescription:
      "One day, three sunrises' worth of views, and a status update with the most loved travel tribe on campus. Sunrise at Jal Mahal, boating below Amer Fort, the Sheesh Mahal's mirrored halls, Jaigarh's giant cannon, and Jaipur lit up from Padao Nahargarh after dark.",
    highlights: [
      "Sunrise over Jal Mahal — the water palace at dawn",
      "Maota Lake boating below Amer Fort",
      "Amer Fort — Sheesh Mahal, courtyards & ramparts",
      "Panna Meena ka Kund stepwell",
      "Jaigarh Fort — home to the world's largest wheeled cannon",
      "Sunset at Padao Nahargarh — Jaipur's best sunset point",
      "Jaipur's skyline lit up at night",
    ],
    included: ["All monument entry tickets (Amer, Jaigarh, Nahargarh)", "Maota Lake boating & Padao Nahargarh entry", "Full transport from & back to MUJ", "On-ground Sundarone Tribe crew"],
    excluded: ["Meals (breakfast, lunch, snacks)", "Optional Nahargarh Wax Museum + Sheesh Mahal (~₹500, pay at venue)", "Personal shopping / souvenirs"],
    registrationOpen: true,
    tag: "SUNDARONE TRIBE",
    tagColor: "#FF7800",
    accentColor: "#FF7800",
  },

  // Sundarone Tribe — Sunrise to Skyline, Batch 3 (Sat Aug 8)
  {
    id: "sundarone-sunrise-skyline-aug8",
    slug: "sundarone-sunrise-to-skyline-aug-8",
    title: "Sunrise to Skyline",
    shortTitle: "Sunrise to Skyline B3",
    destination: "Jaipur",
    state: "Rajasthan",
    category: "day_exploration",
    source: "sundarone",
    startDate: "2026-08-08",
    endDate: "2026-08-08",
    departureTime: "4:30 AM",
    returnTime: "9:15 PM",
    basePrice: 1499,
    maxSlots: 20,
    bookedSlots: 0,
    difficulty: "Easy",
    coverImage: "/trips/card-raghunath-group.jpg",
    shortDescription:
      "A full day through Jaipur's forts — from a lakeside sunrise to a hilltop city skyline at night. Limited to 20 seats.",
    longDescription:
      "One day, three sunrises' worth of views, and a status update with the most loved travel tribe on campus. Sunrise at Jal Mahal, boating below Amer Fort, the Sheesh Mahal's mirrored halls, Jaigarh's giant cannon, and Jaipur lit up from Padao Nahargarh after dark.",
    highlights: [
      "Sunrise over Jal Mahal — the water palace at dawn",
      "Maota Lake boating below Amer Fort",
      "Amer Fort — Sheesh Mahal, courtyards & ramparts",
      "Panna Meena ka Kund stepwell",
      "Jaigarh Fort — home to the world's largest wheeled cannon",
      "Sunset at Padao Nahargarh — Jaipur's best sunset point",
      "Jaipur's skyline lit up at night",
    ],
    included: ["All monument entry tickets (Amer, Jaigarh, Nahargarh)", "Maota Lake boating & Padao Nahargarh entry", "Full transport from & back to MUJ", "On-ground Sundarone Tribe crew"],
    excluded: ["Meals (breakfast, lunch, snacks)", "Optional Nahargarh Wax Museum + Sheesh Mahal (~₹500, pay at venue)", "Personal shopping / souvenirs"],
    registrationOpen: true,
    tag: "SUNDARONE TRIBE",
    tagColor: "#FF7800",
    accentColor: "#FF7800",
  },

  // Sundarone Tribe — Secrets of the Pink City, Batch 1 (Sun Jul 26)
  {
    id: "sundarone-secrets-pinkcity-jul26",
    slug: "sundarone-secrets-of-pink-city-jul-26",
    title: "Secrets of the Pink City",
    shortTitle: "Secrets of Pink City B1",
    destination: "Jaipur",
    state: "Rajasthan",
    category: "day_exploration",
    source: "sundarone",
    startDate: "2026-07-26",
    endDate: "2026-07-26",
    departureTime: "4:30 AM",
    returnTime: "8:30 PM",
    basePrice: 1299,
    maxSlots: 20,
    bookedSlots: 0,
    difficulty: "Easy",
    coverImage: "/trips/card-raghunath-group.jpg",
    shortDescription:
      "The hidden temples and iconic landmarks most tourists never put in the same day. Limited to 20 seats.",
    longDescription:
      "The Jaipur spots most tourists never find — sunrise at a 500-year-old spring, a gate built for reels, and a temple inside the King's own palace. Galtaji, Patrika Gate, Jantar Mantar, City Palace, Hawa Mahal from the inside, Albert Hall, and Birla Mandir after dark.",
    highlights: [
      "Sunrise aarti at Galtaji Temple's natural springs",
      "Patrika Gate — Jaipur's most photographed arch",
      "Jantar Mantar — the world's largest stone sundial",
      "City Palace & Govind Dev Ji Temple",
      "Hawa Mahal — climb inside the Palace of Winds",
      "Albert Hall Museum",
      "Birla Mandir lit up at sunset",
    ],
    included: ["All monument entry tickets (Jantar Mantar, City Palace, Hawa Mahal, Albert Hall)", "Full transport from & back to MUJ", "On-ground Sundarone Tribe crew"],
    excluded: ["Meals (breakfast, lunch, snacks)", "Personal shopping / souvenirs"],
    registrationOpen: true,
    inAppRegistration: true,
    tag: "SUNDARONE TRIBE",
    tagColor: "#FF7800",
    accentColor: "#FF7800",
  },

  // Sundarone Tribe — Secrets of the Pink City, Batch 2 (Sun Aug 2)
  {
    id: "sundarone-secrets-pinkcity-aug2",
    slug: "sundarone-secrets-of-pink-city-aug-2",
    title: "Secrets of the Pink City",
    shortTitle: "Secrets of Pink City B2",
    destination: "Jaipur",
    state: "Rajasthan",
    category: "day_exploration",
    source: "sundarone",
    startDate: "2026-08-02",
    endDate: "2026-08-02",
    departureTime: "4:30 AM",
    returnTime: "8:30 PM",
    basePrice: 1299,
    maxSlots: 20,
    bookedSlots: 0,
    difficulty: "Easy",
    coverImage: "/trips/card-raghunath-group.jpg",
    shortDescription:
      "The hidden temples and iconic landmarks most tourists never put in the same day. Limited to 20 seats.",
    longDescription:
      "The Jaipur spots most tourists never find — sunrise at a 500-year-old spring, a gate built for reels, and a temple inside the King's own palace. Galtaji, Patrika Gate, Jantar Mantar, City Palace, Hawa Mahal from the inside, Albert Hall, and Birla Mandir after dark.",
    highlights: [
      "Sunrise aarti at Galtaji Temple's natural springs",
      "Patrika Gate — Jaipur's most photographed arch",
      "Jantar Mantar — the world's largest stone sundial",
      "City Palace & Govind Dev Ji Temple",
      "Hawa Mahal — climb inside the Palace of Winds",
      "Albert Hall Museum",
      "Birla Mandir lit up at sunset",
    ],
    included: ["All monument entry tickets (Jantar Mantar, City Palace, Hawa Mahal, Albert Hall)", "Full transport from & back to MUJ", "On-ground Sundarone Tribe crew"],
    excluded: ["Meals (breakfast, lunch, snacks)", "Personal shopping / souvenirs"],
    registrationOpen: true,
    tag: "SUNDARONE TRIBE",
    tagColor: "#FF7800",
    accentColor: "#FF7800",
  },

  // Sundarone Tribe — Secrets of the Pink City, Batch 3 (Sun Aug 9)
  {
    id: "sundarone-secrets-pinkcity-aug9",
    slug: "sundarone-secrets-of-pink-city-aug-9",
    title: "Secrets of the Pink City",
    shortTitle: "Secrets of Pink City B3",
    destination: "Jaipur",
    state: "Rajasthan",
    category: "day_exploration",
    source: "sundarone",
    startDate: "2026-08-09",
    endDate: "2026-08-09",
    departureTime: "4:30 AM",
    returnTime: "8:30 PM",
    basePrice: 1299,
    maxSlots: 20,
    bookedSlots: 0,
    difficulty: "Easy",
    coverImage: "/trips/card-raghunath-group.jpg",
    shortDescription:
      "The hidden temples and iconic landmarks most tourists never put in the same day. Limited to 20 seats.",
    longDescription:
      "The Jaipur spots most tourists never find — sunrise at a 500-year-old spring, a gate built for reels, and a temple inside the King's own palace. Galtaji, Patrika Gate, Jantar Mantar, City Palace, Hawa Mahal from the inside, Albert Hall, and Birla Mandir after dark.",
    highlights: [
      "Sunrise aarti at Galtaji Temple's natural springs",
      "Patrika Gate — Jaipur's most photographed arch",
      "Jantar Mantar — the world's largest stone sundial",
      "City Palace & Govind Dev Ji Temple",
      "Hawa Mahal — climb inside the Palace of Winds",
      "Albert Hall Museum",
      "Birla Mandir lit up at sunset",
    ],
    included: ["All monument entry tickets (Jantar Mantar, City Palace, Hawa Mahal, Albert Hall)", "Full transport from & back to MUJ", "On-ground Sundarone Tribe crew"],
    excluded: ["Meals (breakfast, lunch, snacks)", "Personal shopping / souvenirs"],
    registrationOpen: true,
    tag: "SUNDARONE TRIBE",
    tagColor: "#FF7800",
    accentColor: "#FF7800",
  },

  // Sundarone Tribe — Secrets of the Pink City, Batch 4 (Sun Aug 16)
  {
    id: "sundarone-secrets-pinkcity-aug16",
    slug: "sundarone-secrets-of-pink-city-aug-16",
    title: "Secrets of the Pink City",
    shortTitle: "Secrets of Pink City B4",
    destination: "Jaipur",
    state: "Rajasthan",
    category: "day_exploration",
    source: "sundarone",
    startDate: "2026-08-16",
    endDate: "2026-08-16",
    departureTime: "4:30 AM",
    returnTime: "8:30 PM",
    basePrice: 1299,
    maxSlots: 20,
    bookedSlots: 0,
    difficulty: "Easy",
    coverImage: "/trips/card-raghunath-group.jpg",
    shortDescription:
      "The hidden temples and iconic landmarks most tourists never put in the same day. Limited to 20 seats.",
    longDescription:
      "The Jaipur spots most tourists never find — sunrise at a 500-year-old spring, a gate built for reels, and a temple inside the King's own palace. Galtaji, Patrika Gate, Jantar Mantar, City Palace, Hawa Mahal from the inside, Albert Hall, and Birla Mandir after dark.",
    highlights: [
      "Sunrise aarti at Galtaji Temple's natural springs",
      "Patrika Gate — Jaipur's most photographed arch",
      "Jantar Mantar — the world's largest stone sundial",
      "City Palace & Govind Dev Ji Temple",
      "Hawa Mahal — climb inside the Palace of Winds",
      "Albert Hall Museum",
      "Birla Mandir lit up at sunset",
    ],
    included: ["All monument entry tickets (Jantar Mantar, City Palace, Hawa Mahal, Albert Hall)", "Full transport from & back to MUJ", "On-ground Sundarone Tribe crew"],
    excluded: ["Meals (breakfast, lunch, snacks)", "Personal shopping / souvenirs"],
    registrationOpen: true,
    tag: "SUNDARONE TRIBE",
    tagColor: "#FF7800",
    accentColor: "#FF7800",
  },

  // Sundarone Achrol Fort Trek (Aug 23)
  {
    id: "sundarone-achrol-aug23",
    slug: "sundarone-achrol-fort-trek",
    title: "Achrol Fort Trek",
    shortTitle: "Achrol Fort",
    destination: "Achrol, Jaipur",
    state: "Rajasthan",
    category: "trek",
    source: "sundarone",
    startDate: "2026-08-23",
    endDate: "2026-08-23",
    departureTime: "4:30 AM",
    returnTime: "12:00 PM",
    basePrice: 799,
    maxSlots: 35,
    bookedSlots: 0,
    difficulty: "Moderate",
    coverImage: "/trips/card-kedarkantha-sign.jpg",
    shortDescription:
      "Sundarone's first trek of the season. An 18th-century fort in the Aravali hills, approached through a forest trail at dawn. The kind of morning that resets everything.",
    longDescription:
      "Achrol Fort sits on a hill in the Aravali range north of Jaipur — an 18th-century fortification that most people drive past on the highway without knowing it's there. The trail approaches through dense scrub forest in the dark, and the fort reveals itself at sunrise. MysTrip's first trek for Sundarone residents.",
    highlights: [
      "18th-century Achrol Fort at sunrise",
      "Dense Aravali trail in pre-dawn darkness",
      "Historic fort walls and bastions",
      "Panoramic Jaipur view from the ramparts",
      "Sundarone's first group trek",
    ],
    included: ["Transport", "Trek guide", "First aid", "Energy snacks", "Trip photos"],
    excluded: ["Meals", "Personal water (bring 2L+)"],
    registrationOpen: true,
    tag: "SUNDARONE TRIBE",
    tagColor: "#FF7800",
    accentColor: "#FF7800",
  },

  // Sundarone Mount Abu (Aug 27–30, Raksha Bandhan long weekend)
  {
    id: "sundarone-mount-abu-aug27-30",
    slug: "sundarone-mount-abu-raksha-bandhan",
    title: "Mount Abu — Raksha Bandhan Escape",
    shortTitle: "Mount Abu",
    destination: "Mount Abu",
    state: "Rajasthan",
    category: "weekend_escape",
    source: "sundarone",
    startDate: "2026-08-27",
    endDate: "2026-08-30",
    departureTime: "Evening Aug 27",
    returnTime: "Night Aug 30",
    basePrice: 6499,
    maxSlots: 40,
    bookedSlots: 0,
    difficulty: "Easy",
    coverImage: "/trips/card-saan-valley-2.jpg",
    shortDescription:
      "Rajasthan's only hill station. 3 days, 2 nights on the Raksha Bandhan long weekend. Lakes, Dilwara Jain Temples, and the coolest air in the state.",
    longDescription:
      "Mount Abu sits at 1,220 metres in the Aravali range — the only hill station in Rajasthan and completely unlike any other part of the state. Green, cool, and dramatically beautiful. We go during the Raksha Bandhan long weekend when the air is crisp and the monsoon greenery is at its peak.",
    highlights: [
      "Nakki Lake — sunrise paddle boats",
      "Dilwara Jain Temples (11th century marble architecture)",
      "Guru Shikhar — highest peak in Aravali (1722m)",
      "Sunset Point — famous golden hour views",
      "Raksha Bandhan celebrations in the hills",
      "Mount Abu Wildlife Sanctuary",
    ],
    included: ["AC sleeper bus (Jaipur ↔ Mount Abu)", "2 nights accommodation", "Daily breakfast + 1 dinner", "Local sightseeing transport", "MysTrip host", "Trip photos"],
    excluded: ["Lunch all days", "Entry fees for some sites", "Personal activities"],
    registrationOpen: true,
    tag: "SUNDARONE TRIBE",
    tagColor: "#FF7800",
    accentColor: "#FF7800",
  },

  // Sundarone Twin Tower Trek (Sep 26)
  {
    id: "sundarone-twin-tower-sep26",
    slug: "sundarone-twin-tower-trek",
    title: "Twin Tower Trek",
    shortTitle: "Twin Tower",
    destination: "Aravali Range, Jaipur",
    state: "Rajasthan",
    category: "trek",
    source: "sundarone",
    startDate: "2026-09-26",
    endDate: "2026-09-26",
    departureTime: "4:30 AM",
    returnTime: "11:00 AM",
    basePrice: 799,
    maxSlots: 35,
    bookedSlots: 0,
    difficulty: "Moderate",
    coverImage: "/trips/gallery-kedarkantha-boots.jpg",
    shortDescription:
      "Sundarone's second trek — twin rocky peaks in the Aravali. Early morning Sep 26, while MysTrip departs for Rishikesh the same day.",
    longDescription:
      "The Twin Tower trek gets its name from the two distinctive rock formations at the summit — twin pillars that catch the first light of dawn. We go early, summit by sunrise, and are back before 11 AM. The same day, MysTrip's main batch leaves for Rishikesh. Two groups, two directions, same morning energy.",
    highlights: [
      "Twin rock pinnacles at the summit",
      "Pre-dawn Aravali trail",
      "Summit at sunrise — views across Jaipur",
      "Sundarone's second group trek",
    ],
    included: ["Transport", "Trek guide", "First aid", "Snacks", "Trip photos"],
    excluded: ["Meals", "Personal water (bring 2L+)"],
    registrationOpen: true,
    tag: "SUNDARONE TRIBE",
    tagColor: "#FF7800",
    accentColor: "#FF7800",
  },

  // Sundarone Udaipur Post-Midterm (Oct 2–5)
  {
    id: "sundarone-udaipur-oct2-5",
    slug: "sundarone-udaipur-post-midterm",
    title: "Udaipur — Post Midterm Escape",
    shortTitle: "Udaipur",
    destination: "Udaipur",
    state: "Rajasthan",
    category: "post_midterm",
    source: "sundarone",
    startDate: "2026-10-02",
    endDate: "2026-10-05",
    departureTime: "Evening Oct 2",
    returnTime: "Night Oct 5",
    basePrice: 7499,
    maxSlots: 45,
    bookedSlots: 0,
    difficulty: "Easy",
    coverImage: "/trips/card-udaipur-moments.jpg",
    shortDescription:
      "3 days, 2 nights in the City of Lakes — right after mid-terms end. Lake Pichola, City Palace, Fateh Sagar, and the most beautiful sunsets in Rajasthan.",
    longDescription:
      "Udaipur in October, right after mid-terms. The monsoon greenery is still here, the lakes are full, and the weather is beginning to turn perfect. We've been to Udaipur before with MysTrip — the City Palace group photo is one of our most iconic. Now it's Sundarone's turn.",
    highlights: [
      "City Palace — sunrise walk through the palace complex",
      "Lake Pichola boat ride",
      "Fateh Sagar Lake & Nehru Garden",
      "Sajjangarh (Monsoon Palace) at sunset",
      "Old City food walk — dal bati churma, kachori",
      "Jagdish Temple & Bagore Ki Haveli",
    ],
    included: ["AC sleeper bus (Jaipur ↔ Udaipur)", "2 nights accommodation", "Daily breakfast + 1 dinner", "City Palace entry", "Boat ride", "Local transport", "MysTrip host", "Trip photos"],
    excluded: ["Lunch all days", "Personal shopping", "Additional site entries"],
    registrationOpen: true,
    tag: "SUNDARONE TRIBE",
    tagColor: "#FF7800",
    accentColor: "#FF7800",
  },

  // Sundarone Ranthambore Safari (Oct 24–25)
  {
    id: "sundarone-ranthambore-oct24-25",
    slug: "sundarone-ranthambore-safari",
    title: "Ranthambore Safari — Sundarone",
    shortTitle: "Ranthambore",
    destination: "Ranthambore National Park",
    state: "Rajasthan",
    category: "weekend_escape",
    source: "sundarone",
    startDate: "2026-10-24",
    endDate: "2026-10-25",
    departureTime: "5:00 AM Saturday",
    returnTime: "Evening Sunday",
    basePrice: 4999,
    maxSlots: 20,
    bookedSlots: 0,
    difficulty: "Easy",
    coverImage: "/trips/card-raghunath-trail.jpg",
    shortDescription:
      "Educational safari in the world's best tiger reserve — exclusively for Sundarone residents. Morning safari, naturalist guide, 1 night jungle stay.",
    longDescription:
      "Same experience as MysTrip's Ranthambore Safari, but exclusively for Sundarone residents. October in Ranthambore means the jungle has had three months of monsoon growth — dense, wild, and spectacular. Naturalist-guided, educational, and unforgettable.",
    highlights: [
      "Morning tiger safari (Zones 3 or 4)",
      "Naturalist-guided educational session",
      "Ranthambore Fort ruins (UNESCO World Heritage)",
      "1 night jungle accommodation",
      "Wildlife photography basics",
    ],
    included: ["Transport", "Safari gypsy booking", "Naturalist guide", "1 night stay", "Breakfast + dinner", "Park entry", "Trip photos"],
    excluded: ["Lunch", "Extra safaris"],
    registrationOpen: true,
    tag: "SUNDARONE TRIBE",
    tagColor: "#FF7800",
    accentColor: "#FF7800",
  },

  // Sundarone Jaisalmer Post-Endterm (Dec 8–12)
  {
    id: "sundarone-jaisalmer-dec8-12",
    slug: "sundarone-jaisalmer-post-endterm",
    title: "Jaisalmer — Sundarone's Desert Finale",
    shortTitle: "Jaisalmer",
    destination: "Jaisalmer",
    state: "Rajasthan",
    category: "post_endterm",
    source: "sundarone",
    startDate: "2026-12-08",
    endDate: "2026-12-12",
    departureTime: "Night Dec 8",
    returnTime: "Night Dec 12",
    basePrice: 12999,
    maxSlots: 50,
    bookedSlots: 0,
    difficulty: "Easy",
    coverImage: "/trips/card-jaisalmer-golden-hour.jpg",
    shortDescription:
      "5 days, 4 nights in the Thar Desert. Sundarone's flagship end-of-semester trip. The Golden City at its most beautiful — cold December nights, desert camps, stars you've never seen so clearly.",
    longDescription:
      "MysTrip's flagship post-endterm trip for Sundarone residents — a full 5 days in Jaisalmer. We go deeper and slower than the MysTrip batch: more time in the dunes, a full day in the desert village, and a night at the fort. December Jaisalmer is spectacular.",
    highlights: [
      "Jaisalmer Fort — sunrise inside a living fort city",
      "Sam Sand Dunes — camel safari at sunset",
      "2 nights desert camp — bonfire, Rajasthani folk music, stargazing",
      "Desert village cultural immersion",
      "Patwon Ki Haveli, Gadsisar Lake, Bada Bagh",
      "Night drive through the Thar",
    ],
    included: ["AC sleeper bus (Jaipur ↔ Jaisalmer)", "4 nights accommodation (2 hotel + 2 desert camp)", "Daily breakfast + 3 dinners", "Camel trek + jeep safari", "All entry tickets", "MysTrip host", "Trip photos & reels"],
    excluded: ["Lunch all days", "Personal shopping"],
    registrationOpen: false,
    tag: "SUNDARONE TRIBE",
    tagColor: "#FF7800",
    accentColor: "#FF7800",
  },
];

// ─────────────────────────────────────────────────────────────
// COMBINED
// ─────────────────────────────────────────────────────────────

export const ALL_TRIPS: Trip[] = [...MYSTRIP_TRIPS, ...SUNDARONE_TRIPS];
export const MYSTRIP_ONLY = MYSTRIP_TRIPS;
export const SUNDARONE_ONLY = SUNDARONE_TRIPS;

// ── Category metadata ─────────────────────────────────────────

export const CATEGORY_META: Record<TripCategory, { label: string; description: string; icon: string }> = {
  parents_event: {
    label: "Parents' Events",
    description: "Exclusively for parents of Sundarone freshers. Networking + sightseeing.",
    icon: "🤝",
  },
  day_exploration: {
    label: "Day Explorations",
    description: "Full-day city & cultural experiences. Morning to evening.",
    icon: "🏛️",
  },
  trek: {
    label: "Treks",
    description: "4:30 AM early-morning Aravali treks. Back before noon.",
    icon: "⛰️",
  },
  weekend_escape: {
    label: "Weekend Escapes",
    description: "Depart Saturday, return Sunday or Monday. 1–3 night stays.",
    icon: "🌙",
  },
  post_midterm: {
    label: "Post-Midterm Trips",
    description: "Multi-night trips departing right after mid-term exams.",
    icon: "🏔️",
  },
  post_endterm: {
    label: "Post-Endterm Trips",
    description: "Flagship semester-end trips. The main event of the year.",
    icon: "🏜️",
  },
};

// ── Helpers ───────────────────────────────────────────────────

export function getUpcomingTrips(limit?: number, source?: TripSource): Trip[] {
  const today = new Date().toISOString().split("T")[0];
  const trips = (source ? ALL_TRIPS.filter((t) => t.source === source) : ALL_TRIPS)
    .filter((t) => t.startDate >= today)
    .sort((a, b) => a.startDate.localeCompare(b.startDate));
  return limit ? trips.slice(0, limit) : trips;
}

export function getTripBySlug(slug: string): Trip | undefined {
  return ALL_TRIPS.find((t) => t.slug === slug);
}

export function formatDateRange(startDate: string, endDate: string): string {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "short" };
  if (startDate === endDate) {
    return start.toLocaleDateString("en-IN", { ...opts, year: "numeric" });
  }
  return `${start.toLocaleDateString("en-IN", opts)} – ${end.toLocaleDateString("en-IN", { ...opts, year: "numeric" })}`;
}

export function daysUntil(date: string): number {
  const target = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

export function nightCount(startDate: string, endDate: string): number {
  const start = new Date(startDate);
  const end = new Date(endDate);
  return Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
}
