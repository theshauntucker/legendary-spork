import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function DELETE() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const serviceClient = await createServiceClient();

    const { data: videos } = await serviceClient
      .from("videos")
      .select("storage_path, thumbnail_path")
      .eq("user_id", user.id);

    if (videos && videos.length > 0) {
      const paths = videos
        .flatMap((v) => [v.storage_path, v.thumbnail_path])
        .filter(Boolean);
      if (paths.length > 0) {
        await serviceClient.storage.from("frames").remove(paths);
      }
    }

    const { error } = await serviceClient.auth.admin.deleteUser(user.id);

    if (error) {
      console.error("Account deletion failed:", error.message);
      return NextResponse.json(
        { error: "Failed to delete account" },
        { status: 500 }
      );
    }

    return NextResponse.json({ deleted: true });
  } catch (err) {
    console.error("Account deletion error:", err);
    return NextResponse.json(
      { error: "Failed to delete account" },
      { status: 500 }
    );
  }
}
