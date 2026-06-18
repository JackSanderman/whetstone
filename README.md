# WHETSTONE

An on-chain AI craft-honing bench, built on GenLayer.

A whetstone does not finish your work for you. It gives an honest edge back to
whatever you press against it. This dApp is the same idea, made on-chain: you
forge a single piece toward a stated craft target, then press draft after draft
against a Master Assessor who scores the craftsmanship and tells you, plainly,
where the edge is still dull. The piece locks for good only when a draft clears
the seal bar and beats every attempt before it.

There is no leaderboard, no token to farm, no busywork. Just stock, an edge, and
a verdict you can trust because no single assessor gets to decide it alone.

---

## Why this needs consensus

Scoring craftsmanship is a judgment call, and a judgment call from one model is
just an opinion. WHETSTONE turns it into a settlement.

When you temper a draft, the leader runs the Master Assessor prompt and proposes
a score. Every validator then re-runs the same assessment independently and the
network only accepts the result if their scores agree inside a tolerance band.
The flaws and the directive are leader flavor for the maker to read; the number
that moves your piece is the one the whole bench stands behind.

That is the line between the parts:

- The contract owns the state transition that matters: the anchored score, the
  ordered lineage, the seal decision, and the running tallies.
- The browser owns everything else: the wallet, the kinetic bench, the live
  reads, and the consensus theater you watch while validators deliberate.

## The honing loop

1. **Forge** a piece. Name it, set the craft target, and it opens at zero.
2. **Temper** a draft. The Master Assessor scores it 0 to 100 against the target
   and returns up to three flaws plus one directive for the next pass.
3. **Anchor** the score. Validators re-score and must agree within tolerance.
4. **Seal** the piece. A draft that clears the bar (default 85) and beats the
   prior best locks the lineage immutable, and the amber stamp lands.

Drafts are capped at 600 characters. The assessor is hardened against prompt
injection: anything in a target or draft that tries to dictate its own score is
treated as a defect and scored low.

## Contract surface

| Method | Kind | What it does |
| --- | --- | --- |
| `forge_piece(title, craft_target)` | write | Open a new piece at score zero |
| `temper(piece_id, draft)` | write, AI | Score a draft under consensus, extend the lineage, maybe seal |
| `get_pieces(start)` | view | Page of full piece records, newest first |
| `get_piece(piece_id)` | view | One piece record, or empty if unknown |
| `get_stats()` | view | Running counts: pieces, attempts, sealed |

## Working on it locally

The repository has two halves: a GenVM Python contract and a static Next.js
frontend.

Contract checks:

```bash
genvm-lint check contracts/contract.py --json
gltest tests/integration/ -v -s --network studionet
```

Frontend, from `frontend/`:

```bash
npm install
npm run dev      # local development
npm run build    # static export to out/
node ../scripts/no-emoji.js
```

The frontend ships as a static export with `basePath: /whetstone`, so it runs
on GitHub Pages with no server and no secrets. The deployer key lives only in
the repository-root `.env` at deploy time and never reaches the bundle.

## Design notes

The screen is a workbench, not a card wall. A slim vertical tool-rail holds the
mark and the wallet. The active piece dominates the page as a giant kinetic
score numeral riding a seal-bar spine, so the live chain data is the hero. Each
attempt is a horizontal row in a climbing timeline, with a score-delta chip and
a mini meter. Whetstone blue marks live honing; amber is held in reserve for the
single moment a piece seals.

---

```ini
live      = https://jacksanderman.github.io/whetstone/
contract  = 0x7C077de2eAE9a6ac9c6F6088b7cD1eCddE63C293
network   = GenLayer Bradbury Testnet (chainId 4221 / 0x107D)
explorer  = https://explorer-bradbury.genlayer.com/address/0x7C077de2eAE9a6ac9c6F6088b7cD1eCddE63C293
deploy_tx = 0xb0c2e6dc7ea9c8d34470a3c6b299d2f68c26d29f85d0a97d4a66ea35faadf496
faucet    = https://testnet-faucet.genlayer.foundation/
```
