from runner.run import eval_auth_01, eval_auth_01_v2, eval_ctrl_02, eval_state_01, main


def test_auth_01():
    out = eval_auth_01()
    assert out['passed'] is True
    assert out['elapsed'] <= 1.0

def test_auth_01_v2():
    out = eval_auth_01_v2()
    assert out['passed'] is True
    assert out['elapsed'] <= 1.0


def test_ctrl_02():
    out = eval_ctrl_02()
    assert out['passed'] is True


def test_state_01():
    out = eval_state_01()
    assert out['passed'] is True


def test_main_runs():
    # 覆盖主流程与报告写入路径
    main()
