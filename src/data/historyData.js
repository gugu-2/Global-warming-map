// Comprehensive Historical Database spanning 3000 BCE to 2026 CE

export const ERAS = [
  {
    id: 'bronze-age',
    name: 'Bronze Age & Dawn of Empires',
    start: -3000,
    end: -1200,
    themeColor: '#d97706',
    description: 'Emergence of writing, monumental architecture (Pyramids, Ziggurats), early river-valley city-states, and metallurgy.'
  },
  {
    id: 'classical-antiquity',
    name: 'Iron Age & Classical Antiquity',
    start: -1200,
    end: 500,
    themeColor: '#f43f5e',
    description: 'Rise of global philosophical traditions, the Silk Road, Pax Romana, Han Dynasty, Maurya Empire, and Achaemenid Persia.'
  },
  {
    id: 'middle-ages',
    name: 'Medieval & Golden Ages',
    start: 500,
    end: 1450,
    themeColor: '#10b981',
    description: 'Byzantine splendor, Islamic Golden Age, Tang & Song innovations (gunpowder, compass), Mongol expansion, and feudal realms.'
  },
  {
    id: 'early-modern',
    name: 'Age of Discovery & Gunpowder Empires',
    start: 1450,
    end: 1800,
    themeColor: '#a855f7',
    description: 'Global oceanic navigation, Renaissance, Ottoman & Mughal ascendance, Ming/Qing dynasties, and the Scientific Revolution.'
  },
  {
    id: 'industrial-age',
    name: 'Industrial Revolution & Empires',
    start: 1800,
    end: 1914,
    themeColor: '#eab308',
    description: 'Steam power, railways, telegraphs, global colonial empires, rapid urbanization, and emergence of constitutional republics.'
  },
  {
    id: 'contemporary',
    name: 'Modern & Contemporary Era',
    start: 1914,
    end: 2026,
    themeColor: '#38bdf8',
    description: 'Global conflicts, space exploration, atomic age, digital computing, decolonization, and planetary interconnectedness.'
  }
];

export const TIMELINE_PRESETS = [
  { year: -3000, label: '3000 BCE', title: 'Dawn of Civilization', desc: 'Sumerian Cuneiform & Early Dynastic Egypt' },
  { year: -2500, label: '2500 BCE', title: 'Pyramid Builders', desc: 'Old Kingdom Egypt & Indus Valley Flourishing' },
  { year: -500, label: '500 BCE', title: 'Axial Age', desc: 'Achaemenid Persia, Athens & Spring-Autumn China' },
  { year: 117, label: '117 CE', title: 'Peak Roman Empire', desc: 'Trajan expands Rome while Eastern Han rules China' },
  { year: 750, label: '750 CE', title: 'Islamic & Tang Peaks', desc: 'Abbasid Caliphate & Cosmopolitan Tang Chang\'an' },
  { year: 1250, label: '1250 CE', title: 'The Mongol Pax', desc: 'Genghis & Kublai Khan\'s empire unites Eurasia' },
  { year: 1500, label: '1500 CE', title: 'Age of Discovery', desc: 'Ottomans take Constantinople; Columbus & Da Gama' },
  { year: 1700, label: '1700 CE', title: 'Gunpowder Dynasties', desc: 'Mughals, Kangxi\'s Qing, and Peter the Great' },
  { year: 1900, label: '1900 CE', title: 'Peak Imperial Era', desc: 'British Empire, Belle Époque & Industrial Giants' },
  { year: 1945, label: '1945 CE', title: 'Post-War Dawn', desc: 'United Nations founded; Cold War superpowers' },
  { year: 2026, label: '2026 CE', title: 'Contemporary Planet', desc: 'Modern interconnected digital civilization' }
];

export const EMPIRES = [
  // --- ANCIENT BRONZE AGE ---
  {
    id: 'sumer-akkad',
    name: 'Akkadian & Sumerian Empires',
    civilization: 'Mesopotamian',
    color: '#f59e0b',
    startYear: -3000,
    endYear: -2100,
    capital: { name: 'Akkad / Ur', lat: 31.0, lng: 46.1 },
    ruler: 'Sargon the Great / Ur-Nammu',
    peakPopulation: '1.5 Million',
    area: '0.8 Million km²',
    description: 'Considered by historians to be the first empire in recorded history, uniting Sumerian and Semitic speakers under Sargon.',
    achievements: ['First standardized postal system', 'Cuneiform legal codes', 'Ziggurat architecture', 'Base-60 sexagesimal math'],
    center: [33.0, 44.0],
    territory: [
      [36.5, 41.0], [37.0, 44.0], [35.0, 48.0], [30.5, 48.5], [29.5, 46.0], [32.5, 40.5]
    ]
  },
  {
    id: 'egypt-old-new',
    name: 'Ancient Egypt (Old to New Kingdom)',
    civilization: 'Egyptian',
    color: '#eab308',
    startYear: -3100,
    endYear: -1070,
    capital: { name: 'Memphis / Thebes', lat: 29.8, lng: 31.2 },
    ruler: 'Khufu / Hatshepsut / Ramesses II',
    peakPopulation: '4.5 Million',
    area: '1.2 Million km²',
    description: 'Flourishing along the Nile River, Egypt achieved iconic architectural feats including the Great Pyramids and Valley of the Kings.',
    achievements: ['Great Pyramid of Giza', 'Hieroglyphic writing', 'Advanced papyrus paper', 'Solar 365-day calendar'],
    center: [27.0, 31.0],
    territory: [
      [31.5, 30.0], [32.0, 33.5], [28.0, 34.5], [22.0, 32.5], [20.0, 30.5], [25.0, 29.0], [30.0, 29.5]
    ]
  },
  {
    id: 'indus-valley',
    name: 'Indus Valley Civilization',
    civilization: 'Harappan',
    color: '#10b981',
    startYear: -2600,
    endYear: -1900,
    capital: { name: 'Mohenjo-daro & Harappa', lat: 27.3, lng: 68.1 },
    ruler: 'Priest-King / Civic Councils',
    peakPopulation: '5.0 Million',
    area: '1.3 Million km²',
    description: 'Renowned for advanced urban planning, grid layouts, sophisticated hydraulic drainage systems, and peaceful trade.',
    achievements: ['Standardized weights and measures', 'Covered sewage systems', 'Baked brick architecture', 'Dockyard at Lothal'],
    center: [26.0, 68.0],
    territory: [
      [33.0, 71.0], [31.5, 75.5], [24.0, 72.0], [21.5, 69.5], [24.5, 63.0], [28.5, 65.0]
    ]
  },
  {
    id: 'shang-zhou',
    name: 'Shang & Western Zhou Dynasties',
    civilization: 'Early Chinese',
    color: '#ef4444',
    startYear: -1600,
    endYear: -771,
    capital: { name: 'Yin (Anyang) / Haojing', lat: 36.1, lng: 114.3 },
    ruler: 'King Tang / King Wu of Zhou',
    peakPopulation: '13.5 Million',
    area: '1.5 Million km²',
    description: 'Introduced the Mandate of Heaven concept, master bronze metallurgy, oracle bone script, and established the Yellow River civilization core.',
    achievements: ['Oracle bone writing', 'Ritual bronze casting', 'Mandate of Heaven philosophy', 'Chariot warfare'],
    center: [34.5, 113.0],
    territory: [
      [38.5, 112.0], [37.5, 119.0], [32.0, 118.0], [31.0, 111.0], [34.0, 108.0], [37.0, 108.5]
    ]
  },

  // --- CLASSICAL ANTIQUITY ---
  {
    id: 'achaemenid-persia',
    name: 'Achaemenid Persian Empire',
    civilization: 'Persian',
    color: '#06b6d4',
    startYear: -550,
    endYear: -330,
    capital: { name: 'Persepolis / Susa', lat: 29.9, lng: 52.8 },
    ruler: 'Cyrus the Great & Darius I',
    peakPopulation: '35-50 Million',
    area: '5.5 Million km²',
    description: 'The largest empire the world had yet seen, spanning from the Balkans and Egypt across Iran to the borders of India.',
    achievements: ['Royal Road (2,500 km)', 'Cyrus Cylinder human rights declaration', 'Satrap provincial governance', 'Chahar Bagh gardens'],
    center: [32.0, 53.0],
    territory: [
      [42.0, 27.0], [42.0, 46.0], [44.0, 60.0], [36.0, 72.0], [25.0, 66.0], [25.0, 52.0], [28.0, 34.0], [36.0, 28.0]
    ]
  },
  {
    id: 'maurya-empire',
    name: 'Maurya Empire of India',
    civilization: 'Indian',
    color: '#ec4899',
    startYear: -322,
    endYear: -185,
    capital: { name: 'Pataliputra (Patna)', lat: 25.6, lng: 85.1 },
    ruler: 'Chandragupta & Ashoka the Great',
    peakPopulation: '50-60 Million',
    area: '5.0 Million km²',
    description: 'Unified the vast Indian subcontinent; famed for Emperor Ashoka\'s conversion to Buddhism and his nationwide edicts on stone pillars.',
    achievements: ['Lion Capital of Ashoka', 'Arthashastra treatise on statecraft', 'Spread of Buddhism across Asia', 'Grand Trunk Road origin'],
    center: [23.0, 79.0],
    territory: [
      [34.5, 70.0], [32.0, 77.0], [26.0, 89.0], [21.0, 86.0], [13.0, 77.5], [15.0, 73.5], [24.0, 69.0], [30.0, 67.0]
    ]
  },
  {
    id: 'roman-empire',
    name: 'Roman Republic & Empire',
    civilization: 'Roman',
    color: '#dc2626',
    startYear: -509,
    endYear: 476,
    capital: { name: 'Roma', lat: 41.9, lng: 12.5 },
    ruler: 'Julius Caesar / Augustus / Trajan',
    peakPopulation: '70 Million',
    area: '5.0 Million km²',
    description: 'Encircled the entire Mediterranean Sea ("Mare Nostrum"), leaving an enduring legacy of Roman law, Latin, engineering, and civic institutions.',
    achievements: ['Colosseum & Pantheon', '50,000+ miles of paved highways', 'Aqueducts & concrete dome engineering', 'Civil Law foundation'],
    center: [40.0, 15.0],
    territory: [
      [54.0, -3.0], [51.0, 7.0], [46.0, 15.0], [44.0, 28.0], [38.0, 36.0], [32.0, 35.0], [30.0, 31.0], [31.0, 15.0], [36.0, -5.0], [43.0, -8.0], [49.0, -1.0]
    ]
  },
  {
    id: 'han-dynasty',
    name: 'Han Dynasty of China',
    civilization: 'Chinese',
    color: '#b91c1c',
    startYear: -202,
    endYear: 220,
    capital: { name: 'Chang\'an (Xi\'an) / Luoyang', lat: 34.3, lng: 108.9 },
    ruler: 'Emperor Gaozu / Emperor Wu of Han',
    peakPopulation: '60 Million',
    area: '6.5 Million km²',
    description: 'Golden age of Chinese civilization. Established the Silk Road, adopted Confucianism as state ideology, and invented papermaking.',
    achievements: ['Invention of paper by Cai Lun', 'Inauguration of Silk Road trade', 'Civil Service Examination system', 'Seismoscope & wheelbarrow'],
    center: [34.0, 108.0],
    territory: [
      [42.0, 95.0], [43.0, 125.0], [38.0, 128.0], [28.0, 121.0], [21.0, 109.0], [23.0, 103.0], [32.0, 98.0], [39.0, 94.0]
    ]
  },

  // --- MEDIEVAL & GOLDEN AGES ---
  {
    id: 'byzantine-empire',
    name: 'Byzantine Empire (Eastern Rome)',
    civilization: 'Greco-Roman',
    color: '#8b5cf6',
    startYear: 330,
    endYear: 1453,
    capital: { name: 'Constantinople (Istanbul)', lat: 41.0, lng: 28.9 },
    ruler: 'Justinian I / Basil II / Constantine XI',
    peakPopulation: '26 Million',
    area: '3.5 Million km²',
    description: 'The Greek-speaking continuation of the Roman Empire through the Middle Ages; preserved classical knowledge and built the Hagia Sophia.',
    achievements: ['Hagia Sophia architectural marvel', 'Corpus Juris Civilis (Justinian Code)', 'Greek Fire defensive technology', 'Cyrillic alphabet dissemination'],
    center: [39.0, 28.0],
    territory: [
      [44.0, 22.0], [43.0, 29.0], [41.0, 39.0], [36.0, 36.0], [31.5, 34.5], [31.0, 27.0], [36.0, 14.0], [40.0, 17.0], [44.0, 18.0]
    ]
  },
  {
    id: 'tang-dynasty',
    name: 'Tang Dynasty of China',
    civilization: 'Chinese',
    color: '#c026d3',
    startYear: 618,
    endYear: 907,
    capital: { name: 'Chang\'an', lat: 34.3, lng: 108.9 },
    ruler: 'Emperor Taizong / Empress Wu Zetian',
    peakPopulation: '80 Million',
    area: '10.7 Million km²',
    description: 'Regarded as the pinnacle of imperial Chinese poetry, cosmopolitan culture, territorial expansion, and international trade along the Silk Road.',
    achievements: ['Woodblock printing', 'Poetry of Li Bai & Du Fu', 'Porcelain manufacturing boom', 'Tea culture standardization'],
    center: [35.0, 105.0],
    territory: [
      [48.0, 85.0], [45.0, 126.0], [30.0, 122.0], [21.0, 106.0], [26.0, 99.0], [35.0, 75.0], [44.0, 78.0]
    ]
  },
  {
    id: 'abbasid-caliphate',
    name: 'Abbasid Caliphate',
    civilization: 'Islamic',
    color: '#059669',
    startYear: 750,
    endYear: 1258,
    capital: { name: 'Baghdad (House of Wisdom)', lat: 33.3, lng: 44.4 },
    ruler: 'Harun al-Rashid / Al-Ma\'mun',
    peakPopulation: '50 Million',
    area: '11.1 Million km²',
    description: 'Led the Islamic Golden Age from Baghdad; translated classical texts and pioneered algebra, optics, medicine, and celestial cartography.',
    achievements: ['House of Wisdom (Bayt al-Hikma)', 'Algebra invented by Al-Khwarizmi', 'Canon of Medicine by Ibn Sina', 'Astrolabe advancements'],
    center: [30.0, 45.0],
    territory: [
      [36.0, -6.0], [33.0, 10.0], [30.0, 31.0], [37.0, 38.0], [40.0, 52.0], [38.0, 68.0], [26.0, 68.0], [22.0, 57.0], [15.0, 48.0], [23.0, 38.0], [30.0, 30.0]
    ]
  },
  {
    id: 'mongol-empire',
    name: 'Mongol Empire',
    civilization: 'Mongol',
    color: '#d97706',
    startYear: 1206,
    endYear: 1368,
    capital: { name: 'Karakorum / Khanbaliq (Beijing)', lat: 47.2, lng: 102.8 },
    ruler: 'Genghis Khan & Kublai Khan',
    peakPopulation: '110 Million',
    area: '24.0 Million km²',
    description: 'The largest contiguous land empire in human history, stretching from the Sea of Japan to the Danube River in Central Europe.',
    achievements: ['Yam courier relay network', 'Pax Mongolica Eurasian trade boom', 'Universal religious tolerance policy', 'Standardized silver currency'],
    center: [45.0, 85.0],
    territory: [
      [58.0, 35.0], [55.0, 60.0], [56.0, 110.0], [45.0, 130.0], [30.0, 120.0], [25.0, 105.0], [32.0, 75.0], [33.0, 45.0], [40.0, 35.0], [50.0, 24.0]
    ]
  },
  {
    id: 'mali-empire',
    name: 'Mali Empire',
    civilization: 'West African',
    color: '#ca8a04',
    startYear: 1235,
    endYear: 1670,
    capital: { name: 'Niani / Timbuktu', lat: 11.4, lng: -8.3 },
    ruler: 'Sundiata Keita / Mansa Musa',
    peakPopulation: '40 Million',
    area: '1.1 Million km²',
    description: 'Dominant West African trading empire renowned for its vast gold wealth, University of Sankore in Timbuktu, and Mansa Musa\'s legendary pilgrimage.',
    achievements: ['Mansa Musa: wealthiest historical figure', 'Sankore Madrasah scholarship', 'Kouroukan Fouga charter of rights', 'Trans-Saharan trade supremacy'],
    center: [15.0, -4.0],
    territory: [
      [20.0, -14.0], [19.0, 2.0], [13.0, 2.0], [9.0, -9.0], [12.0, -16.0]
    ]
  },

  // --- EARLY MODERN & GUNPOWDER ERA ---
  {
    id: 'ottoman-empire',
    name: 'Ottoman Empire',
    civilization: 'Ottoman Turkish',
    color: '#15803d',
    startYear: 1299,
    endYear: 1922,
    capital: { name: 'Kostantiniyye (Istanbul)', lat: 41.0, lng: 28.9 },
    ruler: 'Mehmed the Conqueror / Suleiman the Magnificent',
    peakPopulation: '35 Million',
    area: '5.2 Million km²',
    description: 'Spanned Southeast Europe, Western Asia, and North Africa at the crossroads of East and West for over six centuries.',
    achievements: ['Süleymaniye Mosque & Mimar Sinan', 'Millet system of communal law', 'Grand Bazaar trade nexus', 'Superior artillery & siege cannons'],
    center: [37.0, 32.0],
    territory: [
      [47.0, 18.0], [46.0, 35.0], [40.0, 48.0], [30.0, 47.0], [21.0, 39.0], [28.0, 31.0], [33.0, 12.0], [35.0, -2.0], [37.0, 22.0]
    ]
  },
  {
    id: 'mughal-empire',
    name: 'Mughal Empire of India',
    civilization: 'Indo-Islamic',
    color: '#0284c7',
    startYear: 1526,
    endYear: 1857,
    capital: { name: 'Agra / Delhi', lat: 27.2, lng: 78.0 },
    ruler: 'Akbar the Great / Shah Jahan / Aurangzeb',
    peakPopulation: '150 Million (25% of world)',
    area: '4.0 Million km²',
    description: 'Produced 25% of global GDP in the 17th century; renowned for exquisite architecture, religious syncretism under Akbar, and textile trade.',
    achievements: ['Taj Mahal monument of love', 'Sulh-i-kul policy of universal peace', 'Mughal miniature paintings', 'Global cotton & silk dominance'],
    center: [24.0, 78.0],
    territory: [
      [35.0, 68.0], [34.0, 76.0], [27.0, 92.0], [21.0, 87.0], [12.0, 78.0], [15.0, 74.0], [25.0, 68.0], [31.0, 64.0]
    ]
  },
  {
    id: 'qing-dynasty',
    name: 'Qing Dynasty of China',
    civilization: 'Manchu-Chinese',
    color: '#e11d48',
    startYear: 1644,
    endYear: 1912,
    capital: { name: 'Beijing (Forbidden City)', lat: 39.9, lng: 116.4 },
    ruler: 'Kangxi Emperor / Qianlong Emperor',
    peakPopulation: '430 Million (35% of world)',
    area: '14.7 Million km²',
    description: 'The final imperial dynasty of China; consolidated modern Chinese territorial boundaries including Tibet, Xinjiang, Taiwan, and Manchuria.',
    achievements: ['Complete Library of Four Treasuries', 'Vast encyclopedic dictionaries', 'Imperial Summer Palace', 'Porcelain and tea global trade'],
    center: [38.0, 105.0],
    territory: [
      [53.0, 120.0], [48.0, 133.0], [38.0, 125.0], [24.0, 122.0], [21.0, 110.0], [26.0, 98.0], [35.0, 78.0], [48.0, 85.0]
    ]
  },
  {
    id: 'spanish-empire',
    name: 'Spanish Empire',
    civilization: 'Spanish',
    color: '#b45309',
    startYear: 1492,
    endYear: 1898,
    capital: { name: 'Madrid', lat: 40.4, lng: -3.7 },
    ruler: 'Isabella I / Charles V / Philip II',
    peakPopulation: '68 Million',
    area: '13.7 Million km²',
    description: 'The first global empire "on which the sun never set", linking Europe, the Americas, and Asia via silver trade routes across the Atlantic and Pacific.',
    achievements: ['First global currency (Spanish Real de a Ocho)', 'Manila Galleon Pacific trade route', 'Golden Age of arts (Cervantes, Velázquez)', 'Transatlantic exchanges'],
    center: [20.0, -50.0],
    territory: [
      // Americas and Iberia zones
      [43.0, -8.0], [43.0, 2.0], [36.0, -6.0], [36.0, -8.0],
      [30.0, -105.0], [20.0, -98.0], [5.0, -75.0], [-15.0, -72.0], [-35.0, -65.0], [-20.0, -45.0], [10.0, -65.0]
    ]
  },
  {
    id: 'british-empire',
    name: 'British Empire',
    civilization: 'British',
    color: '#e11d48',
    startYear: 1583,
    endYear: 1997,
    capital: { name: 'London', lat: 51.5, lng: -0.1 },
    ruler: 'Queen Victoria / Winston Churchill',
    peakPopulation: '458 Million (1/4 of world)',
    area: '35.5 Million km²',
    description: 'The largest empire in world history, ruling over 24% of the Earth\'s total land area and establishing English as the global lingua franca.',
    achievements: ['Industrial Revolution leadership', 'Global submarine telegraph network', 'Parliamentary democracy model', 'Worldwide maritime navigation'],
    center: [51.0, 0.0],
    territory: [
      [58.0, -4.0], [52.0, 2.0], [50.0, -5.0],
      [55.0, -100.0], [25.0, 80.0], [-25.0, 135.0], [5.0, 30.0], [-20.0, 25.0]
    ]
  },

  // --- MODERN & CONTEMPORARY ERA ---
  {
    id: 'modern-global-order',
    name: 'United Nations & Modern Nations',
    civilization: 'Global Community',
    color: '#38bdf8',
    startYear: 1945,
    endYear: 2026,
    capital: { name: 'Geneva / New York (UN)', lat: 40.7, lng: -73.9 },
    ruler: 'Sovereign Nation-States & UN',
    peakPopulation: '8.2 Billion',
    area: '148.9 Million km² (Global)',
    description: 'Modern interconnected global society characterized by international law, satellite telecommunications, internet, and planetary space travel.',
    achievements: ['Universal Declaration of Human Rights', 'Moon Landing & Mars Rovers', 'The Global Internet & AI', 'Eradication of Smallpox'],
    center: [20.0, 0.0],
    territory: [
      [70.0, -160.0], [70.0, 170.0], [-55.0, 170.0], [-55.0, -160.0]
    ]
  }
];

export const HISTORICAL_EVENTS = [
  {
    id: 'giza-pyramids',
    year: -2560,
    title: 'Great Pyramid of Giza Built',
    location: 'Giza, Egypt',
    coords: [29.9792, 31.1342],
    category: 'Monument',
    desc: 'Pharaoh Khufu commissions the Great Pyramid, the oldest and only surviving Wonder of the Ancient World, standing as Earth\'s tallest structure for over 3,800 years.'
  },
  {
    id: 'code-hammurabi',
    year: -1754,
    title: 'Code of Hammurabi Inscribed',
    location: 'Babylon, Mesopotamia',
    coords: [32.5363, 44.4208],
    category: 'Law & Governance',
    desc: 'King Hammurabi of Babylon promulgates 282 legal edicts engraved on a basalt stele, establishing the enduring legal principle of \'an eye for an eye\'.'
  },
  {
    id: 'battle-marathon',
    year: -490,
    title: 'Battle of Marathon',
    location: 'Marathon, Greece',
    coords: [38.1522, 23.9619],
    category: 'Battle',
    desc: 'Athenian hoplites defeat the invading Persian forces of Darius I, saving Greek democracy and inspiring the modern marathon running distance.'
  },
  {
    id: 'alexander-empire',
    year: -326,
    title: 'Alexander Reaches the Indus',
    location: 'Hydaspes (Jhelum River), India/Pakistan',
    coords: [32.9333, 73.7333],
    category: 'Conquest',
    desc: 'Alexander the Great defeats King Porus in his easternmost campaign before his troops persuade him to turn back, creating a fusion of Hellenistic and Asian cultures.'
  },
  {
    id: 'terracotta-army',
    year: -210,
    title: 'First Emperor Qin & Terracotta Army',
    location: 'Xi\'an, China',
    coords: [34.3841, 109.2785],
    category: 'Monument',
    desc: 'Qin Shi Huang unifies China, standardizes weights, currency, and script, and is buried with an underground army of over 8,000 unique life-sized terracotta soldiers.'
  },
  {
    id: 'silk-road-opens',
    year: -130,
    title: 'Silk Road Officially Established',
    location: 'Chang\'an to Antioch',
    coords: [34.3416, 108.9398],
    category: 'Trade',
    desc: 'Han envoy Zhang Qian returns from Central Asia, opening the 6,400 km trade network that moved silk, spices, glassware, and philosophies across Afro-Eurasia.'
  },
  {
    id: 'vesuvius-pompeii',
    year: 79,
    title: 'Eruption of Mount Vesuvius',
    location: 'Pompeii, Roman Empire',
    coords: [40.8224, 14.4289],
    category: 'Disaster',
    desc: 'Mount Vesuvius erupts catastrophically, burying the Roman resort cities of Pompeii and Herculaneum under meters of volcanic ash, preserving them for archaeology.'
  },
  {
    id: 'hagia-sophia',
    year: 537,
    title: 'Consecration of Hagia Sophia',
    location: 'Constantinople, Byzantine Empire',
    coords: [41.0086, 28.9802],
    category: 'Architecture',
    desc: 'Emperor Justinian opens the cathedral with its colossal suspended dome, proclaiming: \'Solomon, I have surpassed thee!\''
  },
  {
    id: 'house-of-wisdom',
    year: 830,
    title: 'House of Wisdom at Its Height',
    location: 'Baghdad, Abbasid Caliphate',
    coords: [33.3152, 44.3661],
    category: 'Science',
    desc: 'Scholars of all faiths gather in Baghdad to translate global manuscripts, invent algebra, catalog stars, and advance clinical optics.'
  },
  {
    id: 'viking-vinland',
    year: 1000,
    title: 'Leif Erikson Reaches North America',
    location: 'L\'Anse aux Meadows, Canada',
    coords: [51.5956, -55.5342],
    category: 'Exploration',
    desc: 'Norse explorer Leif Erikson establishes the first known European settlement in the Americas in Newfoundland, nearly 500 years before Columbus.'
  },
  {
    id: 'fall-constantinople',
    year: 1453,
    title: 'Fall of Constantinople',
    location: 'Constantinople (Istanbul)',
    coords: [41.0151, 28.9795],
    category: 'Siege',
    desc: 'Ottoman Sultan Mehmed II breaches the ancient Theodosian Walls with super-cannons, ending the Byzantine Empire and triggering the European Renaissance.'
  },
  {
    id: 'columbus-americas',
    year: 1492,
    title: 'Columbus Encounters the Americas',
    location: 'Guanahani, Bahamas',
    coords: [24.1147, -74.4608],
    category: 'Exploration',
    desc: 'Christopher Columbus reaches the Caribbean, inaugurating the Columbian Exchange that permanently interconnected the Old and New Worlds.'
  },
  {
    id: 'taj-mahal',
    year: 1648,
    title: 'Completion of the Taj Mahal',
    location: 'Agra, Mughal Empire',
    coords: [27.1751, 78.0421],
    category: 'Monument',
    desc: 'Mughal Emperor Shah Jahan completes the white marble mausoleum for his beloved wife Mumtaz Mahal, a masterpiece of symmetrical Islamic architecture.'
  },
  {
    id: 'industrial-steam',
    year: 1781,
    title: 'James Watt Patents Rotary Steam Engine',
    location: 'Birmingham, Great Britain',
    coords: [52.4862, -1.8904],
    category: 'Invention',
    desc: 'Watt\'s double-acting steam engine mechanizes factories, ships, and trains, unleashing the Industrial Revolution that transformed human civilization.'
  },
  {
    id: 'waterloo',
    year: 1815,
    title: 'Battle of Waterloo',
    location: 'Waterloo, Belgium',
    coords: [50.6800, 4.4100],
    category: 'Battle',
    desc: 'The Duke of Wellington and Blücher defeat Napoleon Bonaparte, ending the Napoleonic Wars and reshaping European borders for a century.'
  },
  {
    id: 'moon-landing',
    year: 1969,
    title: 'Apollo 11 Lands on the Moon',
    location: 'Sea of Tranquility / Houston Mission Control',
    coords: [29.5593, -95.0900],
    category: 'Space Exploration',
    desc: 'Neil Armstrong and Buzz Aldrin become the first humans to walk on another celestial body: \'That\'s one small step for man, one giant leap for mankind.\''
  },
  {
    id: 'world-wide-web',
    year: 1991,
    title: 'World Wide Web Released to the Public',
    location: 'CERN, Geneva, Switzerland',
    coords: [46.2330, 6.0557],
    category: 'Technology',
    desc: 'Tim Berners-Lee creates HTTP, HTML, and URLs at CERN, releasing the web for free and sparking the modern digital age.'
  },
  {
    id: 'contemporary-ai',
    year: 2026,
    title: 'Planetary Intelligence & Quantum Dawn',
    location: 'Global Grid',
    coords: [37.7749, -122.4194],
    category: 'AI & Future',
    desc: 'Humanity operates across interconnected artificial intelligence, renewable energy transitions, and commercial lunar / orbital outposts.'
  }
];

export const HISTORIC_TRADE_ROUTES = [
  {
    id: 'overland-silk-road',
    name: 'Overland Silk Road',
    color: '#f59e0b',
    activeStart: -130,
    activeEnd: 1453,
    waypoints: [
      [34.34, 108.93], // Chang'an
      [36.06, 103.83], // Lanzhou
      [40.14, 94.66],  // Dunhuang
      [41.72, 82.96],  // Turpan
      [39.46, 75.99],  // Kashgar
      [39.65, 66.97],  // Samarkand
      [36.31, 59.56],  // Nishapur
      [35.68, 51.38],  // Rayy (Tehran)
      [33.31, 44.36],  // Baghdad
      [36.20, 37.16],  // Aleppo
      [41.00, 28.97]   // Constantinople
    ]
  },
  {
    id: 'maritime-silk-road',
    name: 'Maritime Spice Route',
    color: '#06b6d4',
    activeStart: -100,
    activeEnd: 1700,
    waypoints: [
      [23.12, 113.26], // Guangzhou
      [10.77, 106.69], // Oc Eo / Mekong
      [2.20, 102.25],  // Malacca
      [6.92, 79.86],   // Colombo
      [11.25, 75.78],  // Calicut
      [23.61, 58.59],  // Muscat
      [12.79, 45.03],  // Aden
      [27.87, 34.29],  // Red Sea / Sinai
      [31.20, 29.91]   // Alexandria
    ]
  },
  {
    id: 'trans-saharan',
    name: 'Trans-Saharan Gold & Salt Route',
    color: '#eab308',
    activeStart: 700,
    activeEnd: 1600,
    waypoints: [
      [16.76, -3.00],  // Timbuktu
      [16.27, -0.04],  // Gao
      [20.55, 4.38],   // Taghaza (Salt mines)
      [27.87, 0.28],   // Sijilmasa / Oasis
      [31.62, -7.98],  // Marrakech
      [36.80, 10.18]   // Tunis / Tripoli
    ]
  },
  {
    id: 'spanish-treasure-fleet',
    name: 'Spanish Manila & Atlantic Galleons',
    color: '#f43f5e',
    activeStart: 1565,
    activeEnd: 1815,
    waypoints: [
      [14.59, 120.98], // Manila
      [21.30, -157.85],// Pacific Crossing
      [16.85, -99.90], // Acapulco
      [19.17, -96.13], // Veracruz
      [23.11, -82.36], // Havana
      [32.30, -64.78], // Bermuda
      [36.52, -6.28]   // Cadiz, Spain
    ]
  }
];

// Helper functions for time querying
export function getActiveEmpires(year) {
  return EMPIRES.filter(e => year >= e.startYear && year <= e.endYear);
}

export function getActiveEvents(year, windowYears = 40) {
  return HISTORICAL_EVENTS.filter(e => Math.abs(e.year - year) <= windowYears);
}

export function getActiveTradeRoutes(year) {
  return HISTORIC_TRADE_ROUTES.filter(r => year >= r.activeStart && year <= r.activeEnd);
}

export function getCurrentEra(year) {
  const era = ERAS.find(e => year >= e.start && year <= e.end);
  return era || ERAS[ERAS.length - 1];
}

export function formatYear(year) {
  if (year < 0) {
    return `${Math.abs(year)} BCE`;
  } else if (year === 0) {
    return '1 CE';
  } else {
    return `${year} CE`;
  }
}
