import urllib.request
import re
import json

def fetch_yt_videos(query, limit=3):
    url = f"https://www.youtube.com/results?search_query={urllib.parse.quote(query)}"
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    try:
        html = urllib.request.urlopen(req).read().decode('utf-8')
        # Find ytInitialData
        match = re.search(r'var ytInitialData = ({.*?});</script>', html)
        if match:
            data = json.loads(match.group(1))
            videos = []
            contents = data['contents']['twoColumnSearchResultsRenderer']['primaryContents']['sectionListRenderer']['contents'][0]['itemSectionRenderer']['contents']
            for item in contents:
                if 'videoRenderer' in item:
                    vr = item['videoRenderer']
                    videos.append({
                        'title': vr['title']['runs'][0]['text'],
                        'youtube_id': vr['videoId'],
                        'url': f"https://www.youtube.com/watch?v={vr['videoId']}",
                        'type': 'video'
                    })
                    if len(videos) >= limit:
                        break
            return videos
    except Exception as e:
        print(f"Error: {e}")
    return []

print(json.dumps(fetch_yt_videos("bootstrap tutorial"), indent=2))
