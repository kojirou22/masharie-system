import json
import urllib.request
import urllib.error
import os

# Read .env directly with Python to avoid terminal truncation
with open(r"C:\Users\User\Documents\masharie\.env") as f:
    env = {}
    for line in f:
        line = line.strip()
        if "=" in line:
            key, value = line.split("=", 1)
            env[key.strip()] = value.strip()

supabase_url = env.get("NEXT_PUBLIC_SUPABASE_URL", "")
publishable_key = env.get("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "")
anon_key = env.get("NEXT_PUBLIC_SUPABASE_ANON_KEY", "")
service_key = env.get("service_role", "")

print(f"URL: {supabase_url}")
print(f"Publishable key length: {len(publishable_key)}")
print(f"Anon key length: {len(anon_key)}")
print(f"Service key length: {len(service_key)}")

# Test with publishable key
print("\n=== Test with publishable key ===")
url = f"{supabase_url}/rest/v1/projects?select=*&limit=2"
req = urllib.request.Request(url, headers={
    "apikey": publishable_key,
    "Authorization": f"Bearer {publishable_key}",
})
try:
    with urllib.request.urlopen(req, timeout=10) as resp:
        data = json.loads(resp.read().decode())
        print(f"  SUCCESS: {len(data)} projects")
except urllib.error.HTTPError as e:
    body = e.read().decode() if e.fp else ""
    print(f"  FAILED: HTTP {e.code} - {body[:200]}")

# Test with service role key
print("\n=== Test with service role key ===")
url = f"{supabase_url}/rest/v1/projects?select=*&limit=2"
req = urllib.request.Request(url, headers={
    "apikey": service_key,
    "Authorization": f"Bearer {service_key}",
})
try:
    with urllib.request.urlopen(req, timeout=10) as resp:
        data = json.loads(resp.read().decode())
        print(f"  SUCCESS: {len(data)} projects")
except urllib.error.HTTPError as e:
    body = e.read().decode() if e.fp else ""
    print(f"  FAILED: HTTP {e.code} - {body[:200]}")
