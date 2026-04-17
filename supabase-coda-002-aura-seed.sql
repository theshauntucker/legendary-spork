-- Coda migration 002: seed aura_catalog with 50 starter auras.
-- Safe to re-run via on conflict do update.

insert into public.aura_catalog (id, name, category, gradient_stops, unlock_tier, unlock_condition) values
-- warm
('sunset_mist','Sunset Mist','warm','["#FBBF24","#F97316","#EC4899"]','starter',null),
('coral_drift','Coral Drift','warm','["#FDBA74","#F472B6","#DB2777"]','starter',null),
('golden_hour','Golden Hour','warm','["#FEF3C7","#FBBF24","#D97706"]','starter',null),
('ember','Ember','warm','["#FCA5A5","#EF4444","#7F1D1D"]','starter',null),
('peach_fizz','Peach Fizz','warm','["#FED7AA","#FB923C","#EA580C"]','starter',null),
('rose_flame','Rose Flame','warm','["#FECDD3","#F43F5E","#881337"]','starter',null),
('saffron','Saffron','warm','["#FDE68A","#F59E0B","#B45309"]','starter',null),
('terracotta','Terracotta','warm','["#FCA5A5","#F97316","#92400E"]','starter',null),
('desert_bloom','Desert Bloom','warm','["#FBCFE8","#F472B6","#BE185D"]','starter',null),
('magma','Magma','warm','["#FBBF24","#DC2626","#450A0A"]','starter',null),
-- cool
('lagoon','Lagoon','cool','["#67E8F9","#22D3EE","#0E7490"]','starter',null),
('twilight','Twilight','cool','["#C4B5FD","#818CF8","#3730A3"]','starter',null),
('glacier','Glacier','cool','["#E0F2FE","#7DD3FC","#0369A1"]','starter',null),
('mint_breeze','Mint Breeze','cool','["#A7F3D0","#34D399","#065F46"]','starter',null),
('violet_haze','Violet Haze','cool','["#DDD6FE","#A855F7","#6B21A8"]','starter',null),
('ocean_deep','Ocean Deep','cool','["#38BDF8","#2563EB","#1E1B4B"]','starter',null),
('sea_foam','Sea Foam','cool','["#CFFAFE","#22D3EE","#155E75"]','starter',null),
('steel_iris','Steel Iris','cool','["#A5B4FC","#6366F1","#312E81"]','starter',null),
('aurora_north','Aurora North','cool','["#86EFAC","#22D3EE","#7C3AED"]','starter',null),
('periwinkle','Periwinkle','cool','["#E0E7FF","#818CF8","#4338CA"]','starter',null),
-- jewel
('ruby','Ruby','jewel','["#FECACA","#DC2626","#450A0A"]','starter',null),
('sapphire','Sapphire','jewel','["#93C5FD","#1D4ED8","#172554"]','starter',null),
('emerald','Emerald','jewel','["#86EFAC","#059669","#064E3B"]','starter',null),
('amethyst','Amethyst','jewel','["#C4B5FD","#7C3AED","#4C1D95"]','starter',null),
('topaz','Topaz','jewel','["#FDE68A","#F59E0B","#78350F"]','starter',null),
('garnet','Garnet','jewel','["#FDA4AF","#BE123C","#4C0519"]','starter',null),
('citrine','Citrine','jewel','["#FEF3C7","#EAB308","#713F12"]','starter',null),
('tanzanite','Tanzanite','jewel','["#A5B4FC","#6D28D9","#1E1B4B"]','starter',null),
('aquamarine','Aquamarine','jewel','["#A5F3FC","#0891B2","#164E63"]','starter',null),
('peridot','Peridot','jewel','["#D9F99D","#84CC16","#365314"]','starter',null),
-- mono
('ink','Ink','mono','["#71717A","#27272A","#09090B"]','starter',null),
('pearl','Pearl','mono','["#FAFAFA","#E4E4E7","#A1A1AA"]','starter',null),
('graphite','Graphite','mono','["#D4D4D8","#52525B","#18181B"]','starter',null),
('oyster','Oyster','mono','["#F5F5F4","#A8A29E","#57534E"]','starter',null),
('onyx','Onyx','mono','["#52525B","#18181B","#000000"]','starter',null),
-- rare
('prism','Prism','rare','["#FF6B6B","#C084FC","#67E8F9"]','gold','Hit Gold'),
('iridescent','Iridescent','rare','["#F0ABFC","#67E8F9","#FDE68A"]','gold','Hit Gold'),
('nebula','Nebula','rare','["#F472B6","#7C3AED","#1E1B4B"]','gold','Hit Gold'),
('holographic','Holographic','rare','["#FBCFE8","#C4B5FD","#67E8F9"]','platinum','Hit Platinum'),
('quartz_spark','Quartz Spark','rare','["#FDE68A","#F472B6","#A78BFA"]','platinum','Hit Platinum'),
('aurora_veil','Aurora Veil','rare','["#86EFAC","#F0ABFC","#67E8F9"]','platinum','Hit Platinum'),
('titan_gold','Titan Gold','rare','["#FEF08A","#F59E0B","#7C2D12"]','platinum','Hit Platinum'),
('celestial','Celestial','rare','["#C4B5FD","#F0ABFC","#FEF3C7"]','diamond','Hit Diamond'),
('meteor','Meteor','rare','["#FDA4AF","#F0ABFC","#1E1B4B"]','diamond','Hit Diamond'),
('diamond_flare','Diamond Flare','rare','["#F0ABFC","#67E8F9","#FEF3C7"]','diamond','Hit Diamond'),
-- founding
('founding_gold','Founding Gold','founding','["#FEF3C7","#F59E0B","#7C2D12"]','starter','Founding Member'),
('founding_rose','Founding Rose','founding','["#FECDD3","#F43F5E","#881337"]','starter','Founding Member'),
('founding_ink','Founding Ink','founding','["#C4B5FD","#7C3AED","#1E1B4B"]','starter','Founding Member'),
('founding_mint','Founding Mint','founding','["#A7F3D0","#10B981","#064E3B"]','starter','Founding Member'),
('founding_prism','Founding Prism','founding','["#F0ABFC","#67E8F9","#FDE68A"]','starter','Founding Member')
on conflict (id) do update set
  name = excluded.name,
  category = excluded.category,
  gradient_stops = excluded.gradient_stops,
  unlock_tier = excluded.unlock_tier,
  unlock_condition = excluded.unlock_condition;
