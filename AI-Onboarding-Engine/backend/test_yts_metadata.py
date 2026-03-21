import urllib.request
import urllib.parse
import re
import json

def fetch_yt_metadata(query):
    url = f"https://www.youtube.com/results?search_query={urllib.parse.quote(query)}"
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    html = urllib.request.urlopen(req).read().decode('utf-8')
    match = re.search(r'var ytInitialData = ({.*?});</script>', html)
    if match:
        data = json.loads(match.group(1))
        contents = data['contents']['twoColumnSearchResultsRenderer']['primaryContents']['sectionListRenderer']['contents'][0]['itemSectionRenderer']['contents']
        for item in contents:
            if 'videoRenderer' in item:
                vr = item['videoRenderer']
                
                title = vr.get('title', {}).get('runs', [{}])[0].get('text', '')
                vid = vr.get('videoId', '')
                channel = vr.get('ownerText', {}).get('runs', [{}])[0].get('text', '')
                views = vr.get('viewCountText', {}).get('simpleText', '')
                if not views and 'runs' in vr.get('viewCountText', {}):
                    views = "".join(r.get('text', '') for r in vr.get('viewCountText')['runs'])
                    
                published = vr.get('publishedTimeText', {}).get('simpleText', '')
                duration = vr.get('lengthText', {}).get('simpleText', '')
                
                print(f"Title: {title}")
                print(f"Channel: {channel}")
                print(f"Views: {views}")
                print(f"Published: {published}")
                print(f"Duration: {duration}")
                break

fetch_yt_metadata("react tutorial")
