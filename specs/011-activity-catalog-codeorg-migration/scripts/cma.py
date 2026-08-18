"""Minimal Contentful CMA client for the activity-catalog migration."""

import json
import time
import urllib.request
import urllib.error

ENV_FILE = "/home/kal/projects/code-dot-org/marketing-sites/apps/marketing/.env"
BASE = "https://api.contentful.com"
CODE_SPACE = "90t6bu6vlf76"
CODE_ENV = "sandbox"  # writes go here ONLY
CSFA_SPACE = "27jkibac934d"  # read-only source


def _token():
    with open(ENV_FILE) as f:
        for line in f:
            if line.startswith("CONTENTFUL_MANAGEMENT_TOKEN="):
                return line.split("=", 1)[1].strip()
    raise RuntimeError("CMA token not found")


TOKEN = _token()


def req(method, path, body=None, headers=None, retries=5):
    url = BASE + path
    h = {
        "Authorization": f"Bearer {TOKEN}",
        "Content-Type": "application/vnd.contentful.management.v1+json",
    }
    if headers:
        h.update(headers)
    data = json.dumps(body).encode() if body is not None else None
    for attempt in range(retries):
        r = urllib.request.Request(url, data=data, headers=h, method=method)
        try:
            with urllib.request.urlopen(r) as resp:
                raw = resp.read()
                return json.loads(raw) if raw else {}
        except urllib.error.HTTPError as e:
            if e.code == 429 and attempt < retries - 1:
                wait = int(e.headers.get("X-Contentful-RateLimit-Reset", 1)) + 1
                time.sleep(wait)
                continue
            detail = e.read().decode()
            raise RuntimeError(f"{method} {path} -> {e.code}: {detail[:2000]}")
    raise RuntimeError("unreachable")


def get(path):
    return req("GET", path)


def get_all(path, sep="?"):
    """Paginate a CMA collection endpoint."""
    items, skip, total = [], 0, 1
    while len(items) < total:
        d = req("GET", f"{path}{sep}limit=100&skip={skip}")
        items.extend(d.get("items", []))
        total = d.get("total", 0)
        skip += 100
        if not d.get("items"):
            break
    return items


def csfa(path=""):
    return f"/spaces/{CSFA_SPACE}/environments/master{path}"


def code(path=""):
    return f"/spaces/{CODE_SPACE}/environments/{CODE_ENV}{path}"


# Safety: every write must target the code.org sandbox environment.
def guarded_write(method, path, body=None, headers=None):
    assert path.startswith(code()), f"refusing write outside code.org sandbox: {path}"
    return req(method, path, body, headers)
