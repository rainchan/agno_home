import json
import os
import time
import sys
from urllib import request, parse

def http_get(url):
    t0 = time.time()
    with request.urlopen(url) as resp:
        body = resp.read().decode('utf-8')
        t = time.time() - t0
        return json.loads(body), t

def http_post(url, payload):
    t0 = time.time()
    data = json.dumps(payload).encode('utf-8')
    req = request.Request(url, data=data, headers={'Content-Type': 'application/json'})
    with request.urlopen(req) as resp:
        body = resp.read().decode('utf-8')
        t = time.time() - t0
        return json.loads(body), t

def eval_auth_01():
    out = { 'id': 'TC-AUTH-01' }
    data, t = http_get('http://mock-oauth:8080/oauth/authorize?brand=midea')
    out['elapsed'] = t
    out['passed'] = isinstance(data.get('auth_url'), str) and data['auth_url'].startswith('https://') and t <= 1.0
    out['details'] = data
    return out

def eval_ctrl_02():
    out = { 'id': 'TC-CTRL-02' }
    payload = { 'domain': 'light', 'service': 'turn_on', 'payload': { 'entity_id': 'light.living_main', 'brightness_pct': 30 } }
    r1, _ = http_post('http://mock-mcp:8081/ha/call_service', payload)
    ok1 = r1.get('status') == 'ok' and isinstance(r1.get('trace_id'), str)
    r2, _ = http_get('http://mock-mcp:8081/ha/query_state?entity_id=light.living_main')
    ok2 = r2.get('state') == 'on' and r2.get('attributes', {}).get('brightness_pct') == 30
    out['passed'] = ok1 and ok2
    out['details'] = { 'call_service': r1, 'query_state': r2 }
    return out

def eval_state_01():
    out = { 'id': 'TC-STATE-01' }
    data, _ = http_get('http://mock-mcp:8081/ha/subscribe_events')
    out['passed'] = bool(data.get('subscribed'))
    out['details'] = data
    return out

def main():
    results = []
    results.append(eval_auth_01())
    results.append(eval_ctrl_02())
    results.append(eval_state_01())
    os.makedirs('/work/reports', exist_ok=True)
    with open('/work/reports/summary.json', 'w') as f:
        json.dump({ 'results': results }, f, ensure_ascii=False, indent=2)
    print(json.dumps({ 'results': results }, ensure_ascii=False))
    total = len(results)
    passed = sum(1 for r in results if r.get('passed'))
    if passed != total:
        sys.exit(1)

if __name__ == '__main__':
    main()
