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
    # 2nd 토너먼트 URLs
    "2nd-qualifying": {
        "total": "https://fairway.golfzon.com/v2/tournament/ranks/rounds/total/7382/stroke?gender=0&page=1&size=100",
        "courseA": "https://fairway.golfzon.com/v2/tournament/ranks/courses/7383/stroke?gender=0&page=1&size=100",
        "courseB": "https://fairway.golfzon.com/v2/tournament/ranks/courses/7384/stroke?gender=0&page=1&size=100",
        "courseC": "https://fairway.golfzon.com/v2/tournament/ranks/courses/7385/stroke?gender=0&page=1&size=100",
    },
    "2nd-64": {
        "brackets": "https://fairway.golfzon.com/v2/tournament/brackets/rounds/7386",
        "total": "https://fairway.golfzon.com/v2/tournament/ranks/rounds/total/7386/stroke?gender=0&page=1&size=100",
        "courseA": "https://fairway.golfzon.com/v2/tournament/ranks/courses/7387/stroke?gender=0&page=1&size=100",
        "courseB": "https://fairway.golfzon.com/v2/tournament/ranks/courses/7388/stroke?gender=0&page=1&size=100",
    },
    "2nd-32": {
        "brackets": "https://fairway.golfzon.com/v2/tournament/brackets/rounds/7389",
        "total": "https://fairway.golfzon.com/v2/tournament/ranks/rounds/total/7389/stroke?gender=0&page=1&size=100",
        "courseA": "https://fairway.golfzon.com/v2/tournament/ranks/courses/7390/stroke?gender=0&page=1&size=100",
        "courseB": "https://fairway.golfzon.com/v2/tournament/ranks/courses/7391/stroke?gender=0&page=1&size=100",
    },
    "2nd-16": {
        "brackets": "https://fairway.golfzon.com/v2/tournament/brackets/rounds/7392",
        "total": "https://fairway.golfzon.com/v2/tournament/ranks/rounds/total/7392/stroke?gender=0&page=1&size=100",
        "courseA": "https://fairway.golfzon.com/v2/tournament/ranks/courses/7393/stroke?gender=0&page=1&size=100",
        "courseB": "https://fairway.golfzon.com/v2/tournament/ranks/courses/7394/stroke?gender=0&page=1&size=100",
    },
    "2nd-8": {
        "brackets": "https://fairway.golfzon.com/v2/tournament/brackets/rounds/7395",
        "total": "https://fairway.golfzon.com/v2/tournament/ranks/rounds/total/7395/stroke?gender=0&page=1&size=100",
        "courseA": "https://fairway.golfzon.com/v2/tournament/ranks/courses/7396/stroke?gender=0&page=1&size=100",
        "courseB": "https://fairway.golfzon.com/v2/tournament/ranks/courses/7397/stroke?gender=0&page=1&size=100",
    },
    "2nd-4": {
        "brackets": "https://fairway.golfzon.com/v2/tournament/brackets/rounds/7398",
        "total": "https://fairway.golfzon.com/v2/tournament/ranks/rounds/total/7398/stroke?gender=0&page=1&size=100",
        "courseA": "https://fairway.golfzon.com/v2/tournament/ranks/courses/7399/stroke?gender=0&page=1&size=100",
        "courseB": "https://fairway.golfzon.com/v2/tournament/ranks/courses/7400/stroke?gender=0&page=1&size=100",
    },
}

def fetch_url(url):
    """Fetches data from a single URL and returns the JSON response."""
    if "_URL" in url:
        return {"error": "URL not configured for this stage yet."}
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept': 'application/json, text/plain, */*',
            'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
            'Referer': 'https://fairway.golfzon.com/',
        }
        response = requests.get(url, headers=headers, timeout=15)
        response.raise_for_status()
        data = response.json()
        # 데이터가 비어있거나 예상과 다른 형식인지 확인
        if data is None:
            error_msg = f"Warning: Received None data from {url}"
            print(error_msg)
            return {"error": error_msg, "url": url}
        return data
    except requests.exceptions.Timeout:
        error_msg = f"Timeout error fetching {url}"
        print(error_msg)
        return {"error": error_msg, "url": url}
    except requests.exceptions.RequestException as e:
        status_code = e.response.status_code if hasattr(e, 'response') and e.response else 'N/A'
        response_text = e.response.text[:200] if hasattr(e, 'response') and e.response else 'N/A'
        error_msg = f"Error fetching {url}: {str(e)}"
        print(error_msg)
        print(f"Response status: {status_code}")
        print(f"Response text: {response_text}")
        return {"error": error_msg, "status_code": status_code, "url": url}
    except json.JSONDecodeError as e:
        error_msg = f"Error decoding JSON from {url}: {str(e)}"
        print(error_msg)
        return {"error": error_msg, "url": url}
    except Exception as e:
        error_msg = f"Unexpected error fetching {url}: {type(e).__name__}: {str(e)}"
        print(error_msg)
        return {"error": error_msg, "url": url}

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
        errors = []
        with ThreadPoolExecutor(max_workers=len(urls_to_fetch)) as executor:
            future_to_key = {executor.submit(fetch_url, url): key for key, url in urls_to_fetch.items()}
            for future in future_to_key:
                key = future_to_key[future]
                try:
                    data = future.result(timeout=20)
                    # 에러 응답인지 확인
                    if isinstance(data, dict) and "error" in data:
                        errors.append(f"{key}: {data.get('error', 'Unknown error')}")
                        results[key] = None
                        continue
                    # API 응답이 { items: [...] } 형태인 경우 items를 추출
                    if data and isinstance(data, dict) and "items" in data:
                        results[key] = data["items"]
                    else:
                        results[key] = data
                except Exception as exc:
                    error_msg = f'{key} generated an exception: {exc}'
                    print(error_msg)
                    errors.append(error_msg)
                    results[key] = None

        # 에러가 발생한 경우 로깅
        if errors:
            print(f"Errors occurred while fetching data for stage '{stage}':")
            for error in errors:
                print(f"  - {error}")

        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(json.dumps(results).encode('utf-8'))
        return