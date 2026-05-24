export const CRITTER_DATA = {
  hatch: {
    id: 'hatch',
    name: 'Hatch',
    maxSize: 8,
    caloriesPerCycle: 87.5, // BBQ equivalent
    description: 'Eats solid minerals and excretes Coal. Extremely useful early to mid game.',
    color: '#FFA268',
    spaceRequired: 12,
    eggsPerCycle: 0.17,
    inputs: [
      { name: 'Dirt/Stone', amount: 140, unit: 'kg' }
    ],
    outputs: [
      { name: 'Coal', amount: 70, unit: 'kg' }
    ]
  },
  drecko: {
    id: 'drecko',
    name: 'Drecko',
    maxSize: 8,
    caloriesPerCycle: 50,
    description: 'Wall-crawling critter that eats Mealwood plants. Shearing it yields fiber or plastic.',
    color: '#A8FF8C',
    spaceRequired: 12,
    eggsPerCycle: 0.11,
    inputs: [
      { name: 'Mealwood Plant', amount: 1, unit: 'plant' }
    ],
    outputs: [
      { name: 'Phosphorite', amount: 10, unit: 'kg' },
      { name: 'Reed Fiber / Plastic', amount: 0.4, unit: 'shear' }
    ]
  },
  shineBug: {
    id: 'shineBug',
    name: 'Shine Bug',
    maxSize: 8,
    caloriesPerCycle: 30, // BBQ/Omelette equivalent
    description: 'Generates decor and light. Eats Phosphorite.',
    color: '#FFFFA8',
    spaceRequired: 12,
    eggsPerCycle: 0.13,
    inputs: [
      { name: 'Phosphorite', amount: 0.14, unit: 'kg' }
    ],
    outputs: [
      { name: 'Light', amount: 1800, unit: 'lux' }
    ]
  },
  pip: {
    id: 'pip',
    name: 'Pip',
    maxSize: 8,
    caloriesPerCycle: 40,
    description: 'Cute, squirrel-like critter that plants seeds in natural tiles. Eats Arbor Trees.',
    color: '#DAA520',
    spaceRequired: 12,
    eggsPerCycle: 0.12,
    inputs: [
      { name: 'Arbor Tree Branches', amount: 0.25, unit: 'tree' }
    ],
    outputs: [
      { name: 'Dirt', amount: 20, unit: 'kg' }
    ]
  },
  pacu: {
    id: 'pacu',
    name: 'Pacu',
    maxSize: 8,
    caloriesPerCycle: 200,
    description: 'Aquatic fish that replicates extremely fast and produces high-quality calories.',
    color: '#7FBFFF',
    spaceRequired: 8, // pool liquid tiles
    eggsPerCycle: 0.9,
    inputs: [
      { name: 'Algae', amount: 140, unit: 'kg' }
    ],
    outputs: [
      { name: 'Polluted Dirt', amount: 70, unit: 'kg' }
    ]
  }
};

export const DUPLICANT_STATS = {
  o2PerCycle: 60, // kg
  caloriesPerCycle: 1000,
};
