import { Category, Question } from '../types/game';

export const CATEGORIES_LIST: Category[] = [
  'Animals',
  'Brain Teasers',
  'Celebrities',
  'Entertainment',
  'For Children',
  'General',
  'Geography',
  'History',
  'Hobbies',
  'Humanities',
  'Literature',
  'Movies',
  'Music',
  'People',
  'Religion',
  'Sci / Tech',
  'Sports',
  'Television',
  'Video Games',
  'World',
  'K-12 Education'
];

export const TRIVIA_QUESTIONS: Question[] = [
  // --- ANIMALS ---
  {
    id: 'anim-1',
    category: 'Animals',
    prompt: 'What unusual physical shape is the poop of an Australian wombat?',
    correctAnswer: 'Nearly perfect cubes',
    fallbackDecoys: [
      'Hollow donut rings',
      'Flat hexagonal coins',
      'Spiral corkscrews',
      'Triangle prisms'
    ],
    funFact: 'Wombats stack their cubed poop on rocks to mark territory; the square shape prevents it from rolling away!',
    imageUrl: '/src/assets/images/wombat_cube_nature_1793049617744.jpg',
    difficulty: 'easy'
  },
  {
    id: 'anim-2',
    category: 'Animals',
    prompt: 'How many hearts does a standard giant Pacific octopus possess in its body?',
    correctAnswer: 'Three hearts',
    fallbackDecoys: [
      'Eight hearts (one per arm)',
      'Just one large blue heart',
      'Two hearts and four pseudo-lungs',
      'Zero hearts (they use vascular pumps)'
    ],
    funFact: 'Two hearts pump blood to the gills, while the third circulates blood to the rest of the body!',
    difficulty: 'easy'
  },
  {
    id: 'anim-3',
    category: 'Animals',
    prompt: 'Because of their extremely low body temperature and slow metabolism, which animal is virtually immune to the rabies virus?',
    correctAnswer: 'The North American Opossum',
    fallbackDecoys: [
      'The Three-toed Sloth',
      'The Armadillo',
      'The Platypus',
      'The Hedgehog'
    ],
    funFact: 'Their body temp (94°F) is too cold for the rabies virus to survive and multiply!',
    difficulty: 'medium'
  },

  // --- BRAIN TEASERS ---
  {
    id: 'brain-1',
    category: 'Brain Teasers',
    prompt: 'In probability theory, what is the minimum number of people needed in a room for there to be a 50% chance that two share the exact same birthday?',
    correctAnswer: 'Just 23 people',
    fallbackDecoys: [
      '183 people (half the year)',
      '75 people',
      '92 people',
      '365 people'
    ],
    funFact: 'Known as the Birthday Paradox: with 23 people, there are 253 unique pairs, making a shared birthday far more likely than intuition suggests!',
    imageUrl: '/src/assets/images/math_geometry_spiral_1793049618222.jpg',
    difficulty: 'medium'
  },
  {
    id: 'brain-2',
    category: 'Brain Teasers',
    prompt: 'If you could theoretically fold a standard 0.1 mm sheet of paper in half 42 times, how thick would the folded paper become?',
    correctAnswer: 'Thick enough to reach the Moon',
    fallbackDecoys: [
      'As tall as the Empire State Building',
      'About the height of Mount Everest',
      'Roughly 100 miles (edge of space)',
      'The thickness of an elephant\'s leg'
    ],
    funFact: 'Due to exponential growth (2 to the 42nd power), 0.1 mm multiplied by 4.4 trillion yields approximately 440,000 km—the Earth-Moon distance!',
    difficulty: 'medium'
  },

  // --- CELEBRITIES ---
  {
    id: 'celeb-1',
    category: 'Celebrities',
    prompt: 'In 1983, Michael Jackson debuted his legendary "Moonwalk" dance on live television while performing which hit song during the Motown 25 special?',
    correctAnswer: 'Billie Jean',
    fallbackDecoys: [
      'Thriller',
      'Beat It',
      'Smooth Criminal',
      'Don\'t Stop \'Til You Get Enough'
    ],
    funFact: 'He wore a black sequined jacket, black fedora, and one rhinestone white glove, instantly electrifying the audience and TV viewers worldwide!',
    difficulty: 'easy'
  },
  {
    id: 'celeb-2',
    category: 'Celebrities',
    prompt: 'What bizarre backstage rider requirement did rock band Van Halen famously include in all their 1980s tour contracts?',
    correctAnswer: 'A bowl of M&Ms with all brown candies removed',
    fallbackDecoys: [
      'Six live doves painted fluorescent yellow',
      'A personal bouncy castle backstage',
      'A vintage pinball machine with free credits',
      'A bucket of imported Dutch mayonnaise'
    ],
    funFact: 'It was a safety test! If they saw brown M&Ms, they knew venue promoters hadn\'t read the technical stage weight requirements!',
    difficulty: 'easy'
  },

  // --- ENTERTAINMENT ---
  {
    id: 'ent-1',
    category: 'Entertainment',
    prompt: 'In Disney\'s 1994 animated film "The Lion King", the beloved catchphrase "Hakuna Matata" was borrowed directly from which African language?',
    correctAnswer: 'Swahili (meaning "No worries" or "No troubles")',
    fallbackDecoys: [
      'Zulu (meaning "Dance with lions")',
      'Yoruba (meaning "Sun will rise")',
      'Amharic (meaning "Peace in the valley")',
      'Afrikaans (meaning "Everything is fine")'
    ],
    funFact: 'Disney animators learned the phrase from their Kenyan safari guide in Hell\'s Gate National Park while researching African landscapes!',
    difficulty: 'easy'
  },
  {
    id: 'ent-2',
    category: 'Entertainment',
    prompt: 'In 2012, an online public poll by the UK Natural Environment Research Council to name a new $280 million polar research vessel was won by what comical name?',
    correctAnswer: 'Boaty McBoatface',
    fallbackDecoys: [
      'Floaty McFlippers',
      'Sir David Attenshark',
      'HMS Sea Cucumber',
      'Titanic II: The Revenge'
    ],
    funFact: 'Officials named the main vessel RRS Sir David Attenborough, but gave the official name "Boaty McBoatface" to its robotic exploration submarine!',
    difficulty: 'easy'
  },

  // --- FOR CHILDREN ---
  {
    id: 'child-1',
    category: 'For Children',
    prompt: 'Dr. Seuss wrote "Green Eggs and Ham" after his publisher bet him $50 that he couldn\'t write an entire book using what restriction?',
    correctAnswer: 'Only 50 distinct words',
    fallbackDecoys: [
      'No words with the letter E',
      'Only words of three letters or fewer',
      'Writing the entire story in under 4 hours',
      'Using rhyming words only found in a medical dictionary'
    ],
    funFact: 'Bennett Cerf made the bet, lost $50, and the book became one of the best-selling children\'s books of all time!',
    difficulty: 'easy'
  },
  {
    id: 'child-2',
    category: 'For Children',
    prompt: 'What was Winnie the Pooh\'s original favorite food in A.A. Milne\'s original stories?',
    correctAnswer: 'Honey (hunny)',
    fallbackDecoys: [
      'Blueberry scones',
      'Apple pie crusts',
      'Carrot jam',
      'Toasted crumpets'
    ],
    funFact: 'Milne based the character on a real Canadian black bear named Winnie who lived at the London Zoo!',
    difficulty: 'easy'
  },

  // --- GENERAL ---
  {
    id: 'gen-1',
    category: 'General',
    prompt: 'Before being used as a popular sweet condiment, what medical condition was tomato ketchup patented and sold to cure in the 1830s?',
    correctAnswer: 'Indigestion, diarrhea, and jaundice',
    fallbackDecoys: [
      'Baldness and receding hairlines',
      'Chronic toothaches and gum boils',
      'Sea sickness and scurvy',
      'Insomnia and bad dreams'
    ],
    funFact: 'Dr. John Cook Bennett published recipes for ketchup pills and promoted tomato sauce as universal stomach medicine!',
    difficulty: 'easy'
  },
  {
    id: 'gen-2',
    category: 'General',
    prompt: 'In Switzerland, it is legally forbidden by animal welfare law to own only ONE of which pet because they are considered social animals that get lonely?',
    correctAnswer: 'Guinea pigs',
    fallbackDecoys: [
      'Goldfish',
      'Domestic hamsters',
      'Parakeets',
      'Dwarf rabbits'
    ],
    funFact: 'There are even guinea pig matchmaking and rental services so an owner whose guinea pig died can get a companion for the remaining one!',
    difficulty: 'easy'
  },

  // --- GEOGRAPHY ---
  {
    id: 'geo-1',
    category: 'Geography',
    prompt: 'Kenya\'s capital city, Nairobi, is famous worldwide for being the only major global capital in the world with what unique geographical feature within sight of its skyscrapers?',
    correctAnswer: 'A free-roaming national wildlife park with lions and giraffes',
    fallbackDecoys: [
      'An active lava lake in the city center',
      'A permanent glacier on a downtown hill',
      'A navigable underground freshwater river',
      'A volcanic crater used as the parliament'
    ],
    funFact: 'Nairobi National Park covers 45 square miles just 4 miles from the city center, where endangered black rhinos and lions roam against city skyline backdrops!',
    imageUrl: '/src/assets/images/nairobi_skyline_wildlife_1793050513009.jpg',
    difficulty: 'easy'
  },
  {
    id: 'geo-2',
    category: 'Geography',
    prompt: 'In geography, what massive geological feature visible from space cuts vertically through Kenya, dividing the country into two distinct halves?',
    correctAnswer: 'The Great Rift Valley',
    fallbackDecoys: [
      'The Grand African Canyon',
      'The Sahara Escarpment Trench',
      'The Zambezi Gorge System',
      'The Congo River Fault'
    ],
    funFact: 'The East African Rift is slowly splitting the African continent into two tectonic plates, creating alkaline lakes, volcanoes, and geothermal hot springs!',
    imageUrl: '/src/assets/images/kenya_rift_valley_1793050512988.jpg',
    difficulty: 'easy'
  },
  {
    id: 'geo-3',
    category: 'Geography',
    prompt: 'Lake Turkana in northern Kenya is the world\'s largest permanent desert lake. What colorful nickname is it famous for due to its algae and volcanic minerals?',
    correctAnswer: 'The Jade Sea',
    fallbackDecoys: [
      'The Ruby Waters',
      'The Golden Lagoon',
      'The Sapphire Basin',
      'The Emerald Mirage'
    ],
    funFact: 'Known as the Cradle of Humankind, the Jade Sea is also home to the world\'s largest population of Nile crocodiles!',
    difficulty: 'medium'
  },

  // --- HISTORY ---
  {
    id: 'hist-1',
    category: 'History',
    prompt: 'In 1859, the United States and the British Empire nearly went to war over San Juan Island after an American farmer shot what?',
    correctAnswer: 'A wandering British pig',
    fallbackDecoys: [
      'A pet Canadian goose named George',
      'A wooden flagpole flying the Union Jack',
      'A barrel of imported Scottish whiskey',
      'A British naval officer\'s formal powdered wig'
    ],
    funFact: 'Known as "The Pig War", the only casualty during the multi-month military standoff was the unfortunate pig!',
    difficulty: 'easy'
  },
  {
    id: 'hist-2',
    category: 'History',
    prompt: 'In 1932, the Australian military was officially deployed to fight against an overwhelming army of what adversary?',
    correctAnswer: '20,000 Emus',
    fallbackDecoys: [
      'Rabid dingo packs',
      'Invasive cane toads',
      'Rogue Tasmanian devils',
      'Aggressive feral camels'
    ],
    funFact: 'The Emus scattered in guerrilla fashion; the military withdrew after using thousands of rounds with minimal effect. The Emus won!',
    difficulty: 'medium'
  },
  {
    id: 'hist-3',
    category: 'History',
    prompt: 'In the 14th century, Mansa Musa, the legendary ruler of the West African Mali Empire, famously crashed the economy of Cairo during his pilgrimage by doing what?',
    correctAnswer: 'Giving away so much pure gold that its value plummeted for a decade',
    fallbackDecoys: [
      'Buying every single camel in Egypt',
      'Seizing all the grain reserves in the Nile delta',
      'Demanding taxes in silver dinars instead of wheat',
      'Flooding the market with counterfeit salt slabs'
    ],
    funFact: 'He traveled with a caravan of 60,000 men and 80 camels carrying 300 pounds of gold dust each, giving gifts so lavishly that gold lost value in the Mediterranean for 12 years!',
    difficulty: 'easy'
  },

  // --- HOBBIES ---
  {
    id: 'hob-1',
    category: 'Hobbies',
    prompt: 'In philately (stamp collecting), what mistake makes the famous 1918 "Inverted Jenny" American postage stamp worth over $1 million today?',
    correctAnswer: 'The Curtiss JN-4 airplane is printed upside down in the center',
    fallbackDecoys: [
      'George Washington was printed wearing sunglasses',
      'The word "America" was misspelled "Amurica"',
      'It was accidentally printed on edible rice paper',
      'The denomination said $0.00 instead of 24 cents'
    ],
    funFact: 'Only one single sheet of 100 inverted stamps was ever sold across a post office counter before the error was caught!',
    difficulty: 'medium'
  },

  // --- HUMANITIES ---
  {
    id: 'hum-1',
    category: 'Humanities',
    prompt: 'In 1911, when the Mona Lisa was stolen from the Louvre, which famous artist was actually arrested and interrogated as a prime suspect?',
    correctAnswer: 'Pablo Picasso',
    fallbackDecoys: [
      'Claude Monet',
      'Salvador Dalí',
      'Henri Matisse',
      'Vincent van Gogh\'s nephew'
    ],
    funFact: 'Picasso had bought some stolen Iberian statues from a friend earlier, which put him under police scrutiny, but he was innocent of the Mona Lisa theft!',
    imageUrl: '/src/assets/images/mona_lisa_theft_1793049616819.jpg',
    difficulty: 'easy'
  },
  {
    id: 'hum-2',
    category: 'Humanities',
    prompt: 'In 2018, Banksy\'s artwork "Girl with Balloon" surprised an auction room at Sotheby\'s when it did what immediately after selling for $1.4 million?',
    correctAnswer: 'Shredded itself through a hidden frame shredder',
    fallbackDecoys: [
      'Sprayed neon pink paint all over the auctioneer',
      'Self-combusted into a puff of purple smoke',
      'Played a pre-recorded laugh track through a speaker',
      'Revealed a hidden portrait of SpongeBob underneath'
    ],
    funFact: 'Banksy had built a paper shredder inside the ornate gold frame years prior in case it ever went to auction!',
    difficulty: 'easy'
  },

  // --- LITERATURE ---
  {
    id: 'lit-1',
    category: 'Literature',
    prompt: 'French novelist Honoré de Balzac reportedly drank how many cups of coffee every day while writing his novels?',
    correctAnswer: 'Up to 50 cups',
    fallbackDecoys: [
      '12 pots of boiling espresso',
      'Only 3 cups, but brewed with pure opium',
      'A single 2-liter copper goblet',
      '20 cups mixed with molten dark chocolate'
    ],
    funFact: 'He wrote up to 16 hours a day and published dozens of masterworks fueled almost entirely by black coffee.',
    difficulty: 'medium'
  },

  // --- MOVIES ---
  {
    id: 'mov-1',
    category: 'Movies',
    prompt: 'Nigeria\'s booming film industry, known worldwide as "Nollywood", is famous in film economics for which incredible output record?',
    correctAnswer: 'It produces more films annually than Hollywood (over 2,500 movies a year)',
    fallbackDecoys: [
      'Every film is shot in under 24 hours',
      'It has won more Oscars than France and Italy combined',
      'All actors must sing their dialogue live on set',
      'Movie tickets cost only 1 cent nationwide'
    ],
    funFact: 'Nollywood is the second-largest film producer in the world by volume behind India\'s Bollywood, producing thousands of films shot on digital cameras in weeks!',
    difficulty: 'easy'
  },
  {
    id: 'mov-2',
    category: 'Movies',
    prompt: 'In the Marvel blockbuster "Black Panther", the fictional language of the technologically advanced nation of Wakanda is actually which real African language?',
    correctAnswer: 'isiXhosa (famous for its click consonants)',
    fallbackDecoys: [
      'Swahili',
      'Hausa',
      'Luganda',
      'Lingala'
    ],
    funFact: 'South African actor John Kani (King T\'Chaka) insisted that he and Chadwick Boseman speak authentic isiXhosa in their father-son scenes!',
    difficulty: 'medium'
  },
  {
    id: 'mov-3',
    category: 'Movies',
    prompt: 'In the classic 1939 movie "The Wizard of Oz", what household kitchen ingredient was used as fake falling snow on the actors?',
    correctAnswer: '100% pure chrysotile asbestos',
    fallbackDecoys: [
      'Powdered confectioner\'s sugar',
      'Instant potato flakes',
      'Finely shredded coconut shavings',
      'Cornstarch and bleached soap suds'
    ],
    funFact: 'At the time, asbestos was marketed as a miracle non-flammable substance, before its health hazards were recognized.',
    difficulty: 'easy'
  },

  // --- MUSIC ---
  {
    id: 'mus-1',
    category: 'Music',
    prompt: 'In 2021, Nigerian superstar Burna Boy won the Grammy Award for Best Global Music Album with which critically acclaimed project?',
    correctAnswer: 'Twice as Tall',
    fallbackDecoys: [
      'African Giant',
      'Love, Damini',
      'Lagos to London',
      'Made in Lagos'
    ],
    funFact: 'Executive-produced by Diddy, "Twice as Tall" propelled modern Afrobeats into mainstream stadium tours across the globe!',
    difficulty: 'medium'
  },
  {
    id: 'mus-2',
    category: 'Music',
    prompt: 'In global music news, the viral 2020 song "Jerusalema" that inspired a worldwide pandemic dance craze originated from which African country?',
    correctAnswer: 'South Africa (produced by Master KG and Nomcebo Zikode)',
    fallbackDecoys: [
      'Nigeria',
      'Ghana',
      'Kenya',
      'Senegal'
    ],
    funFact: 'Sung in isiZulu, the song generated billions of TikTok views with healthcare workers, priests, and airline pilots dancing in viral solidarity!',
    difficulty: 'easy'
  },
  {
    id: 'mus-3',
    category: 'Music',
    prompt: 'Before becoming an international hitmaker, Freddie Mercury originally wanted to name his legendary rock band what before settling on Queen?',
    correctAnswer: 'Build Your Own Boat',
    fallbackDecoys: [
      'The Royal Velvet Scorpions',
      'Grand Duchess',
      'Glamour Pussies',
      'Bohemian Rhapsody Kings'
    ],
    funFact: 'Freddie argued the name "Queen" sounded majestic, glamorous, and unforgettable!',
    difficulty: 'medium'
  },

  // --- PEOPLE ---
  {
    id: 'ppl-1',
    category: 'People',
    prompt: 'In 2004, Kenyan environmental activist Wangari Maathai made global history by becoming the first African woman to win which prestigious international award?',
    correctAnswer: 'The Nobel Peace Prize',
    fallbackDecoys: [
      'The UN Secretary-General Medal',
      'The Goldman Environmental Lifetime Prize',
      'The International Court of Justice Gavel',
      'The Commonwealth Leadership Trophy'
    ],
    funFact: 'She founded the Green Belt Movement, which mobilized Kenyan rural women to plant over 50 million indigenous trees to fight deforestation!',
    difficulty: 'easy'
  },
  {
    id: 'ppl-2',
    category: 'People',
    prompt: 'What unusual physical feature did Abraham Lincoln grow in 1860 after receiving a letter from an 11-year-old girl named Grace Bedell?',
    correctAnswer: 'His famous iconic beard',
    fallbackDecoys: [
      'A handlebar mustache',
      'Shoulder-length hair',
      'Bushy mutton chop sideburns',
      'Thick woolly eyebrows'
    ],
    funFact: 'She wrote him that his face was too thin and ladies would tease their husbands into voting for him if he grew whiskers!',
    difficulty: 'easy'
  },

  // --- RELIGION ---
  {
    id: 'rel-1',
    category: 'Religion',
    prompt: 'In Ethiopian Christian tradition and the Ethiopian calendar, how many months are officially in one calendar year?',
    correctAnswer: '13 months (12 months of 30 days plus a 13th month of 5 or 6 days)',
    fallbackDecoys: [
      '10 months (decimal solar system)',
      '14 months (lunar cycles)',
      '8 months (ancient Coptic seasons)',
      '12 months of exactly 31 days'
    ],
    funFact: 'Ethiopia famously advertises its tourism as "13 Months of Sunshine" and is approximately 7 to 8 years behind the Gregorian calendar!',
    difficulty: 'medium'
  },

  // --- SCI / TECH ---
  {
    id: 'sci-1',
    category: 'Sci / Tech',
    prompt: 'In Kenyan financial history, what groundbreaking mobile phone technology launched by Safaricom in 2007 transformed Kenya into the world capital of mobile banking?',
    correctAnswer: 'M-Pesa',
    fallbackDecoys: [
      'SimbaPay',
      'AfriCash Mobile',
      'NairobiPay',
      'K-Shilling Digital'
    ],
    funFact: 'Over 90% of adult Kenyans use M-Pesa to pay bills, buy groceries, and transfer money via basic SMS without requiring a traditional bank account!',
    difficulty: 'easy'
  },
  {
    id: 'sci-2',
    category: 'Sci / Tech',
    prompt: 'What was the very first retail item ever scanned by a laser barcode scanner in an Ohio supermarket in 1974?',
    correctAnswer: 'A pack of Wrigley\'s Juicy Fruit chewing gum',
    fallbackDecoys: [
      'A can of Campbell\'s tomato soup',
      'A carton of Grade A eggs',
      'A box of Kellogg\'s Corn Flakes',
      'A loaf of Wonder Bread'
    ],
    funFact: 'The scanner and the original pack of gum are now on display at the Smithsonian National Museum of American History!',
    difficulty: 'easy'
  },

  // --- SPORTS ---
  {
    id: 'sp-1',
    category: 'Sports',
    prompt: 'In the 1904 Olympic Marathon in St. Louis, champion Fred Lorz was disqualified after it was discovered he finished the race by doing what?',
    correctAnswer: 'Riding 11 miles in his manager\'s car',
    fallbackDecoys: [
      'Riding an electric tram for 8 miles',
      'Taking a shortcut through a beer garden',
      'Running backwards the entire final lap',
      'Hiring a lookalike brother to run the middle section'
    ],
    funFact: 'His car broke down at mile 19, so he got out and jogged to the finish line, claiming it was just a joke!',
    imageUrl: '/src/assets/images/olympic_marathon_car_1793049617406.jpg',
    difficulty: 'easy'
  },
  {
    id: 'sp-2',
    category: 'Sports',
    prompt: 'In 2019, Kenyan running legend Eliud Kipchoge captured global news headlines in Vienna, Austria by becoming the first human in history to do what?',
    correctAnswer: 'Run a full marathon in under two hours (1:59:40)',
    fallbackDecoys: [
      'Run an Olympic marathon completely barefoot',
      'Win four consecutive Olympic marathon golds',
      'Complete a marathon backwards in under 3 hours',
      'Run 100 miles across the Sahara in 24 hours'
    ],
    funFact: 'With rotating pacing teams and laser guides, Kipchoge ran 26.2 miles in 1 hour, 59 minutes, and 40 seconds, proving "No Human Is Limited"!',
    difficulty: 'easy'
  },

  // --- TELEVISION ---
  {
    id: 'tv-1',
    category: 'Television',
    prompt: 'In 1999, which iconic animatronic toy was officially banned from the headquarters of the NSA (National Security Agency) over fears it was a secret recording spy device?',
    correctAnswer: 'Furby',
    fallbackDecoys: [
      'Tamagotchi',
      'Game Boy Color',
      'Tickle Me Elmo',
      'Talkboy cassette recorder'
    ],
    funFact: 'Officials feared Furbies could secretly record top secret conversations and repeat them, though Furbies actually had no recording hardware!',
    difficulty: 'easy'
  },

  // --- VIDEO GAMES ---
  {
    id: 'vg-1',
    category: 'Video Games',
    prompt: 'In 1983, game company Atari secretly buried hundreds of thousands of unsold game cartridges in a landfill in Alamogordo, New Mexico, most famously including which game?',
    correctAnswer: 'E.T. the Extra-Terrestrial',
    fallbackDecoys: [
      'Pac-Man for Atari 2600',
      'Super Mario Bros Bootleg',
      'Custer\'s Revenge',
      'Swordquest: Waterworld'
    ],
    funFact: 'The urban legend was proven true in 2014 when a film crew excavated the site and recovered 1,300 intact cartridges!',
    difficulty: 'easy'
  },

  // --- WORLD ---
  {
    id: 'world-1',
    category: 'World',
    prompt: 'In Kenyan political history, what historic milestone occurred on August 27, 2010 when Kenya officially promulgated its new Constitution at Uhuru Park?',
    correctAnswer: 'Devolution creating 47 autonomous county governments',
    fallbackDecoys: [
      'Abolishing the position of President',
      'Merging Kenya with Uganda and Tanzania',
      'Declaring Nairobi a sovereign independent state',
      'Replacing parliamentary elections with computer lotteries'
    ],
    funFact: 'The 2010 Constitution replaced the 1963 independence constitution, dramatically decentralizing power and creating 47 county governors!',
    difficulty: 'medium'
  },
  {
    id: 'world-2',
    category: 'World',
    prompt: 'In 2021, when a massive container ship named the "Ever Given" ran aground and blocked the Suez Canal for six days, what bizarre shape was its GPS tracking path revealed to have drawn in the Red Sea beforehand?',
    correctAnswer: 'A giant crude drawing of a phallus',
    fallbackDecoys: [
      'A pirate skull and crossbones',
      'A giant question mark',
      'The letters "S.O.S."',
      'A heart with an arrow'
    ],
    funFact: 'VesselFinder maritime data confirmed the vessel made loop maneuvers while waiting in anchorage that unintentionally formed the comical outline before entering the canal!',
    difficulty: 'medium'
  },

  // --- K-12 EDUCATION ---
  {
    id: 'k12-1',
    category: 'K-12 Education',
    prompt: 'In high school mathematics, in the ancient Roman numeral system, what symbol did the Romans use to represent the number zero?',
    correctAnswer: 'They had no symbol for zero',
    fallbackDecoys: [
      'A small circle (O)',
      'A slashed line (Ø)',
      'The letter Z',
      'A blank space with a dot'
    ],
    funFact: 'The Romans had no numerical concept or digit for zero; zero as an operative digit arrived from Hindu-Arabic mathematics!',
    difficulty: 'easy'
  },
  {
    id: 'k12-2',
    category: 'K-12 Education',
    prompt: 'In high school biology, what organelle inside eukaryotic plant cells is known as the site of photosynthesis where solar energy is converted to chemical energy?',
    correctAnswer: 'Chloroplasts',
    fallbackDecoys: [
      'Mitochondria (the powerhouse)',
      'Endoplasmic reticulum',
      'Ribosomes',
      'Golgi apparatus'
    ],
    funFact: 'Chloroplasts contain chlorophyll pigments that absorb blue and red light while reflecting green light, making plants appear green!',
    difficulty: 'easy'
  }
];

export const BOT_NAMES = [
  'CleverCathy',
  'SneakySam',
  'BluffingBob',
  'TricksterTanya',
  'SmoothLeo',
  'DeceptiveDan',
  'MysticMaya',
  'HustlerHank'
];

export const BOT_AVATARS = [
  { avatar: '🦊', color: '#F97316' },
  { avatar: '🦉', color: '#8B5CF6' },
  { avatar: '🎭', color: '#EC4899' },
  { avatar: '🕶️', color: '#06B6D4' },
  { avatar: '🎩', color: '#10B981' },
  { avatar: '🐉', color: '#EF4444' },
  { avatar: '🦄', color: '#A855F7' },
  { avatar: '🤠', color: '#EAB308' }
];

export const PLAYER_COLORS = [
  { name: 'Emerald', hex: '#10B981', border: 'border-emerald-500', bg: 'bg-emerald-500' },
  { name: 'Amber', hex: '#F59E0B', border: 'border-amber-500', bg: 'bg-amber-500' },
  { name: 'Rose', hex: '#F43F5E', border: 'border-rose-500', bg: 'bg-rose-500' },
  { name: 'Cyan', hex: '#06B6D4', border: 'border-cyan-500', bg: 'bg-cyan-500' },
  { name: 'Violet', hex: '#8B5CF6', border: 'border-violet-500', bg: 'bg-violet-500' },
  { name: 'Orange', hex: '#F97316', border: 'border-orange-500', bg: 'bg-orange-500' },
  { name: 'Fuchsia', hex: '#D946EF', border: 'border-fuchsia-500', bg: 'bg-fuchsia-500' },
  { name: 'Teal', hex: '#14B8A6', border: 'border-teal-500', bg: 'bg-teal-500' }
];

export const PLAYER_AVATARS = [
  '🦊', '🦉', '🎭', '🦁', '🐙', '🐼', '🦄', '🐸',
  '🤠', '🦹', '🧙', '🕵️', '🚀', '⚡', '💎', '🔥'
];
