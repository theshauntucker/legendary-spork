const RESERVED = new Set<string>([
  "admin","administrator","root","support","help","team","staff","mod","moderator",
  "routinex","coda","bayda","login","signup","signin","signout","logout","dashboard",
  "home","inbox","feed","search","find","upload","analyze","analysis","score",
  "scores","trophy","trophies","privacy","terms","legal","about","contact","press",
  "api","auth","callback","webhook","cron","stripe","billing","payments","pricing",
  "events","event","competition","competitions","dance","cheer","studio","studios",
  "choreographer","choreographers","dancer","dancers","parent","parents","coach","coaches",
  "judge","judges","founder","owner","ceo","cto","shaun","tucker","verified",
  "diamond","platinum","gold","starter","founding","me","myself","you","your",
  "u","us","ourselves","settings","preferences","notifications","security","password",
  "reset","verify","verification","delete","undefined","null","true","false","new",
  "edit","create","update","remove","explore","discover","trending","featured",
  "profile","profiles","avatar","aura","auras","follow","followers","following",
  "block","blocked","report","reports","ban","banned","abuse","spam","test",
  "tests","staging","dev","development","prod","production","localhost","example",
  "demo","sample","placeholder","anonymous","anon","guest","public","private",
  "system","service","api-key","key","token","secret","password123","changeme",
  "app","apps","mobile","web","www","mail","email","noreply","no-reply","notify",
  "bot","bots","ai","claude","anthropic","openai","chatgpt","gpt",
  "venmo","cashapp","paypal","zelle","apple","google","facebook","instagram","tiktok",
  "twitter","x","youtube","snap","discord","slack","sms","call","phone","number",
  "all","none","any","every","most","best","top","worst","beta","alpha",
  "pro","plus","premium","free","paid","trial","membership","member","subscribe",
  "subscription","store","shop","merch","merchandise","buy","sell","sale","offer",
  "promo","discount","coupon","gift","cards","pay","paid","refund","cancel","order",
  "orders","invoice","receipt","cart","checkout",
  "dance-mom","cheer-mom","dance-dad","cheer-dad","competition-mom","competition-dad",
  "schedule","calendar","events-team","newsletter","broadcast","announcement","announce",
  "official","verified-user","hot","fire","queen","king","prince","princess",
]);

const HANDLE_RE = /^[a-zA-Z][a-zA-Z0-9_]{2,19}$/;

export type HandleCheck =
  | { valid: true }
  | { valid: false; reason: string };

export function validateHandle(raw: string): HandleCheck {
  const handle = raw.trim();
  if (!handle) return { valid: false, reason: "Enter a handle." };
  if (!HANDLE_RE.test(handle))
    return {
      valid: false,
      reason: "3–20 chars, letters/numbers/underscore only, must start with a letter.",
    };
  if (RESERVED.has(handle.toLowerCase()))
    return { valid: false, reason: "That handle is reserved." };
  return { valid: true };
}

export function normalizeHandle(raw: string) {
  return raw.trim();
}
