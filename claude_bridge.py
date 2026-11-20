#!/usr/bin/env python3
"""Local server for Loss Arena with an "Ask Claude" bridge.

Serves this folder like `python3 -m http.server` and adds two endpoints that let
the in-app tutor talk to Claude through YOUR Claude Code login (Pro/Max plan
limits), so no API key is needed:

  GET  /api/ai/status   -> is the `claude` CLI installed and signed in?
  POST /api/ai/ask      -> streams the answer back as plain text

Run:   python3 claude_bridge.py        then open http://localhost:8731
Needs: Claude Code installed and signed in once (`claude`, then /login).

Only listens on 127.0.0.1 and only answers requests from this page, so other
websites cannot use your account through it.
"""
import http.server, json, os, shutil, subprocess, sys, tempfile, threading

PORT = int(os.environ.get("PORT", "8731"))
ROOT = os.path.dirname(os.path.abspath(__file__))
MODELS = {"opus", "sonnet", "haiku"}  # aliases resolve to the newest model of each family
MAX_BODY = 200_000
ALLOWED_ORIGINS = {f"http://localhost:{PORT}", f"http://127.0.0.1:{PORT}"}
SCRATCH = tempfile.mkdtemp(prefix="lossarena-ai-")  # empty cwd: Claude sees no project files

SYSTEM = """You are the study tutor inside "Exam Streamliner", an exam-practice app for Aalto University courses. \
The learner is revising under time pressure and wants answers they can take in at a glance.
- Be brief and to the point. Lead with the answer or key idea in ONE bold line.
- Then at most 3-5 short bullets (one line each, max ~15 words). No paragraphs longer than 2 sentences.
- No intros, no recaps, no "Great question", no closing offers. Skip anything not needed to understand.
- For a calculation: show only the key steps, one per line, ending with the result in bold.
- Use Markdown (bold, bullets, short code blocks). Write maths in plain text or Unicode \
(e.g. ŷ = w·x + b, Σ, ∂L/∂w, O(n log n)), never LaTeX.
- If the learner has NOT answered the current question yet, give a hint or the concept first; \
only give the final answer if they ask for it directly.
- If they already answered, say in one line why the right option is right, then one bullet per wrong option.
- Only go longer if the learner explicitly asks for more detail.
- Stay on the course topic. If unsure, say so instead of guessing."""


def claude_bin():
    return shutil.which("claude") or next(
        (p for p in [os.path.expanduser("~/.local/bin/claude"), "/opt/homebrew/bin/claude", "/usr/local/bin/claude"]
         if os.path.exists(p)), None)


def clean_env():
    env = dict(os.environ)
    # Make sure the CLI uses the claude.ai subscription login, never an API key that happens to be set.
    for k in ("ANTHROPIC_API_KEY", "ANTHROPIC_AUTH_TOKEN", "CLAUDE_CODE_USE_BEDROCK", "CLAUDE_CODE_USE_VERTEX"):
        env.pop(k, None)
    return env


def status():
    exe = claude_bin()
    if not exe:
        return {"ok": False, "reason": "not_installed"}
    try:
        out = subprocess.run([exe, "auth", "status"], capture_output=True, text=True, timeout=15, env=clean_env())
        info = json.loads(out.stdout or "{}")
    except Exception:
        info = {}
    if not info.get("loggedIn"):
        return {"ok": False, "reason": "not_logged_in"}
    return {"ok": True, "method": info.get("authMethod"), "plan": info.get("subscriptionType")}


def build_prompt(body):
    ctx = str(body.get("context") or "").strip()[:20000]
    msgs = [m for m in body.get("messages") or [] if isinstance(m, dict)][-16:]
    parts = []
    if ctx:
        parts.append("<what_the_learner_is_looking_at>\n" + ctx + "\n</what_the_learner_is_looking_at>")
    if len(msgs) > 1:
        convo = "\n\n".join(f"{'Learner' if m.get('role') == 'user' else 'Tutor'}: {str(m.get('content', ''))[:8000]}" for m in msgs[:-1])
        parts.append("<conversation_so_far>\n" + convo + "\n</conversation_so_far>")
    last = str(msgs[-1].get("content", "")) if msgs else ""
    parts.append("Learner's new message:\n" + last[:8000])
    return "\n\n".join(parts)


class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *a, **k):
        super().__init__(*a, directory=ROOT, **k)

    def log_message(self, fmt, *args):
        if self.path.startswith("/api/"):
            sys.stderr.write("%s - %s\n" % (self.log_date_time_string(), fmt % args))

    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        self.send_header("X-Content-Type-Options", "nosniff")
        self.send_header("X-Frame-Options", "DENY")
        self.send_header("Referrer-Policy", "no-referrer")
        self.send_header("Cross-Origin-Opener-Policy", "same-origin")
        self.send_header("Cross-Origin-Resource-Policy", "same-origin")
        super().end_headers()

    def _servable(self, path):
        # only the app itself: index.html, exam/, icon/ (never .git, README, backups, the bridge's own code)
        p = path.split("?")[0].split("#")[0]
        if p in ("/", "/index.html"):
            return True
        parts = [x for x in p.split("/") if x]
        return (len(parts) >= 2 and parts[0] in ("exam", "icon") and not any(x.startswith(".") or ".." in x for x in parts)
                and "%" not in p)

    def _same_origin(self):
        origin = self.headers.get("Origin")
        host = self.headers.get("Host", "")
        return host in {f"localhost:{PORT}", f"127.0.0.1:{PORT}"} and (origin is None or origin in ALLOWED_ORIGINS)

    def _json(self, code, obj):
        data = json.dumps(obj).encode()
        self.send_response(code)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)

    def do_GET(self):
        # Host check on every request blocks DNS-rebinding sites from reading anything through this server
        if self.headers.get("Host", "") not in {f"localhost:{PORT}", f"127.0.0.1:{PORT}"}:
            return self._json(403, {"error": "forbidden"})
        if self.path.split("?")[0] == "/api/ai/status":
            if not self._same_origin():
                return self._json(403, {"ok": False, "reason": "forbidden"})
            return self._json(200, status())
        if not self._servable(self.path):
            return self._json(404, {"error": "not found"})
        return super().do_GET()

    def do_HEAD(self):
        return self._json(405, {"error": "method not allowed"})

    def do_POST(self):
        if self.path != "/api/ai/ask":
            return self._json(404, {"error": "not found"})
        if not self._same_origin() or self.headers.get("Origin") is None \
                or not self.headers.get("Content-Type", "").startswith("application/json"):
            return self._json(403, {"error": "forbidden"})
        n = int(self.headers.get("Content-Length") or 0)
        if n <= 0 or n > MAX_BODY:
            return self._json(413, {"error": "request too large"})
        try:
            body = json.loads(self.rfile.read(n))
        except Exception:
            return self._json(400, {"error": "bad json"})
        model = body.get("model") if body.get("model") in MODELS else "sonnet"
        exe = claude_bin()
        if not exe:
            return self._json(503, {"error": "Claude Code is not installed on this computer."})

        cmd = [exe, "-p", "--model", model, "--tools", "", "--strict-mcp-config", "--setting-sources", "",
               "--no-session-persistence", "--system-prompt", SYSTEM,
               "--output-format", "stream-json", "--verbose", "--include-partial-messages"]
        proc = subprocess.Popen(cmd, cwd=SCRATCH, env=clean_env(), stdin=subprocess.PIPE,
                                stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, bufsize=1)
        threading.Thread(target=lambda: (proc.stdin.write(build_prompt(body)), proc.stdin.close()), daemon=True).start()

        self.send_response(200)
        self.send_header("Content-Type", "text/plain; charset=utf-8")
        self.send_header("X-Content-Type-Options", "nosniff")
        self.end_headers()
        self.close_connection = True
        sent = False
        try:
            for line in proc.stdout:
                try:
                    ev = json.loads(line)
                except ValueError:
                    continue
                t = ev.get("type")
                if t == "stream_event":
                    d = ev.get("event", {}).get("delta", {})
                    if d.get("type") == "text_delta" and d.get("text"):
                        self.wfile.write(d["text"].encode()); self.wfile.flush(); sent = True
                elif t == "result" and ev.get("is_error"):
                    msg = ev.get("result") or "Claude returned an error."
                    self.wfile.write(("\n\n⚠️ " + str(msg)).encode()); self.wfile.flush(); sent = True
            proc.wait(timeout=10)
            if not sent:
                err = (proc.stderr.read() or "").strip()[-400:]
                self.wfile.write(("⚠️ No answer came back. " + (err or "Is Claude Code signed in? Run `claude` once and use /login.")).encode())
        except (BrokenPipeError, ConnectionResetError):
            pass  # the learner pressed Stop or closed the page
        finally:
            if proc.poll() is None:
                proc.kill()


if __name__ == "__main__":
    try:
        srv = http.server.ThreadingHTTPServer(("127.0.0.1", PORT), Handler)
    except OSError:
        sys.exit(f"Port {PORT} is already in use: the game is probably already running, so just open http://localhost:{PORT}.\n"
                 f"To restart it, stop the other copy (Ctrl + C in its window, or `lsof -ti :{PORT} | xargs kill`), then run this again.")
    s = status()
    print(f"Exam Streamliner on http://localhost:{PORT}")
    print("Ask Claude: " + (f"connected ({s.get('method')}, {s.get('plan') or 'plan'})" if s["ok"]
                            else "Claude Code not ready (" + s["reason"] + "). Install it and run `claude` -> /login."))
    try:
        srv.serve_forever()
    except KeyboardInterrupt:
        pass
