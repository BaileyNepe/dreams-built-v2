export type Task = {
  id: number;
  name: string;
  startDate: string; // e.g. "2025-03-10"
  endDate: string; // e.g. "2025-03-12"
  color: string;
};

export type LaneTask = Task & {
  lane: number;
};
