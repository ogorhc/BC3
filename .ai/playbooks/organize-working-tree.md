Create and follow a new playbook:

.ai/playbooks/organize-working-tree.md

Purpose:
Organize the current working tree into a dedicated branch and split changes into logical commits.

Context:
There are many uncommitted changes. The goal is to preserve all work, avoid losing changes, and create clean commits.

Steps:

1. Inspect the current branch.
2. Inspect git status and git diff.
3. Create a new branch named:
   chore/bc3-ai-workflow-setup

4. Analyze all modified, added and deleted files.
5. Group changes into logical commit groups, for example:
   - AI workflow setup
   - BC3 corpus/knowledge documentation
   - documentation reorganization
   - gitignore/private data rules
   - tooling/config changes

6. Before committing, show the proposed commit plan.
7. Do not discard or reset any change.
8. Do not stage private/sensitive files.
9. Respect .gitignore.
10. Ask before committing if any file looks sensitive or unrelated.
11. Use conventional commits.

Suggested commit messages:

- chore: add ai workflow structure
- docs: organize bc3 project knowledge
- docs: add bc3 corpus analysis notes
- chore: configure private data ignores
- chore: add opencode and cursor agent rules

After each commit:

- show committed files
- show remaining unstaged changes

At the end:

- show final git status
- recommend next PR title and description.
