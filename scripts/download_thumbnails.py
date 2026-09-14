import json
import os
import sys
import argparse
from pathlib import Path
import urllib.request
import urllib.error

# Ensure stdout and stderr support UTF-8 on Windows
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8")

DEFAULT_BASE_URL = "https://gmsp-api-dev.novagroup.vn/api"
DEFAULT_JSON_PATH = Path(__file__).resolve().parent.parent / "mock-data" / "projects.json"
DEFAULT_OUTPUT_DIR = Path(__file__).resolve().parent.parent / "downloaded_images"

def download_file(url: str, save_path: Path, timeout: int = 15) -> bool:
    """Download a single file from url to save_path."""
    try:
        req = urllib.request.Request(
            url,
            headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"}
        )
        with urllib.request.urlopen(req, timeout=timeout) as response:
            if response.status == 200:
                save_path.parent.mkdir(parents=True, exist_ok=True)
                with open(save_path, "wb") as f:
                    f.write(response.read())
                return True
            else:
                print(f"[-] HTTP {response.status} when downloading {url}")
                return False
    except urllib.error.HTTPError as e:
        print(f"[-] HTTP Error {e.code} for {url}: {e.reason}")
        return False
    except urllib.error.URLError as e:
        print(f"[-] URL Error for {url}: {e.reason}")
        return False
    except Exception as e:
        print(f"[-] Unexpected error downloading {url}: {e}")
        return False


def main():
    parser = argparse.ArgumentParser(
        description="Download project thumbnail images from NovaGroup API."
    )
    parser.add_argument(
        "--json",
        "-j",
        type=Path,
        default=DEFAULT_JSON_PATH,
        help=f"Path to projects.json (default: {DEFAULT_JSON_PATH})",
    )
    parser.add_argument(
        "--output",
        "-o",
        type=Path,
        default=DEFAULT_OUTPUT_DIR,
        help=f"Directory to save images (default: {DEFAULT_OUTPUT_DIR})",
    )
    parser.add_argument(
        "--base-url",
        "-b",
        type=str,
        default=DEFAULT_BASE_URL,
        help=f"Base API URL (default: {DEFAULT_BASE_URL})",
    )
    parser.add_argument(
        "--preserve-dirs",
        action="store_true",
        help="Preserve relative directory hierarchy of the thumbnail path (e.g. data/uploads/20260825/...)",
    )

    args = parser.parse_args()

    json_path: Path = args.json
    output_dir: Path = args.output
    base_url: str = args.base_url.rstrip("/")

    if not json_path.exists():
        print(f"[!] Error: File not found: {json_path}")
        sys.exit(1)

    with open(json_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    # Handle projects list format (either root array or object with 'result' field)
    projects = data.get("result", []) if isinstance(data, dict) else data
    if not isinstance(projects, list):
        print("[!] Error: Could not parse projects list from JSON.")
        sys.exit(1)

    print(f"[*] Found {len(projects)} projects in {json_path.name}")
    print(f"[*] Base URL: {base_url}")
    print(f"[*] Destination directory: {output_dir}")
    print("-" * 60)

    success_count = 0
    skipped_count = 0
    failed_count = 0

    for idx, proj in enumerate(projects, start=1):
        name = proj.get("name", f"Project #{proj.get('id', idx)}")
        thumbnail = proj.get("thumbnail")

        if not thumbnail or not isinstance(thumbnail, str):
            print(f"[{idx}/{len(projects)}] {name}: No thumbnail found. Skipping.")
            skipped_count += 1
            continue

        clean_path = thumbnail.lstrip("/")
        image_url = f"{base_url}/{clean_path}"

        if args.preserve_dirs:
            save_path = output_dir / clean_path
        else:
            filename = Path(clean_path).name
            save_path = output_dir / filename

        print(f"[{idx}/{len(projects)}] Downloading thumbnail for '{name}'...")
        print(f"    URL : {image_url}")
        print(f"    File: {save_path}")

        if download_file(image_url, save_path):
            file_size_kb = save_path.stat().st_size / 1024
            print(f"    [+] Saved successfully ({file_size_kb:.2f} KB)")
            success_count += 1
        else:
            failed_count += 1

        print()

    print("-" * 60)
    print(f"[Done] Success: {success_count} | Failed: {failed_count} | Skipped: {skipped_count}")


if __name__ == "__main__":
    main()
