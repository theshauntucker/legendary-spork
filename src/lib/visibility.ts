export type Visibility = "public" | "followers" | "studio" | "private";

export const VISIBILITY_OPTIONS: { value: Visibility; label: string; helper: string }[] = [
  { value: "public", label: "Public", helper: "Anyone, logged in or not." },
  { value: "followers", label: "Followers", helper: "Only accounts that follow you." },
  { value: "studio", label: "Studio", helper: "Only members of your studio." },
  { value: "private", label: "Private", helper: "Only you can see this." },
];

export type ViewerContext = {
  viewerProfileId: string | null;
  viewerStudioId: string | null;
  followingOwnerIds: Set<string>;
};

export type OwnedItem = {
  ownerProfileId: string;
  ownerStudioId: string | null;
  visibility: Visibility;
};

export function canView(item: OwnedItem, viewer: ViewerContext): boolean {
  if (item.visibility === "public") return true;
  if (!viewer.viewerProfileId) return false;
  if (item.ownerProfileId === viewer.viewerProfileId) return true;
  if (item.visibility === "followers") {
    return viewer.followingOwnerIds.has(item.ownerProfileId);
  }
  if (item.visibility === "studio") {
    return !!item.ownerStudioId && item.ownerStudioId === viewer.viewerStudioId;
  }
  return false;
}
