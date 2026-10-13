/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Project } from '../types';

export const SEED_PROJECTS: Project[] = [
  {
    id: 1,
    no: '2026-009A',
    name: 'Parisian Hotel LZ',
    stage: 'DD',
    pm: 'Ricky',
    design: 'Kiu, Edison',
    dates: {
      dd: '2026-09-14',
      ddu: '2026-11-13',
      cd: '2026-12-15',
    },
    tasks: [
      { id: '1-1', t: 'DD submission - drawing, spec, report', d: 0 },
      { id: '1-2', t: 'Confirm room types with Aedas and SLA', d: 0 },
      { id: '1-3', t: 'Coordinate MEP riser penetration drawings', d: 1 },
    ],
    client: 'Sands China Ltd',
    notes: 'High-end guest room renovation package LZ-04',
  },
  {
    id: 2,
    no: '2026-013',
    name: 'Macau Botanic Garden',
    stage: 'SD',
    pm: 'Ricky',
    design: 'Andy, Kiu',
    dates: {
      sd: '2026-10-08',
      sdu: '2026-11-09',
      dd: '2027-01-10',
    },
    tasks: [
      { id: '2-1', t: '50% SD botanical biome envelope review', d: 1 },
      { id: '2-2', t: '100% SD landscape concept signoff', d: 0 },
      { id: '2-3', t: 'Soil depth calculation & drainage strategy', d: 0 },
    ],
    client: 'Municipal Affairs Bureau (IAM)',
    notes: 'Public conservatory glass biome & botanical reserve',
  },
  {
    id: 3,
    no: '2026-014',
    name: 'Venetian Family Suite',
    stage: 'SD',
    pm: 'Kiu',
    design: 'Kiu, Edison',
    dates: {
      sd: '2026-10-11',
      sdu: '2026-11-12',
      dd: '2026-12-20',
    },
    tasks: [
      { id: '3-1', t: '50% SD AV input & acoustic lining details', d: 1 },
      { id: '3-2', t: '100% SD suite layouts & mockup review', d: 0 },
      { id: '3-3', t: 'FF&E sample board approval', d: 0 },
    ],
    client: 'Venetian Macao Resort',
    notes: 'Phase 2 family suites conversion (120 keys)',
  },
  {
    id: 4,
    no: '2026-017',
    name: 'Central Waterfront Pavilion',
    stage: 'CD',
    pm: 'Andy',
    design: 'Ricky, Kiu',
    dates: {
      sd: '2026-06-20',
      dd: '2026-08-15',
      cd: '2026-10-24',
      cdu: '2026-11-20',
      con: '2027-02-01',
    },
    tasks: [
      { id: '4-1', t: 'Final tender drawings package issue', d: 1 },
      { id: '4-2', t: 'Structural steel joint verification with Arup', d: 1 },
      { id: '4-3', t: 'Curtain wall performance mock-up review', d: 0 },
    ],
    client: 'Civil Engineering Dept',
    notes: 'Civic timber-steel hybrid waterfront public pavilion',
  },
  {
    id: 5,
    no: '2026-021',
    name: 'Taipa Heritage Library',
    stage: 'CN',
    pm: 'Edison',
    design: 'Andy',
    dates: {
      cn: '2026-10-18',
      cnu: '2026-11-05',
      sd: '2026-12-10',
    },
    tasks: [
      { id: '5-1', t: 'Heritage conservation boundary baseline survey', d: 1 },
      { id: '5-2', t: 'Massing options presentation for Cultural Affairs', d: 0 },
    ],
    client: 'Cultural Affairs Bureau',
    notes: 'Adaptive reuse of colonial heritage depot into public library',
  },
  {
    id: 6,
    no: '2026-005',
    name: 'Cotai Tower Interior Refurb',
    stage: 'Construction',
    pm: 'Ricky',
    design: 'Edison',
    dates: {
      cd: '2026-05-10',
      cdu: '2026-06-18',
      con: '2026-09-01',
    },
    tasks: [
      { id: '6-1', t: 'Site inspection & weekly contractor coordination', d: 1 },
      { id: '6-2', t: 'RFI response batch #14 on atrium claddings', d: 1 },
      { id: '6-3', t: 'Defect snagging on levels 12-18', d: 0 },
    ],
    client: 'Melco Resorts',
    notes: 'Active site construction stage with fast-track fitout',
  },
];
