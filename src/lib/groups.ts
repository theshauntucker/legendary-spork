import groupsData from "./groups.json";

export interface Group {
  name: string;
  slug: string;
  aliases: string[];
  religion: string;
  searchVolume: number;
}

export function getAllGroups(): Group[] {
  return groupsData as Group[];
}

export function getGroupBySlug(slug: string): Group | undefined {
  return groupsData.find((g: Group) => g.slug === slug);
}

export function getGroupsByReligion(religion: string): Group[] {
  return groupsData.filter((g: Group) => g.religion === religion);
}

export function getAllGroupSlugs(): string[] {
  return groupsData.map((g: Group) => g.slug);
}
