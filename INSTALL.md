# Install

`sous-ds` works from a checkout today and is structured for publication once you attach it to a real remote and release flow.

---

## Local checkout

Clone or copy the repo onto the machine that runs your agent, then keep these files together:

- `SKILL.md`
- `DESIGN.md`
- `AGENTS.md`
- `ANIMATION_RULES.md`
- `TASTE_LOG.md`
- `design-tokens.json`
- `tokens.css`

For Codex, opening a project that includes these files is enough for the agent to read and follow the contract. For any agent that supports repo-backed skills, point it at the repo root so `SKILL.md` is the entrypoint.

---

## One-line scaffold installer

The repo now ships `install.sh` so the public install path is ready as soon as the remote is live:

```bash
curl -fsSL https://raw.githubusercontent.com/soheilolia/sous_ds/main/install.sh | bash
```

Until that public URL exists, run the same installer from a checkout:

```bash
bash ./install.sh
```

Set `SOUS_DS_INCLUDE_CI=1` when you also want `.github/workflows/design.yml` copied into the target repo.

---

## Verification

Run all three checks before treating a change as shippable:

```bash
npx --yes @google/design.md lint DESIGN.md
node scripts/lint.mjs components/ preview.html
npm run pack:check
```

---

## Publishing

The public one-liner only becomes true after you actually publish the package or mirror it to a real remote.

Target command after publication:

```bash
npx skills add soheilolia/sous_ds
```

Until that release exists, use the local checkout workflow above and keep the docs honest about the package state.
