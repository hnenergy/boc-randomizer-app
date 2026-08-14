# Development Playbook

This playbook assumes Windows, VS Code, Git, GitHub, Node.js LTS, and the Codex IDE extension.

## 1. Install or verify the local tools

1. Install Git for Windows.
2. Install Node.js LTS.
3. Open Visual Studio Code.
4. In VS Code Extensions, search for the official OpenAI Codex extension, install it, and sign in with ChatGPT.
5. If the Codex icon is hidden, open the Command Palette and run **Codex: Open Codex Sidebar**.
6. In a terminal, verify:

```bash
git --version
node --version
npm --version
```

## 2. Run the existing application before changing it

1. Unzip the project into the same stable parent directory where you keep your other repositories.
2. In VS Code, use **File → Open Folder** and select the unzipped `boc-randomizer-app` folder. Opening the repository folder directly ensures Codex receives the correct project context.
3. Open the integrated terminal and run:

```bash
npx serve .
```

4. Open the local URL printed in the terminal.
5. Verify one spin, refresh recovery, completion through Pick #1, and **Start New Draft**.
6. Use VS Code responsive/browser tools or resize the window for a preliminary mobile check. The final iPhone test happens after HTTPS deployment.

## 3. Put the project under source control

Copy the unzipped `boc-randomizer-app` folder into a stable development directory, open that folder in VS Code, and run:

```bash
git init
git add .
git commit -m "chore: preserve SpinOrder Draft Randomizer prototype"
```

Create an empty GitHub repository, then follow GitHub's displayed commands to add the remote and push. Do not commit from inside the ZIP.

## 4. Publish the unchanged application to Vercel

1. Create an empty GitHub repository.
2. Push the baseline commit using the commands GitHub displays.
3. In Vercel, select **Add New → Project** and import that GitHub repository.
4. Leave Framework Preset as **Other** for the current static application.
5. Leave the Root Directory at the repository root.
6. Do not add a build command, output directory, or environment variables.
7. Select **Deploy**.
8. Open the generated HTTPS URL and test the complete draft flow.
9. On iPhone, open the URL in Safari and test **Share → Add to Home Screen**.

Every later push to the connected production branch will create a new production deployment; feature branches and pull requests can receive preview URLs.

## 5. Learn the Codex working loop

Use one focused chat per feature. Before a large change, use Plan mode. Give Codex four things:

- Goal
- Relevant context/files
- Constraints
- Definition of done

Starter prompt:

```text
Read AGENTS.md, README.md, docs/PRODUCT_REQUIREMENTS.md, and docs/ROADMAP.md.
Plan Phase 1 only. Do not edit yet. Identify migration risks in the current
index.html and propose acceptance tests. Done when I have a reviewable plan
with small Git commits and exact verification commands.
```

Implementation prompt after approving the plan:

```text
Implement the first approved Phase 1 checklist item. Preserve current BOC
behavior. Add or update tests, run all relevant checks, review the diff, and
update docs/ROADMAP.md only for work that is verified. Stop after this one item.
```

Review every diff before accepting it. Create a Git commit at each stable checkpoint so changes can be recovered.

## 6. Migrate without losing the prototype

1. Create a branch:

```bash
git switch -c feat/nextjs-foundation
```

2. Ask Codex to inventory behavior in `index.html` and add characterization tests or a manual baseline checklist.
3. Create the Next.js application in a temporary sibling folder, then move the generated source into the repository without deleting the preserved prototype until parity is verified.
4. Port domain behavior before redesigning visuals.
5. Verify the BOC preset end-to-end.
6. Commit the migration and merge only after build/tests pass.

Do not combine migration, redesign, all new features, and deployment in one Codex prompt. Each roadmap checkbox should normally be its own task or small group of tightly coupled tasks.

## 7. Feature branch loop

For every feature:

```bash
git switch main
git pull --ff-only
git switch -c feat/short-feature-name
```

Then:

1. Ask Codex to plan the feature from the PRD.
2. Approve or correct assumptions.
3. Ask Codex to implement and test.
4. Inspect the app yourself.
5. Ask Codex to review uncommitted changes for bugs and requirement gaps.
6. Run the full verification suite.
7. Update the roadmap and commit.
8. Push and open a pull request.

Suggested commit style:

```text
feat: add event setup form
fix: prevent duplicate participant names
test: cover 25-name auto spin
docs: update phase 2 checklist
```

## 8. Standard verification

Once the Next.js toolchain exists:

```bash
npm run format:check
npm run lint
npm run typecheck
npm test
npm run build
npm run test:e2e
```

Also test manually:

- Chrome desktop
- iPhone-sized responsive viewport
- Real iPhone Safari on the HTTPS preview
- Keyboard-only flow
- Refresh mid-event
- Offline reload after first visit
- 2 names, 25 names, duplicates, blank rows, long names, malformed upload

## 9. Recommended implementation order

1. Run and verify the current static application
2. Repository and GitHub baseline
3. Vercel production deployment and real iPhone test
4. Product name and domain decision
5. Next.js/test foundation
6. BOC parity preset
7. Event builder
8. Randomization domain logic
9. Manual wheel
10. Auto mode
11. Local recovery
12. Results and sharing
13. Landing/use-case/trust pages
14. SEO and analytics
15. Custom-domain release
16. Traffic experiments
17. Ads after eligibility and traffic validation

## 10. Decisions requiring your approval

- Public brand and domain
- Visual identity/logo
- Whether rank direction is visible to every user or derived from presets
- Analytics provider
- Legal-policy text before launch
- Ad network and placements
- Whether automated email is worth adding after MVP

## 11. First development session

- [ ] Install/verify Git, Node.js LTS, and the Codex VS Code extension
- [ ] Unzip and open the repo folder—not the ZIP—in VS Code
- [ ] Run the static app locally and complete the baseline checks
- [ ] Initialize Git and commit the preserved prototype
- [ ] Create and connect a GitHub repository
- [ ] Import the GitHub repository into Vercel and deploy
- [ ] Test the Vercel URL on desktop and iPhone
- [ ] Record the live URL before starting enhancement work
