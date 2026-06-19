import urllib.request
import json

# Read token from file
with open(r"C:\Users\User\Documents\masharie\.github_token") as f:
    token = f.read().strip()

req = urllib.request.Request(
    "https://api.github.com/user/repos",
    data=json.dumps({
        "name": "masharie-system",
        "description": "Next.js 16 project management dashboard for Shoun Almasharie",
        "private": False,
        "auto_init": False,
    }).encode(),
    headers={
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
        "Accept": "application/vnd.github.v3+json",
    },
    method="POST",
)

try:
    with urllib.request.urlopen(req, timeout=15) as resp:
        data = json.loads(resp.read().decode())
        print(f"Created: {data['full_name']}")
        print(f"URL: {data['html_url']}")
except urllib.error.HTTPError as e:
    body = e.read().decode()
    print(f"Error {e.code}: {body[:300]}")
