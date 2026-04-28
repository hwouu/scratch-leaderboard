import os
import json
from urllib import request, error
from http.server import BaseHTTPRequestHandler
from concurrent.futures import ThreadPoolExecutor

# 대회 단계별 골프존 API URL 매핑
API_URLS = {
    # === 1st 골목대장 토너먼트 (2025) ===
    "qualifying": {
        "total": "https://fairway.golfzon.com/v2/tournament/ranks/rounds/total/11545/stroke?gender=0&page=1&size=50",
        "courseA": "https://fairway.golfzon.com/v2/tournament/ranks/courses/11546/stroke?gender=0&page=1&size=50",
        "courseB": "https://fairway.golfzon.com/v2/tournament/ranks/courses/11547/stroke?gender=0&page=1&size=50",
        "courseC": "https://fairway.golfzon.com/v2/tournament/ranks/courses/11548/stroke?gender=0&page=1&size=50",
        "info": "https://fairway.golfzon.com/v2/tournament/infos/11545"
    },
    "32": {
        "total": "https://fairway.golfzon.com/v2/tournament/ranks/rounds/total/11558/stroke?gender=0&page=1&size=50",
        "courseA": "https://fairway.golfzon.com/v2/tournament/ranks/courses/11559/stroke?gender=0&page=1&size=50",
        "courseB": "https://fairway.golfzon.com/v2/tournament/ranks/courses/11560/stroke?gender=0&page=1&size=50"
    },
    "16": {
        "total": "https://fairway.golfzon.com/v2/tournament/ranks/rounds/total/11561/stroke?gender=0&page=1&size=50",
        "courseA": "https://fairway.golfzon.com/v2/tournament/ranks/courses/11562/stroke?gender=0&page=1&size=50",
        "courseB": "https://fairway.golfzon.com/v2/tournament/ranks/courses/11563/stroke?gender=0&page=1&size=50"
    },
    "8": {
        "total": "https://fairway.golfzon.com/v2/tournament/ranks/rounds/total/11564/stroke?gender=0&page=1&size=50",
        "courseA": "https://fairway.golfzon.com/v2/tournament/ranks/courses/11565/stroke?gender=0&page=1&size=50",
        "courseB": "https://fairway.golfzon.com/v2/tournament/ranks/courses/11566/stroke?gender=0&page=1&size=50"
    },
    "4": {
        "total": "https://fairway.golfzon.com/v2/tournament/ranks/rounds/total/11567/stroke?gender=0&page=1&size=50",
        "courseA": "https://fairway.golfzon.com/v2/tournament/ranks/courses/11568/stroke?gender=0&page=1&size=50",
        "courseB": "https://fairway.golfzon.com/v2/tournament/ranks/courses/11569/stroke?gender=0&page=1&size=50"
    },
    "final": {
        "total": "https://fairway.golfzon.com/v2/tournament/ranks/rounds/total/11570/stroke?gender=0&page=1&size=50",
        "courseA": "https://fairway.golfzon.com/v2/tournament/ranks/courses/11571/stroke?gender=0&page=1&size=50",
        "courseB": "https://fairway.golfzon.com/v2/tournament/ranks/courses/11572/stroke?gender=0&page=1&size=50"
    },

    # === 2nd 골목대장 토너먼트 (2025) ===
    "2nd-qualifying": {
        "total": "https://fairway.golfzon.com/v2/tournament/ranks/rounds/total/12530/stroke?gender=0&page=1&size=50",
        "courseA": "https://fairway.golfzon.com/v2/tournament/ranks/courses/12531/stroke?gender=0&page=1&size=50",
        "courseB": "https://fairway.golfzon.com/v2/tournament/ranks/courses/12532/stroke?gender=0&page=1&size=50",
        "courseC": "https://fairway.golfzon.com/v2/tournament/ranks/courses/12533/stroke?gender=0&page=1&size=50",
        "info": "https://fairway.golfzon.com/v2/tournament/infos/12530"
    },
    "2nd-64": {
        "total": "https://fairway.golfzon.com/v2/tournament/ranks/rounds/total/12534/stroke?gender=0&page=1&size=100",
        "courseA": "https://fairway.golfzon.com/v2/tournament/ranks/courses/12535/stroke?gender=0&page=1&size=100",
        "courseB": "https://fairway.golfzon.com/v2/tournament/ranks/courses/12536/stroke?gender=0&page=1&size=100"
    },
    "2nd-32": {
        "total": "https://fairway.golfzon.com/v2/tournament/ranks/rounds/total/12537/stroke?gender=0&page=1&size=50",
        "courseA": "https://fairway.golfzon.com/v2/tournament/ranks/courses/12538/stroke?gender=0&page=1&size=50",
        "courseB": "https://fairway.golfzon.com/v2/tournament/ranks/courses/12539/stroke?gender=0&page=1&size=50"
    },
    "2nd-16": {
        "total": "https://fairway.golfzon.com/v2/tournament/ranks/rounds/total/12540/stroke?gender=0&page=1&size=50",
        "courseA": "https://fairway.golfzon.com/v2/tournament/ranks/courses/12541/stroke?gender=0&page=1&size=50",
        "courseB": "https://fairway.golfzon.com/v2/tournament/ranks/courses/12542/stroke?gender=0&page=1&size=50"
    },
    "2nd-8": {
        "total": "https://fairway.golfzon.com/v2/tournament/ranks/rounds/total/12543/stroke?gender=0&page=1&size=50",
        "courseA": "https://fairway.golfzon.com/v2/tournament/ranks/courses/12544/stroke?gender=0&page=1&size=50",
        "courseB": "https://fairway.golfzon.com/v2/tournament/ranks/courses/12545/stroke?gender=0&page=1&size=50"
    },
    "2nd-4": {
        "total": "https://fairway.golfzon.com/v2/tournament/ranks/rounds/total/12546/stroke?gender=0&page=1&size=50",
        "courseA": "https://fairway.golfzon.com/v2/tournament/ranks/courses/12547/stroke?gender=0&page=1&size=50",
        "courseB": "https://fairway.golfzon.com/v2/tournament/ranks/courses/12548/stroke?gender=0&page=1&size=50"
    },
    "2nd-final": {
        "total": "https://fairway.golfzon.com/v2/tournament/ranks/rounds/total/12549/stroke?gender=0&page=1&size=50",
        "courseA": "https://fairway.golfzon.com/v2/tournament/ranks/courses/12550/stroke?gender=0&page=1&size=50",
        "courseB": "https://fairway.golfzon.com/v2/tournament/ranks/courses/12551/stroke?gender=0&page=1&size=50"
    },

    # === 4th Open 대회 (2025.12 ~ 2026.01) ===
    "4th-open": {
        "total": "https://fairway.golfzon.com/v2/tournament/ranks/rounds/total/12711/stroke?gender=0&page=1&size=100",
        "courseA": "https://fairway.golfzon.com/v2/tournament/ranks/courses/12712/stroke?gender=0&page=1&size=100",
        "courseB": "https://fairway.golfzon.com/v2/tournament/ranks/courses/12713/stroke?gender=0&page=1&size=100",
        "courseC": "https://fairway.golfzon.com/v2/tournament/ranks/courses/12714/stroke?gender=0&page=1&size=100",
        "info": "https://fairway.golfzon.com/v2/tournament/infos/12711"
    },

    # === 2026 Scratch 1st OPEN 예선 ===
    "2026-1st-qualifying": {
        "total": "https://fairway.golfzon.com/v2/tournament/ranks/rounds/total/14843/stroke?gender=0&page=1&size=100",
        "courseA": "https://fairway.golfzon.com/v2/tournament/ranks/courses/14844/stroke?gender=0&page=1&size=100",
        "courseB": "https://fairway.golfzon.com/v2/tournament/ranks/courses/14845/stroke?gender=0&page=1&size=100",
        "courseC": "https://fairway.golfzon.com/v2/tournament/ranks/courses/14846/stroke?gender=0&page=1&size=100",
        "info": "https://fairway.golfzon.com/v2/tournament/infos/14843"
    },
    
    # === 2026 Scratch 1st OPEN 본선 토너먼트 ===
    "2026-1st-16": {
        "total": "https://fairway.golfzon.com/v2/tournament/ranks/rounds/total/14847/stroke?gender=0&page=1&size=50",
        "courseA": "https://fairway.golfzon.com/v2/tournament/ranks/courses/14848/stroke?gender=0&page=1&size=50",
        "courseB": "https://fairway.golfzon.com/v2/tournament/ranks/courses/14849/stroke?gender=0&page=1&size=50"
    },
    "2026-1st-8": {
        "total": "https://fairway.golfzon.com/v2/tournament/ranks/rounds/total/14850/stroke?gender=0&page=1&size=50",
        "courseA": "https://fairway.golfzon.com/v2/tournament/ranks/courses/14851/stroke?gender=0&page=1&size=50",
        "courseB": "https://fairway.golfzon.com/v2/tournament/ranks/courses/14852/stroke?gender=0&page=1&size=50"
    },
    "2026-1st-4": {
        "total": "https://fairway.golfzon.com/v2/tournament/ranks/rounds/total/14853/stroke?gender=0&page=1&size=50",
        "courseA": "https://fairway.golfzon.com/v2/tournament/ranks/courses/14854/stroke?gender=0&page=1&size=50",
        "courseB": "https://fairway.golfzon.com/v2/tournament/ranks/courses/14855/stroke?gender=0&page=1&size=50"
    },
    "2026-1st-third-place": {
        "total": "https://fairway.golfzon.com/v2/tournament/ranks/rounds/total/14859/stroke?gender=0&page=1&size=50",
        "courseA": "https://fairway.golfzon.com/v2/tournament/ranks/courses/14860/stroke?gender=0&page=1&size=50",
        "courseB": "https://fairway.golfzon.com/v2/tournament/ranks/courses/14861/stroke?gender=0&page=1&size=50"
    },
    "2026-1st-final": {
        "total": "https://fairway.golfzon.com/v2/tournament/ranks/rounds/total/14856/stroke?gender=0&page=1&size=50",
        "courseA": "https://fairway.golfzon.com/v2/tournament/ranks/courses/14857/stroke?gender=0&page=1&size=50",
        "courseB": "https://fairway.golfzon.com/v2/tournament/ranks/courses/14858/stroke?gender=0&page=1&size=50"
    },

    # === 대진표 API 호출 키 ===
    "2026-1st-bracket": {
        "bracket16": "https://fairway.golfzon.com/v2/tournament/brackets/rounds/14847",
        "bracket8": "https://fairway.golfzon.com/v2/tournament/brackets/rounds/14850",
        "bracket4": "https://fairway.golfzon.com/v2/tournament/brackets/rounds/14853",
        "bracket3rd": "https://fairway.golfzon.com/v2/tournament/brackets/rounds/14859",
        "bracketFinal": "https://fairway.golfzon.com/v2/tournament/brackets/rounds/14856"
    }
}

def fetch_url(url):
    req = request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    try:
        with request.urlopen(req) as response:
            data = json.loads(response.read().decode('utf-8'))
            # [수정] 골프존 API가 리스트(배열)로 바로 내려주는 경우 AttributeError를 방지
            if isinstance(data, dict):
                return data.get('data', data)
            return data
    except error.URLError as e:
        print(f"Error fetching {url}: {e}")
        return None
    except Exception as e:
        print(f"Unexpected error parsing {url}: {e}")
        return None

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        query_string = self.path.split('?')[1] if '?' in self.path else ''
        params = dict(qc.split('=') for qc in query_string.split('&') if '=' in qc)
        stage = params.get('stage', 'qualifying')

        if stage not in API_URLS:
            self.send_error(400, "Invalid stage")
            return

        urls = API_URLS[stage]
        results = {}

        # 병렬 처리로 API를 호출하여 성능을 최적화
        with ThreadPoolExecutor(max_workers=len(urls)) as executor:
            future_to_key = {executor.submit(fetch_url, url): key for key, url in urls.items()}
            for future in future_to_key:
                key = future_to_key[future]
                try:
                    results[key] = future.result()
                except Exception as exc:
                    print(f'{key} generated an exception: {exc}')
                    results[key] = None

        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(json.dumps(results).encode('utf-8'))