
import requests
import json
from http.server import BaseHTTPRequestHandler
from concurrent.futures import ThreadPoolExecutor

# Golfzon API URLs
URLS = {
    "total": "https://fairway.golfzon.com/v2/tournament/ranks/rounds/total/3606/stroke?gender=0",
    "courseA": "https://fairway.golfzon.com/v2/tournament/ranks/courses/3607/stroke?gender=0",
    "courseB": "https://fairway.golfzon.com/v2/tournament/ranks/courses/3608/stroke?gender=0",
    "courseC": "https://fairway.golfzon.com/v2/tournament/ranks/courses/3609/stroke?gender=0"
}

def fetch_url(url):
    """Fetches data from a single URL and returns the JSON response."""
    try:
        response = requests.get(url)
        response.raise_for_status()  # Raise an exception for bad status codes
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"Error fetching {url}: {e}")
        return None
    except json.JSONDecodeError:
        print(f"Error decoding JSON from {url}")
        return {"error": "Failed to decode JSON", "url": url}

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        """Handles GET requests to the serverless function."""
        # Use ThreadPoolExecutor to fetch URLs in parallel
        with ThreadPoolExecutor(max_workers=len(URLS)) as executor:
            # Map each URL to the fetch_url function
            future_to_url = {executor.submit(fetch_url, url): key for key, url in URLS.items()}
            
            results = {}
            for future in future_to_url:
                key = future_to_url[future]
                try:
                    data = future.result()
                    results[key] = data
                except Exception as exc:
                    print(f'{key} generated an exception: {exc}')
                    results[key] = {"error": "Failed to fetch data"}

        # Send response
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*') # CORS Header
        self.end_headers()
        self.wfile.write(json.dumps(results).encode('utf-8'))
        return
