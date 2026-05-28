export const CROP_DATA = {
  mealwood: {
    id: 'mealwood',
    name: 'Mealwood',
    caloriesPerCycle: 200, // 600 kcal over 3 cycles
    description: 'Quickly grows Meal Lice. Requires solid Dirt fertilization. Standard early food source.',
    color: '#DAA520', // Sandstone Gold
    inputs: [
      { name: 'Dirt', amount: 10, unit: 'kg' }
    ],
    outputs: []
  },
  bristleBlossom: {
    id: 'bristleBlossom',
    name: 'Bristle Blossom',
    caloriesPerCycle: 266.7, // 1600 kcal over 6 cycles
    description: 'Produces juicy Bristle Berries. Requires direct Light and clean Water irrigation.',
    color: '#7FBFFF', // Pastel Oxygen Blue
    inputs: [
      { name: 'Water', amount: 20, unit: 'kg' }
    ],
    outputs: []
  },
  duskCap: {
    id: 'duskCap',
    name: 'Dusk Cap',
    caloriesPerCycle: 320, // 2400 kcal over 7.5 cycles
    description: 'Cultivates nutritious Mushrooms. Must grow in a Carbon Dioxide atmosphere and fertilizes with Slime.',
    color: '#9C59D1', // Pastel Purple
    inputs: [
      { name: 'Slime', amount: 4, unit: 'kg' }
    ],
    outputs: []
  },
  sleetWheat: {
    id: 'sleetWheat',
    name: 'Sleet Wheat',
    caloriesPerCycle: 200, // Estimated yield
    description: 'Produces Sleet Wheat Grain for premium foods. Requires cold Dirt fertilization and liquid Water irrigation.',
    color: '#FFFFA8', // Pastel Hydrogen Yellow
    inputs: [
      { name: 'Dirt', amount: 5, unit: 'kg' },
      { name: 'Water', amount: 20, unit: 'kg' }
    ],
    outputs: []
  },
  thimbleReed: {
    id: 'thimbleReed',
    name: 'Thimble Reed',
    caloriesPerCycle: 0, // Industrial crop
    description: 'Siphons heavy amounts of Polluted Water to produce Reed Fiber. Excellent for suits and textiles.',
    color: '#719B56', // Polluted Water Green
    inputs: [
      { name: 'Polluted Water', amount: 160, unit: 'kg' }
    ],
    outputs: [
      { name: 'Reed Fiber', amount: 0.5, unit: 'unit' }
    ]
  },
  pinchaPepper: {
    id: 'pinchaPepper',
    name: 'Pincha Pepperplant',
    caloriesPerCycle: 0, // Spice/seasoning only
    description: 'Produces hot, aromatic Pincha Peppernuts. Grows hanging upside down. Requires warm temperatures, liquid Polluted Water irrigation, and solid Phosphorite fertilization.',
    color: '#E25858', // Pepper Red
    inputs: [
      { name: 'Polluted Water', amount: 35, unit: 'kg' },
      { name: 'Phosphorite', amount: 20, unit: 'kg' }
    ],
    outputs: []
  },
  waterweed: {
    id: 'waterweed',
    name: 'Waterweed',
    caloriesPerCycle: 300, // Yields crunchy Lettuce
    description: 'Cultivates crisp Lettuce heads in aquatic environments. Must grow in shallow Salt Water or Brine. Fertilizes with Bleach Stone.',
    color: '#2E8B57', // Sea Green
    inputs: [
      { name: 'Salt Water', amount: 5, unit: 'kg' },
      { name: 'Bleach Stone', amount: 0.5, unit: 'kg' }
    ],
    outputs: []
  },
  grubfruitPlant: {
    id: 'grubfruitPlant',
    name: 'Grubfruit Plant',
    caloriesPerCycle: 200, // Yields Grubfruit
    description: 'DLC plant native to Terrania that grows sweet Grubfruit. Requires warm conditions and direct Sulfur irrigation. Speed and yield boosted by Sweetles.',
    color: '#FFD700', // Grubfruit Yellow Gold
    inputs: [
      { name: 'Sulfur', amount: 10, unit: 'kg' }
    ],
    outputs: []
  }
};
