from gltest import get_contract_factory
from gltest.assertions import tx_execution_succeeded


def test_honing_bench_consensus():
    factory = get_contract_factory("Whetstone")
    contract = factory.deploy(args=[])  # deployer opens the bench

    # Baseline: an empty bench, no attempts, nothing sealed.
    stats0 = contract.get_stats(args=[]).call()
    assert int(stats0["pieces"]) == 0
    assert int(stats0["attempts"]) == 0
    assert int(stats0["sealed"]) == 0

    # A maker forges a single piece toward a craft target (deterministic write).
    rc = contract.forge_piece(
        args=[
            "Haiku for first frost",
            "A traditional 5-7-5 English haiku about the first frost of autumn, with a "
            "concrete seasonal image and a quiet turn in the final line.",
        ]
    ).transact()
    assert tx_execution_succeeded(rc)

    listing = contract.get_pieces(args=[0]).call()
    assert len(listing) == 1
    piece_id = listing[0]["id"]
    assert listing[0]["status"] == "OPEN"
    assert int(listing[0]["best_score"]) == 0
    assert int(listing[0]["attempt_count"]) == 0
    assert listing[0]["attempts"] == []

    # The AI consensus write: the Master Assessor scores a refined draft.
    # Validators independently re-run and must agree on the score within the
    # tolerance band; the deterministic backstop then records the attempt.
    rc2 = contract.temper(
        args=[
            piece_id,
            "Hard rime at dawn\n"
            "silvers the last open rose\n"
            "the garden holds still",
        ]
    ).transact()
    assert tx_execution_succeeded(rc2)

    piece = contract.get_piece(args=[piece_id]).call()
    assert int(piece["attempt_count"]) == 1
    assert len(piece["attempts"]) == 1

    attempt = piece["attempts"][0]
    assert int(attempt["n"]) == 1
    assert 0 <= int(attempt["score"]) <= 100
    assert isinstance(attempt["flaws"], list)
    assert len(attempt["flaws"]) <= 3
    assert isinstance(attempt["directive"], str)
    assert isinstance(attempt["sealed"], bool)

    # best_score must reflect the landed attempt, and a seal must imply the
    # score cleared the bar.
    assert int(piece["best_score"]) == int(attempt["score"])
    if attempt["sealed"]:
        assert int(attempt["score"]) >= int(piece["bar"])
        assert piece["status"] == "SEALED"
    else:
        assert piece["status"] == "OPEN"

    # Stats must have advanced by exactly one attempt.
    stats1 = contract.get_stats(args=[]).call()
    assert int(stats1["pieces"]) == 1
    assert int(stats1["attempts"]) == 1
    assert int(stats1["sealed"]) == (1 if attempt["sealed"] else 0)

    print(
        f"\nASSESSOR SCORE: {attempt['score']}  "
        f"sealed={attempt['sealed']}  "
        f"flaws={attempt['flaws']}  "
        f"directive={attempt['directive']!r}"
    )
