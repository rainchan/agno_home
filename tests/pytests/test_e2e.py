from runner.run import eval_auth_01, eval_auth_01_v2, eval_auth_02, eval_ctrl_02, eval_state_01, main
import pytest
from urllib.error import HTTPError


def test_auth_01():
    out = eval_auth_01()
    assert out['passed'] is True
    assert out['elapsed'] <= 1.0

def test_auth_01_v2():
    out = eval_auth_01_v2()
    assert out['passed'] is True
    assert out['elapsed'] <= 1.0

def test_auth_02():
    out = eval_auth_02()
    assert out['passed'] is True
    assert out['elapsed'] <= 2.0

def test_auth_02_error_brand():
    # 触发不支持品牌错误
    import json, time
    from urllib import request
    t0 = time.time()
    data = json.dumps({ 'brand': 'unknown', 'state': 'abcdefgh', 'code': 'auth_code_123' }).encode('utf-8')
    req = request.Request('http://mock-oauth:8080/oauth/callback', data=data, headers={'Content-Type': 'application/json'})
    with pytest.raises(HTTPError):
        request.urlopen(req)


def test_ctrl_02():
    out = eval_ctrl_02()
    assert out['passed'] is True


def test_state_01():
    out = eval_state_01()
    assert out['passed'] is True


def test_main_runs():
    # 覆盖主流程与报告写入路径
    main()
