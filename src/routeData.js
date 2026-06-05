/* Route 1 map data — separated from the React component for Fast Refresh compatibility */

export const TILE_SIZE = 18

export const GRID_DEF = [
  'TTTTTTTTTTTT', // row 0
  'TGGWGGGGWGGT', // row 1
  'TGGWPPPPGGGT', // row 2
  'TGGGPGGPWGGT', // row 3
  'TGPPPGGPWGGT', // row 4
  'TGPWGGGPPPGT', // row 5
  'PPPGGGGGGPPP', // row 6  ← START (col 0), GOAL (col 11)
  'TTGGWWGGGGTT', // row 7
  'TTTTTTTTTTTT', // row 8
]

/* Winding path from START [0,6] → GOAL [11,6] — 20 waypoints */
export const ROUTE_PATH = [
  [0, 6], [1, 6], [2, 6],
  [2, 5], [2, 4],
  [3, 4], [4, 4],
  [4, 3], [4, 2],
  [5, 2], [6, 2], [7, 2],
  [7, 3], [7, 4], [7, 5],
  [8, 5], [9, 5],
  [9, 6], [10, 6], [11, 6],
]

/* Decorative flower positions (row-col as string keys) */
export const FLOWERS = new Set(['1-4', '1-7', '5-5', '6-4', '6-5', '6-6', '7-1'])
