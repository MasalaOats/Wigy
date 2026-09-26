import { Redis } from "@upstash/redis";

export type Channel = "widget" | "plain";

export type Quote = {
  id: string;
  text: string;
  channel: Channel;
  enabled: boolean;
  startsAt?: string;
  endsAt?: string;
  createdAt: string;
};

const quoteKey = "wigy:quotes";

function storageConfig() {
  // The direct Upstash integration supplies UPSTASH_* variables; Vercel's
  // Marketplace connector commonly supplies the equivalent KV_* names.
  // Bracket access intentionally defers lookup to the server runtime. This
  // avoids Next.js replacing a value that was absent at build time.
  const env = (name: string) => process.env[name];
  const url = env("UPSTASH_REDIS_REST_URL") ?? env("KV_REST_API_URL");
  const token = env("UPSTASH_REDIS_REST_TOKEN") ?? env("KV_REST_API_TOKEN");
  return { url, token };
}

export function storageStatus() {
  const { url, token } = storageConfig();
  return { configured: Boolean(url && token), hasURL: Boolean(url), hasToken: Boolean(token) };
}

function redis() {
  const { url, token } = storageConfig();
  if (!url || !token) {
    throw new Error("Wigy storage is not configured.");
  }
  return new Redis({ url, token });
}

export function normalizeText(value: string) {
  return value.replace(/\s+/g, " ").trim().slice(0, 100);
}

export async function listQuotes(): Promise<Quote[]> {
  return ((await redis().get<Quote[]>(quoteKey)) ?? []).sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt)
  );
}

async function saveQuotes(quotes: Quote[]) {
  await redis().set(quoteKey, quotes);
}

export async function addQuote(input: Omit<Quote, "id" | "createdAt">) {
  const text = normalizeText(input.text);
  if (!text) throw new Error("Enter quote text.");
  const quote: Quote = {
    ...input,
    text,
    startsAt: input.startsAt || undefined,
    endsAt: input.endsAt || undefined,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString()
  };
  const quotes = await listQuotes();
  await saveQuotes([...quotes, quote]);
}

export async function setQuoteEnabled(id: string, enabled: boolean) {
  await saveQuotes((await listQuotes()).map((quote) =>
    quote.id === id ? { ...quote, enabled } : quote
  ));
}

export async function removeQuote(id: string) {
  await saveQuotes((await listQuotes()).filter((quote) => quote.id !== id));
}

function isAvailable(quote: Quote, now: Date) {
  const time = now.getTime();
  return quote.enabled &&
    (!quote.startsAt || new Date(quote.startsAt).getTime() <= time) &&
    (!quote.endsAt || new Date(quote.endsAt).getTime() >= time);
}

function dailyIndex(date: string, count: number) {
  let value = 0;
  for (const character of date) value = (value * 31 + character.charCodeAt(0)) >>> 0;
  return value % count;
}

export async function textFor(channel: Channel, now = new Date()) {
  const options = (await listQuotes()).filter((quote) => quote.channel === channel && isAvailable(quote, now));
  if (!options.length) return channel === "widget" ? "Keep showing up." : "";
  return options[dailyIndex(now.toISOString().slice(0, 10), options.length)].text;
}
