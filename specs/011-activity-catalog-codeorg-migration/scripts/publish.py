"""Publish the migrated activity-catalog drafts in code.org/sandbox.

Publishes exactly the entities enumerated in migration_inventory.json
(written by the pre-batch survey), in dependency order: assets -> link
entries -> activity entries. Skips anything already published. Reports and
continues on per-item validation failures.
"""

import json

from cma import *

inv = json.load(open("migration_inventory.json"))


def publish(kind, ids):
    done = skipped = 0
    failures = []
    for xid in sorted(ids):
        path = code(f"/{kind}/{xid}")
        cur = get(path)
        sys_ = cur["sys"]
        if sys_.get("publishedVersion") and sys_["version"] == sys_["publishedVersion"] + 1:
            skipped += 1
            continue
        try:
            guarded_write(
                "PUT",
                path + "/published",
                None,
                {"X-Contentful-Version": str(sys_["version"])},
            )
            done += 1
        except RuntimeError as e:
            failures.append((xid, str(e)[:300]))
    return done, skipped, failures


all_failures = []
for kind, ids, label in (
    ("assets", inv["asset_ids"], "assets"),
    ("entries", inv["link_ids"], "link entries"),
    ("entries", inv["published_ids"], "activity entries"),
):
    done, skipped, failures = publish(kind, ids)
    all_failures.extend(failures)
    print(f"{label}: published={done} already-published={skipped} failed={len(failures)}")

if all_failures:
    print("FAILURES:")
    for xid, msg in all_failures:
        print(" ", xid, msg)
else:
    print("ALL PUBLISHED CLEANLY")
