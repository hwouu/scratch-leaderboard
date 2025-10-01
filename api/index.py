import json
import requests
from http.server import BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs
from concurrent.futures import ThreadPoolExecutor

# API endpoints for each tournament stage
API_URLS = {
    "qualifying": {
        "total": "https://fairway.golfzon.com/v2/tournament/ranks/rounds/total/3609/stroke?gender=0&page=1&size=100",
        "courseA": "https://fairway.golfzon.com/v2/tournament/ranks/courses/3599/stroke?gender=0&page=1&size=100",
        "courseB": "https://fairway.golfzon.com/v2/tournament/ranks/courses/3600/stroke?gender=0&page=1&size=100",
        "courseC": "https://fairway.golfzon.com/v2/tournament/ranks/courses/3601/stroke?gender=0&page=1&size=100",
    },
    "32": {
        "brackets": "https://fairway.golfzon.com/v2/tournament/brackets/rounds/3610",
        "total": "https://fairway.golfzon.com/v2/tournament/ranks/rounds/total/3610/stroke?gender=0&page=1&size=100",
        "courseA": "https://fairway.golfzon.com/v2/tournament/ranks/courses/3611/stroke?gender=0&page=1&size=100",
        "courseB": "https://fairway.golfzon.com/v2/tournament/ranks/courses/3612/stroke?gender=0&page=1&size=100",
    },
    "16": {
        "brackets": "https://fairway.golfzon.com/v2/tournament/brackets/rounds/3613",
        "total": "https://fairway.golfzon.com/v2/tournament/ranks/rounds/total/3613/stroke?gender=0&page=1&size=100",
        "courseA": "https://fairway.golfzon.com/v2/tournament/ranks/courses/3614/stroke?gender=0&page=1&size=100",
        "courseB": "https://fairway.golfzon.com/v2/tournament/ranks/courses/3615/stroke?gender=0&page=1&size=100",
    },
    "8": {
        "brackets": "https://fairway.golfzon.com/v2/tournament/brackets/rounds/3616",
        "total": "https://fairway.golfzon.com/v2/tournament/ranks/rounds/total/3616/stroke?gender=0&page=1&size=100",
        "courseA": "https://fairway.golfzon.com/v2/tournament/ranks/courses/3617/stroke?gender=0&page=1&size=100",
        "courseB": "https://fairway.golfzon.com/v2/tournament/ranks/courses/3618/stroke?gender=0&page=1&size=100",
    },
    "4": {
        "brackets": "https://fairway.golfzon.com/v2/tournament/brackets/rounds/3619",
        "total": "https://fairway.golfzon.com/v2/tournament/ranks/rounds/total/3619/stroke?gender=0&page=1&size=100",
        "courseA": "https://fairway.golfzon.com/v2/tournament/ranks/courses/3620/stroke?gender=0&page=1&size=100",
        "courseB": "https://fairway.golfzon.com/v2/tournament/ranks/courses/3621/stroke?gender=0&page=1&size=100",
    },
    "final": {
        "brackets": "https://fairway.golfzon.com/v2/tournament/brackets/rounds/3622",
        "total": "https://fairway.golfzon.com/v2/tournament/ranks/rounds/total/3622/stroke?gender=0&page=1&size=100",
        "courseA": "https://fairway.golfzon.com/v2/tournament/ranks/courses/3623/stroke?gender=0&page=1&size=100",
        "courseB": "https://fairway.golfzon.com/v2/tournament/ranks/courses/3624/stroke?gender=0&page=1&size=100",
    },
    "third-place": {
        "brackets": "https://fairway.golfzon.com/v2/tournament/brackets/rounds/3625",
        "total": "https://fairway.golfzon.com/v2/tournament/ranks/rounds/total/3625/stroke?gender=0&page=1&size=100",
        "courseA": "https://fairway.golfzon.com/v2/tournament/ranks/courses/3626/stroke?gender=0&page=1&size=100",
        "courseB": "https://fairway.golfzon.com/v2/tournament/ranks/courses/3627/stroke?gender=0&page=1&size=100",
    },
}

def fetch_url(url):
    """Fetches data from a single URL and returns the JSON response."""
    if "_URL" in url:
        return {"error": "URL not configured for this stage yet."}
    try:
        response = requests.get(url)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"Error fetching {url}: {e}")
        return None
    except json.JSONDecodeError:
        print(f"Error decoding JSON from {url}")
        return {"error": "Failed to decode JSON", "url": url}

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        """Handles GET requests."""
        parsed_path = urlparse(self.path)
        query_components = parse_qs(parsed_path.query)
        stage = query_components.get("stage", ["qualifying"])[0]

        urls_to_fetch = API_URLS.get(stage)

        if not urls_to_fetch:
            self.send_response(404)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({"error": f"Stage '{stage}' not found"}).encode('utf-8'))
            return

        results = {}
        with ThreadPoolExecutor(max_workers=len(urls_to_fetch)) as executor:
            future_to_key = {executor.submit(fetch_url, url): key for key, url in urls_to_fetch.items()}
            for future in future_to_key:
                key = future_to_key[future]
                try:
                    data = future.result()
                    results[key] = data
                except Exception as exc:
                    print(f'{key} generated an exception: {exc}')
                    results[key] = {"error": "Failed to fetch data"}

        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(json.dumps(results).encode('utf-8'))
        return