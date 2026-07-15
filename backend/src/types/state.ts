type RestrictionLevel = 5 | 4 | 3 | 2 | 1 | 0;


export interface StateData {
  name: string;
  restrictionLevel: RestrictionLevel;
  restrictionFacts: string[];
  weeksBan: number;
  abbr: string;
}
