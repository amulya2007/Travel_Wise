// Comprehensive, verified destinations and attractions data for TravelWise
// High-resolution, accurate Unsplash images for each landmark

export const CITY_FALLBACK_IMAGES = {
  Hyderabad: 'https://images.unsplash.com/photo-1572445271230-a78b5944a659?w=800&auto=format&fit=crop&q=80',
  Goa: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800&auto=format&fit=crop&q=80',
  Jaipur: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?w=800&auto=format&fit=crop&q=80',
  Bengaluru: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?w=800&auto=format&fit=crop&q=80',
  Munnar: 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?w=800&auto=format&fit=crop&q=80',
  Agra: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=800&auto=format&fit=crop&q=80',
  default: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80'
};

export const FEATURED_DESTINATIONS = [
  {
    city: 'Hyderabad',
    state: 'Telangana',
    tagline: 'City of Pearls, iconic Charminar & Royal Biryani',
    image: 'https://images.unsplash.com/photo-1572445271230-a78b5944a659?w=800&auto=format&fit=crop&q=80',
    placesCount: '8 Curated Spots',
    avgBudget: '₹4,500 for 2 Days',
    highlights: ['Charminar', 'Golconda Fort', 'Hussain Sagar']
  },
  {
    city: 'Goa',
    state: 'Goa',
    tagline: 'Sun-drenched beaches, coastal dining & Portuguese villas',
    image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800&auto=format&fit=crop&q=80',
    placesCount: '4 Curated Spots',
    avgBudget: '₹7,500 for 3 Days',
    highlights: ['Baga Beach', 'Fort Aguada', 'Palolem Bay']
  },
  {
    city: 'Jaipur',
    state: 'Rajasthan',
    tagline: 'Pink City palaces, amber forts & vibrant royal bazaars',
    image: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?w=800&auto=format&fit=crop&q=80',
    placesCount: '4 Curated Spots',
    avgBudget: '₹5,000 for 2 Days',
    highlights: ['Hawa Mahal', 'Amber Fort', 'Jal Mahal']
  },
  {
    city: 'Bengaluru',
    state: 'Karnataka',
    tagline: 'Garden City parks, grand palaces & tech-hub vibe',
    image: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?w=800&auto=format&fit=crop&q=80',
    placesCount: '4 Curated Spots',
    avgBudget: '₹4,000 for 2 Days',
    highlights: ['Vidhana Soudha', 'Bangalore Palace', 'Cubbon Park']
  },
  {
    city: 'Munnar',
    state: 'Kerala',
    tagline: 'Misty tea plantations, waterfalls & Western Ghats hills',
    image: 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?w=800&auto=format&fit=crop&q=80',
    placesCount: '3 Curated Spots',
    avgBudget: '₹6,000 for 3 Days',
    highlights: ['Tea Gardens', 'Mattupetty Lake', 'Eravikulam']
  },
  {
    city: 'Agra',
    state: 'Uttar Pradesh',
    tagline: 'Taj Mahal wonder, Mughal fortress & Yamuna sunset views',
    image: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=800&auto=format&fit=crop&q=80',
    placesCount: '3 Curated Spots',
    avgBudget: '₹3,500 for 2 Days',
    highlights: ['Taj Mahal', 'Agra Fort', 'Mehtab Bagh']
  }
];

export const INITIAL_ATTRACTIONS = [
  // --- HYDERABAD ---
  {
    id: 1,
    name: 'Charminar & Laad Bazaar',
    description: 'The quintessential 1591 landmark with four grand minarets, surrounded by bustling pearl, bangle, and street food markets.',
    city: 'Hyderabad',
    state: 'Telangana',
    category: 'Culture',
    estimated_duration: 2.0,
    entry_fee: 50.0,
    rating: 4.7,
    image_url: 'https://images.unsplash.com/photo-1572445271230-a78b5944a659?w=800&auto=format&fit=crop&q=80'
  },
  {
    id: 2,
    name: 'Golconda Fort',
    description: 'Magnificent 16th-century fortress known for acoustic engineering, royal ruins, and dramatic panoramic sunset views over the city.',
    city: 'Hyderabad',
    state: 'Telangana',
    category: 'Historical',
    estimated_duration: 3.0,
    entry_fee: 80.0,
    rating: 4.6,
    image_url: 'https://images.unsplash.com/photo-1617854818583-09e7f077a156?w=800&auto=format&fit=crop&q=80'
  },
  {
    id: 3,
    name: 'Hussain Sagar Lake & Buddha Statue',
    description: 'Heart-shaped lake featuring the world’s tallest monolithic Buddha statue, evening boat cruises, and lakeside promenade.',
    city: 'Hyderabad',
    state: 'Telangana',
    category: 'Nature',
    estimated_duration: 2.0,
    entry_fee: 100.0,
    rating: 4.5,
    image_url: 'https://images.unsplash.com/photo-1589182373726-e4f658ab50f0?w=800&auto=format&fit=crop&q=80'
  },
  {
    id: 4,
    name: 'Salar Jung Museum',
    description: 'Prestigious national museum housing an unmatched one-man collection of European clocks, Mughal jade, and antique sculptures.',
    city: 'Hyderabad',
    state: 'Telangana',
    category: 'Historical',
    estimated_duration: 2.5,
    entry_fee: 50.0,
    rating: 4.6,
    image_url: 'https://images.unsplash.com/photo-1566127444979-b3d2b654e3d7?w=800&auto=format&fit=crop&q=80'
  },
  {
    id: 5,
    name: 'Chowmahalla Palace',
    description: 'Opulent seat of the Nizams dynasty, celebrated for grand chandelier-lit Durbar halls, vintage car collections, and verdant courtyards.',
    city: 'Hyderabad',
    state: 'Telangana',
    category: 'Historical',
    estimated_duration: 2.0,
    entry_fee: 100.0,
    rating: 4.6,
    image_url: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=800&auto=format&fit=crop&q=80'
  },
  {
    id: 6,
    name: 'Birla Mandir',
    description: 'Stunning white Rajasthani marble temple perched high on a hillock overlooking the twin cities and Hussain Sagar lake at twilight.',
    city: 'Hyderabad',
    state: 'Telangana',
    category: 'Culture',
    estimated_duration: 1.5,
    entry_fee: 0.0,
    rating: 4.7,
    image_url: 'https://images.unsplash.com/photo-1545128485-c400e7702796?w=800&auto=format&fit=crop&q=80'
  },
  {
    id: 7,
    name: 'Durgam Cheruvu & Cable Bridge',
    description: 'Scenic lake nestled between granite cliffs, featuring an illuminated suspension cable bridge, lakeside cafes, and evening walks.',
    city: 'Hyderabad',
    state: 'Telangana',
    category: 'Nature',
    estimated_duration: 2.0,
    entry_fee: 0.0,
    rating: 4.5,
    image_url: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&auto=format&fit=crop&q=80'
  },
  {
    id: 8,
    name: 'Hyderabadi Dum Biryani Trail',
    description: 'Legendary culinary exploration through authentic Dum Biryani hubs, traditional Irani chai stalls, and royal Osmania biscuits.',
    city: 'Hyderabad',
    state: 'Telangana',
    category: 'Food',
    estimated_duration: 1.5,
    entry_fee: 400.0,
    rating: 4.8,
    image_url: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&auto=format&fit=crop&q=80'
  },

  // --- GOA ---
  {
    id: 9,
    name: 'Baga Beach & Water Sports',
    description: 'Lively coastal haven in North Goa with parasailing, jet skiing, beach shacks, and vibrant sunset dining.',
    city: 'Goa',
    state: 'Goa',
    category: 'Beach',
    estimated_duration: 3.5,
    entry_fee: 350.0,
    rating: 4.6,
    image_url: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800&auto=format&fit=crop&q=80'
  },
  {
    id: 10,
    name: 'Fort Aguada & Lighthouse',
    description: '17th-century Portuguese coastal fortress overlooking the Arabian Sea, featuring a grand stone lighthouse.',
    city: 'Goa',
    state: 'Goa',
    category: 'Historical',
    estimated_duration: 2.0,
    entry_fee: 50.0,
    rating: 4.5,
    image_url: 'https://images.unsplash.com/photo-1587974928442-77dc3e0dba72?w=800&auto=format&fit=crop&q=80'
  },
  {
    id: 11,
    name: 'Palolem Beach & Kayaking',
    description: 'Crescent-shaped calm beach in South Goa framed by coconut trees and gentle turquoise waters ideal for kayaking.',
    city: 'Goa',
    state: 'Goa',
    category: 'Beach',
    estimated_duration: 3.0,
    entry_fee: 200.0,
    rating: 4.7,
    image_url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80'
  },
  {
    id: 12,
    name: 'Fontainhas Latin Quarter',
    description: 'Heritage Portuguese quarter in Panaji lined with brightly painted colonial villas, cozy bakeries, and art galleries.',
    city: 'Goa',
    state: 'Goa',
    category: 'Culture',
    estimated_duration: 2.0,
    entry_fee: 0.0,
    rating: 4.7,
    image_url: 'https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?w=800&auto=format&fit=crop&q=80'
  },

  // --- JAIPUR ---
  {
    id: 13,
    name: 'Hawa Mahal (Palace of Winds)',
    description: 'Iconic pink sandstone palace with 953 ornate lattice windows designed for royal women to observe street life.',
    city: 'Jaipur',
    state: 'Rajasthan',
    category: 'Historical',
    estimated_duration: 1.5,
    entry_fee: 50.0,
    rating: 4.7,
    image_url: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?w=800&auto=format&fit=crop&q=80'
  },
  {
    id: 14,
    name: 'Amber Fort & Palace',
    description: 'Sprawling hilltop fort renowned for artistic Rajput architecture, yellow courtyards, and the Sheesh Mahal mirror palace.',
    city: 'Jaipur',
    state: 'Rajasthan',
    category: 'Historical',
    estimated_duration: 3.0,
    entry_fee: 100.0,
    rating: 4.8,
    image_url: 'https://images.unsplash.com/photo-1599661046827-dacff0c0f09a?w=800&auto=format&fit=crop&q=80'
  },
  {
    id: 15,
    name: 'City Palace Jaipur',
    description: 'Grand royal palace complex featuring the Peacock Gate, Mughal pavilions, and extensive collections of royal apparel.',
    city: 'Jaipur',
    state: 'Rajasthan',
    category: 'Historical',
    estimated_duration: 2.5,
    entry_fee: 200.0,
    rating: 4.6,
    image_url: 'https://images.unsplash.com/photo-1598890777032-bde835ba27c2?w=800&auto=format&fit=crop&q=80'
  },
  {
    id: 16,
    name: 'Jal Mahal (Water Palace)',
    description: 'Poetic palace floating quietly in Man Sagar Lake against the backdrop of the Aravalli hills, glowing beautifully at sunset.',
    city: 'Jaipur',
    state: 'Rajasthan',
    category: 'Sightseeing',
    estimated_duration: 1.0,
    entry_fee: 0.0,
    rating: 4.5,
    image_url: 'https://images.unsplash.com/photo-1585135497273-1a86b09fe70e?w=800&auto=format&fit=crop&q=80'
  },

  // --- BENGALURU ---
  {
    id: 17,
    name: 'Vidhana Soudha',
    description: 'Magnificent Neo-Dravidian granite state capitol building, an architectural landmark of Karnataka.',
    city: 'Bengaluru',
    state: 'Karnataka',
    category: 'Sightseeing',
    estimated_duration: 1.0,
    entry_fee: 0.0,
    rating: 4.7,
    image_url: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?w=800&auto=format&fit=crop&q=80'
  },
  {
    id: 18,
    name: 'Bangalore Palace',
    description: 'Tudor-revival royal estate featuring fortified towers, royal oil paintings, and historic banquet halls.',
    city: 'Bengaluru',
    state: 'Karnataka',
    category: 'Historical',
    estimated_duration: 2.5,
    entry_fee: 250.0,
    rating: 4.5,
    image_url: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=800&auto=format&fit=crop&q=80'
  },
  {
    id: 19,
    name: 'Cubbon Park & Bamboo Groves',
    description: '300-acre green lung in the heart of the city with walking trails, colonial statues, and shaded bamboo avenues.',
    city: 'Bengaluru',
    state: 'Karnataka',
    category: 'Nature',
    estimated_duration: 2.0,
    entry_fee: 0.0,
    rating: 4.6,
    image_url: 'https://images.unsplash.com/photo-1519331379826-f10be5486c6f?w=800&auto=format&fit=crop&q=80'
  },
  {
    id: 20,
    name: 'Nandi Hills Sunrise Point',
    description: 'Popular hilltop fortress 60 km from Bengaluru offering magical sunrise panoramas above dense layers of clouds.',
    city: 'Bengaluru',
    state: 'Karnataka',
    category: 'Adventure',
    estimated_duration: 3.5,
    entry_fee: 30.0,
    rating: 4.6,
    image_url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&auto=format&fit=crop&q=80'
  },

  // --- MUNNAR ---
  {
    id: 21,
    name: 'Munnar Tea Plantations & Museum',
    description: 'Lush rolling carpets of emerald tea gardens in the misty Western Ghats with guided tasting and processing tours.',
    city: 'Munnar',
    state: 'Kerala',
    category: 'Nature',
    estimated_duration: 2.5,
    entry_fee: 150.0,
    rating: 4.8,
    image_url: 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?w=800&auto=format&fit=crop&q=80'
  },
  {
    id: 22,
    name: 'Mattupetty Dam & Lake Boating',
    description: 'Concrete gravity dam surrounded by pine groves and green hills, offering speedboats and serene mountain reflections.',
    city: 'Munnar',
    state: 'Kerala',
    category: 'Nature',
    estimated_duration: 2.0,
    entry_fee: 100.0,
    rating: 4.5,
    image_url: 'https://images.unsplash.com/photo-1593693397690-362cb9666fc2?w=800&auto=format&fit=crop&q=80'
  },
  {
    id: 23,
    name: 'Eravikulam National Park',
    description: 'High-altitude nature reserve home to the endangered Nilgiri Tahr mountain goat and misty rolling grasslands.',
    city: 'Munnar',
    state: 'Kerala',
    category: 'Nature',
    estimated_duration: 3.0,
    entry_fee: 200.0,
    rating: 4.7,
    image_url: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=800&auto=format&fit=crop&q=80'
  },

  // --- AGRA ---
  {
    id: 24,
    name: 'Taj Mahal',
    description: 'World-renowned ivory-white marble mausoleum on the Yamuna river, an architectural wonder of the world symbolizing eternal love.',
    city: 'Agra',
    state: 'Uttar Pradesh',
    category: 'Historical',
    estimated_duration: 3.0,
    entry_fee: 50.0,
    rating: 4.9,
    image_url: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=800&auto=format&fit=crop&q=80'
  },
  {
    id: 25,
    name: 'Agra Fort',
    description: 'Massive 16th-century red sandstone fortress of Mughal emperors, containing Khas Mahal, Diwan-i-Khas, and distant views of the Taj.',
    city: 'Agra',
    state: 'Uttar Pradesh',
    category: 'Historical',
    estimated_duration: 2.5,
    entry_fee: 50.0,
    rating: 4.7,
    image_url: 'https://images.unsplash.com/photo-1592635196078-9fdc757f27f4?w=800&auto=format&fit=crop&q=80'
  },
  {
    id: 26,
    name: 'Mehtab Bagh (Moonlight Garden)',
    description: 'Charbagh garden complex located directly across the Yamuna River from the Taj Mahal, providing unforgettable sunset reflections.',
    city: 'Agra',
    state: 'Uttar Pradesh',
    category: 'Nature',
    estimated_duration: 1.5,
    entry_fee: 25.0,
    rating: 4.6,
    image_url: 'https://images.unsplash.com/photo-1585135497273-1a86b09fe70e?w=800&auto=format&fit=crop&q=80'
  }
];
