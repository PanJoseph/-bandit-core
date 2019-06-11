export const circularSample = [
  {
    dependsOn: [
      {
        active: true,
        behavior: true,
        name: 'depends2',
        priority: 1
      }
    ],
    metadata: {},
    name: 'depends1',
    probability: 100,
    type: 'dependent'
  },
  {
    dependsOn: [
      {
        active: true,
        behavior: true,
        name: 'depends1',
        priority: 2
      }
    ],
    metadata: {},
    name: 'depends2',
    probability: 100,
    type: 'dependent'
  }
];

export const fixedSample = [
  {
    metadata: {
      persist: false
    },
    name: 'normal1',
    probability: 100,
    type: 'normal'
  },
  {
    metadata: {
      persist: false
    },
    name: 'normal2',
    probability: 0,
    type: 'normal'
  },
  {
    metadata: {},
    name: 'multi',
    type: 'multivariant',
    variants: [
      { name: 'v1', probability: 100 },
      { name: 'v2', probability: 0 },
      { name: 'v3', probability: 0 }
    ]
  },
  {
    dependsOn: [
      {
        active: true,
        behavior: false,
        name: 'depends2',
        priority: 1
      }
    ],
    metadata: {},
    name: 'depends',
    probability: 100,
    type: 'dependent'
  },
  {
    dependsOn: [
      {
        active: false,
        behavior: true,
        name: 'normal2',
        priority: 1
      }
    ],
    metadata: {},
    name: 'depends2',
    probability: 100,
    type: 'dependent'
  },
  {
    dependsOn: [
      {
        active: false,
        behavior: false,
        name: 'depends',
        priority: 1
      }
    ],
    metadata: {},
    name: 'depends3',
    probability: 100,
    type: 'dependent'
  },
  {
    metadata: {},
    name: 'multi',
    type: 'dependentMultivariant',
    variants: [
      {
        dependsOn: [
          {
            active: true,
            behavior: true,
            name: 'depends2',
            priority: 1
          }
        ],
        name: 'v4',
        probability: 100
      },
      { name: 'v5', probability: 0 },
      { name: 'v6', probability: 0 }
    ]
  }
];

export const fullSample = [
  {
    metadata: {
      persist: false
    },
    name: 'normal1',
    probability: 100,
    type: 'normal'
  },
  {
    metadata: {},
    name: 'multi',
    type: 'multivariant',
    variants: [
      { name: 'v1', probability: 10 },
      { name: 'v2', probability: 0 },
      { name: 'v3', probability: 40 }
    ]
  },
  {
    dependsOn: [
      {
        active: true,
        behavior: true,
        name: 'v1',
        priority: 1
      },
      {
        active: false,
        behavior: false,
        name: 'v2',
        priority: 1
      }
    ],
    metadata: {},
    name: 'depends',
    probability: 100,
    type: 'dependent'
  }
];
