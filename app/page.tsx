import { redirect } from "next/navigation";
import { isAdmin, signIn, signOut } from "@/lib/auth";
import { addQuote, listQuotes, removeQuote, setQuoteEnabled, type Channel } from "@/lib/quotes";

export const dynamic = "force-dynamic";

export default async function Home() {
  if (!(await isAdmin())) return <Login />;
  const quotes = await listQuotes();

  async function add(formData: FormData) {
    "use server";
    await addQuote({
      text: String(formData.get("text") ?? ""),
      channel: String(formData.get("channel")) === "plain" ? "plain" : "widget",
      enabled: formData.get("enabled") === "on",
      startsAt: String(formData.get("startsAt") ?? ""),
      endsAt: String(formData.get("endsAt") ?? "")
    });
    redirect("/");
  }

  async function toggle(formData: FormData) {
    "use server";
    await setQuoteEnabled(String(formData.get("id")), formData.get("enabled") === "true");
    redirect("/");
  }

  async function deleteQuote(formData: FormData) {
    "use server";
    await removeQuote(String(formData.get("id")));
    redirect("/");
  }

  async function logout() {
    "use server";
    await signOut();
    redirect("/");
  }

  return <main>
    <header><div><p className="eyebrow">PROJECT ISTIQAMAH</p><h1>Wigy</h1><p>Daily text for your widgets.</p></div><form action={logout}><button className="subtle">Sign out</button></form></header>
    <section className="card"><h2>Add text</h2><form action={add} className="editor">
      <label>Text<textarea name="text" maxLength={100} required placeholder="A short reminder or quote..." /></label>
      <label>Widget<select name="channel"><option value="widget">Widget reminder</option><option value="plain">Plain text widget</option></select></label>
      <label>Start showing (optional)<input name="startsAt" type="datetime-local" /></label>
      <label>Stop showing (optional)<input name="endsAt" type="datetime-local" /></label>
      <label className="check"><input name="enabled" type="checkbox" defaultChecked /> Active</label>
      <button>Add text</button>
    </form></section>
    <section className="card"><h2>Saved text <span>{quotes.length}</span></h2>{quotes.length === 0 ? <p className="muted">Add your first text above. Wigy picks one active text per widget, consistently for each day.</p> : <div className="quotes">{quotes.map((quote) => <article key={quote.id}>
      <p>{quote.text}</p><small>{quote.channel === "widget" ? "Widget reminder" : "Plain text"} · {quote.enabled ? "Active" : "Inactive"}{quote.startsAt ? ` · starts ${new Date(quote.startsAt).toLocaleString()}` : ""}{quote.endsAt ? ` · ends ${new Date(quote.endsAt).toLocaleString()}` : ""}</small>
      <div><form action={toggle}><input type="hidden" name="id" value={quote.id} /><input type="hidden" name="enabled" value={String(!quote.enabled)} /><button className="subtle">{quote.enabled ? "Disable" : "Enable"}</button></form><form action={deleteQuote}><input type="hidden" name="id" value={quote.id} /><button className="danger">Delete</button></form></div>
    </article>)}</div>}</section>
    <section className="endpoints"><h2>Put these in the iPhone app</h2><code>https://YOUR-WIGY-URL/api/widget-reminder</code><code>https://YOUR-WIGY-URL/api/plain-widget-text</code></section>
  </main>;
}

function Login() {
  async function login(formData: FormData) {
    "use server";
    if (!(await signIn(String(formData.get("password") ?? "")))) redirect("/?error=1");
    redirect("/");
  }
  return <main className="login"><section className="card"><p className="eyebrow">PROJECT ISTIQAMAH</p><h1>Wigy</h1><p className="muted">Sign in to manage your widget text.</p><form action={login}><label>Password<input name="password" type="password" required autoFocus /></label><button>Sign in</button></form></section></main>;
}
