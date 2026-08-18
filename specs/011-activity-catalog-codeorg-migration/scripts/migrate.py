"""Port CSforAll activity-catalog content into the Code.org sandbox env.

Read-only against the CSforAll space; writes (drafts only, never published)
into code.org/sandbox via cma.guarded_write. Idempotent: existing targets are
skipped, so reruns continue where the last run stopped.

Usage: python3 migrate.py pilot|batch|verify
"""

import sys
import time

from cma import *

CATALOG_TAGS = {"hour-of-ai", "hour-of-code"}


def fetch_source():
    entries = get_all(
        csfa("/entries?content_type=curriculum&metadata.tags.sys.id[in]=hour-of-ai,hour-of-code"),
        sep="&",
    )
    byid = {e["sys"]["id"]: e for e in entries}
    published = sorted(
        (e for e in byid.values() if e["sys"].get("publishedAt")),
        key=lambda e: e["sys"]["id"],
    )
    link_ids, asset_ids = set(), set()
    for e in published:
        for fld in ("primaryLinkRef", "secondaryLinkRef"):
            ref = e["fields"].get(fld, {}).get("en-US")
            if ref:
                link_ids.add(ref["sys"]["id"])
        img = e["fields"].get("image", {}).get("en-US")
        if img:
            asset_ids.add(img["sys"]["id"])
    return published, sorted(link_ids), sorted(asset_ids)


def fetch_by_ids(kind, ids):
    out = {}
    for i in range(0, len(ids), 50):
        chunk = ",".join(ids[i : i + 50])
        d = req("GET", csfa(f"/{kind}?sys.id[in]={chunk}&limit=100"))
        for x in d.get("items", []):
            out[x["sys"]["id"]] = x
    missing = [i for i in ids if i not in out]
    if missing:
        raise RuntimeError(f"source {kind} missing: {missing}")
    return out


def target_exists(path):
    try:
        get(path)
        return True
    except RuntimeError as e:
        if "404" in str(e):
            return False
        raise


def port_asset(asset):
    aid = asset["sys"]["id"]
    if target_exists(code(f"/assets/{aid}")):
        return "skip"
    f = asset["fields"]
    file_info = f["file"]["en-US"]
    payload = {
        "fields": {
            "title": f.get("title", {"en-US": file_info.get("fileName", aid)}),
            **({"description": f["description"]} if f.get("description") else {}),
            "file": {
                "en-US": {
                    "contentType": file_info["contentType"],
                    "fileName": file_info["fileName"],
                    "upload": "https:" + file_info["url"],
                }
            },
        }
    }
    created = guarded_write("PUT", code(f"/assets/{aid}"), payload)
    guarded_write(
        "PUT",
        code(f"/assets/{aid}/files/en-US/process"),
        None,
        {"X-Contentful-Version": str(created["sys"]["version"])},
    )
    return "created"


def wait_processed(asset_ids, timeout=180):
    pending = set(asset_ids)
    deadline = time.time() + timeout
    while pending and time.time() < deadline:
        for aid in sorted(pending):
            a = get(code(f"/assets/{aid}"))
            if a["fields"].get("file", {}).get("en-US", {}).get("url"):
                pending.discard(aid)
        if pending:
            time.sleep(3)
    return pending


def port_entry(entry, content_type):
    eid = entry["sys"]["id"]
    if target_exists(code(f"/entries/{eid}")):
        return "skip"
    fields = {k: v for k, v in entry["fields"].items() if k != "publishedDate"}
    payload = {"fields": fields}
    tags = [
        t
        for t in entry.get("metadata", {}).get("tags", [])
        if t["sys"]["id"] in CATALOG_TAGS
    ]
    if tags:
        payload["metadata"] = {"tags": tags}
    guarded_write(
        "PUT",
        code(f"/entries/{eid}"),
        payload,
        {"X-Contentful-Content-Type": content_type},
    )
    return "created"


def verify_entities(source_map, kind, drop_fields=()):
    """Byte-exact compare of source vs sandbox fields (and catalog tags)."""
    bad = []
    for sid, src in sorted(source_map.items()):
        tgt = get(code(f"/{kind}/{sid}"))
        want = {k: v for k, v in src["fields"].items() if k not in drop_fields}
        got = {k: v for k, v in tgt["fields"].items() if k not in drop_fields}
        if kind == "assets":
            # upload URL becomes a processed file entry; compare metadata only
            for d in (want, got):
                fi = d.get("file", {}).get("en-US", {})
                d["file"] = {
                    "en-US": {
                        "contentType": fi.get("contentType"),
                        "fileName": fi.get("fileName"),
                        "processed": bool(fi.get("url")),
                    }
                }
            want["file"]["en-US"]["processed"] = True  # required of target
        if want != got:
            bad.append((sid, "fields"))
            continue
        if kind == "entries":
            want_tags = sorted(
                t["sys"]["id"]
                for t in src.get("metadata", {}).get("tags", [])
                if t["sys"]["id"] in CATALOG_TAGS
            )
            got_tags = sorted(
                t["sys"]["id"] for t in tgt.get("metadata", {}).get("tags", [])
            )
            if want_tags != got_tags:
                bad.append((sid, "tags"))
                continue
        if tgt["sys"].get("publishedAt"):
            bad.append((sid, "unexpectedly published"))
    return bad


def run(pilot_only):
    activities, link_ids, asset_ids = fetch_source()
    if pilot_only:
        activities = activities[:1]
        a = activities[0]["fields"]
        link_ids = [
            a[f]["en-US"]["sys"]["id"]
            for f in ("primaryLinkRef", "secondaryLinkRef")
            if a.get(f, {}).get("en-US")
        ]
        asset_ids = (
            [a["image"]["en-US"]["sys"]["id"]] if a.get("image", {}).get("en-US") else []
        )
    links = fetch_by_ids("entries", link_ids)
    assets = fetch_by_ids("assets", asset_ids)

    stats = {"assets": {"created": 0, "skip": 0}, "links": {"created": 0, "skip": 0}, "activities": {"created": 0, "skip": 0}}
    for aid, asset in sorted(assets.items()):
        stats["assets"][port_asset(asset)] += 1
    pending = wait_processed(list(assets))
    if pending:
        print("ASSETS NOT PROCESSED:", sorted(pending))
    for lid, link in sorted(links.items()):
        stats["links"][port_entry(link, "link")] += 1
    for act in activities:
        stats["activities"][port_entry(act, "activity")] += 1
    print("port stats:", stats)

    print("verifying...")
    bad = []
    bad += verify_entities(assets, "assets")
    bad += verify_entities(links, "entries")
    bad += verify_entities({e["sys"]["id"]: e for e in activities}, "entries", drop_fields=("publishedDate",))
    print("verification:", "ALL EXACT" if not bad else f"MISMATCHES: {bad}")
    print(f"totals: activities={len(activities)} links={len(links)} assets={len(assets)}")
    return not bad


if __name__ == "__main__":
    mode = sys.argv[1] if len(sys.argv) > 1 else "pilot"
    ok = run(pilot_only=(mode == "pilot"))
    sys.exit(0 if ok else 1)
