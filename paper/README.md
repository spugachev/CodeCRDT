# CodeCRDT Research Paper

This directory contains the complete paper infrastructure for publishing CodeCRDT research on arXiv and submitting to conferences.

## Quick Start

```bash
# Build the paper PDF
make pdf

# View the paper
make view         # macOS
make view-linux   # Linux

# Prepare arXiv submission
make arxiv

# Check paper statistics
make stats
```

## Directory Structure

```
paper/
├── src/                          # LaTeX source files
│   ├── paper.tex                 # Main paper document
│   ├── abstract.tex              # Abstract (separate for reuse)
│   ├── acknowledgments.tex       # Acknowledgments
│   └── references.bib            # Bibliography database
├── figures/                      # Figures and diagrams (create as needed)
│   └── README.md                 # Figure guidance and placeholders
├── tables/                       # Tables (create as needed)
├── templates/                    # Conference-specific templates
│   ├── README.md                 # Template usage guide
│   └── conference-adaptation-guide.md
├── scripts/                      # Build and submission scripts
│   └── prepare-submission.sh     # Automated submission preparation
├── output/                       # Build artifacts (generated)
│   ├── paper.pdf                 # Compiled paper
│   ├── arxiv/                    # arXiv submission package
│   └── submission/               # Conference submission files
├── Makefile                      # Build system
└── README.md                     # This file
```

## Prerequisites

### Required

- **LaTeX distribution:**

  - macOS: [MacTeX](https://www.tug.org/mactex/) (3.9 GB)
  - Linux: `sudo apt-get install texlive-full`
  - Windows: [MiKTeX](https://miktex.org/)

- **Basic tools:** `pdflatex`, `bibtex`, `make`

### Optional (for enhanced features)

- `latexmk` - for watch mode
- `pandoc` - for HTML conversion
- `chktex` - for LaTeX syntax checking
- `texcount` - for word counting
- `aspell` - for spell checking
- `pdfinfo` - for PDF statistics

> The Makefile checks for these optional tools and prints a helpful warning instead of failing when one is missing.

### Installation (macOS)

```bash
# Install MacTeX (includes all LaTeX tools)
brew install --cask mactex

# Optional tools
brew install pandoc
brew install aspell
```

### Installation (Ubuntu/Debian)

```bash
# Install LaTeX
sudo apt-get install texlive-full

# Optional tools
sudo apt-get install latexmk pandoc aspell texlive-extra-utils
```

## Formatting

- Two-column layout with 0.75" margins mirrors top-tier arXiv/ACM styles while keeping the PDF under common submission limits.
- Typography stack (`times`, `microtype`) and float spacing tweaks yield dense yet readable pages.
- Custom helpers include `\keywords{...}` for metadata and a `\drafttrue` toggle that reveals `\todo{}` annotations.
- `\balance` keeps the bibliography columns even; adjust geometry or comment the call if a venue mandates single-column drafts.

## Building the Paper

### Standard Build

```bash
# Full build with bibliography
make pdf
```

This runs:

1. `pdflatex` - First pass (generates aux files)
2. `bibtex` - Process bibliography
3. `pdflatex` - Second pass (incorporate references)
4. `pdflatex` - Third pass (resolve cross-references)

Output: `output/paper.pdf`

### Quick Build

```bash
# Single pass (no bibliography updates)
make quick
```

Use for rapid iteration when not changing references.

### Watch Mode

```bash
# Auto-rebuild on file changes
make watch
```

Requires `latexmk`. Opens PDF viewer and rebuilds automatically when you save changes.

## Viewing the Paper

```bash
# macOS
make view

# Linux
make view-linux

# Or manually
open output/paper.pdf      # macOS
xdg-open output/paper.pdf  # Linux
```

## Paper Statistics

```bash
make stats
```

Shows:

- Word count (approximate)
- Page count
- Number of figures
- Number of tables
- Number of references

Example output:

```
Words in text: 5234
Pages: 12
Figures: 4
Tables: 2
References: 42
```

## Preparing Submissions

### arXiv Submission

```bash
make arxiv
```

Creates `output/arxiv-submission.tar.gz` containing:

- All LaTeX source files
- Bibliography
- All figures
- Compiled PDF

Upload this tarball to [https://arxiv.org/submit](https://arxiv.org/submit)

#### arXiv Categories

Suggested primary categories:

- **cs.SE** - Software Engineering
- **cs.AI** - Artificial Intelligence
- **cs.DC** - Distributed Computing
- **cs.PL** - Programming Languages

Secondary categories:

- **cs.LG** - Machine Learning
- **cs.HC** - Human-Computer Interaction

### Conference Submission

```bash
make conference
```

Creates `output/submission/paper-submission.pdf`

For conference-specific formats, see [templates/README.md](templates/README.md)

### Automated Submission Preparation

```bash
# Full preparation with validation
./scripts/prepare-submission.sh all

# arXiv only
./scripts/prepare-submission.sh arxiv

# Conference only
./scripts/prepare-submission.sh conference

# Check dependencies and validate
./scripts/prepare-submission.sh check
```

## Quality Checks

### Syntax Check

```bash
make check
```

Checks for common LaTeX errors and warnings.

### Spell Check

```bash
make spell
```

Interactive spell checking. Requires `aspell`.

### Word Count

```bash
make wordcount
```

Detailed word count by section.

## Validation

### Validate arXiv Package

```bash
make validate-arxiv
```

Verifies:

- All required files present
- Package size (should be < 10 MB for arXiv)
- File structure correct

## Cleaning

```bash
# Remove auxiliary files (keep PDF)
make clean

# Remove everything including PDF
make distclean
```

## Advanced Features

### Creating Diffs

```bash
# Compare with previous version
# 1. Copy old version to src/paper-old.tex
# 2. Run:
make diff
```

Creates `output/paper-diff.pdf` with changes highlighted.

### Extract Text

```bash
# Extract plain text from PDF
make text
```

Useful for checking content without LaTeX formatting.

### HTML Version

```bash
# Generate HTML version (requires pandoc)
./scripts/prepare-submission.sh all
```

Creates `output/paper.html` for web viewing.

## Editing Workflow

### Recommended Workflow

1. **Start watch mode:** `make watch`
2. **Edit in your favorite editor:**
   - VSCode with LaTeX Workshop extension
   - TeXShop (macOS)
   - TeXstudio (cross-platform)
   - Overleaf (online, if you prefer)
3. **Save and view:** PDF auto-updates
4. **Check before committing:**
   ```bash
   make check
   make spell
   make stats
   ```

### What to Edit

#### Main Content

- `src/paper.tex` - Main document with all sections

#### Separate Files

- `src/abstract.tex` - Abstract (reused for arXiv metadata)
- `src/acknowledgments.tex` - Acknowledgments
- `src/references.bib` - Bibliography entries

#### After Evaluation

Replace placeholder text with actual results:

- Section 6 (Results): Fill in performance numbers
- Tables: Add evaluation data
- Figures: Add plots from `evaluation/` results

## Common Issues

### Issue: "File not found"

**Solution:** Check that all `\input{}` paths are correct. Files should be relative to `src/` directory.

### Issue: Bibliography not showing

**Solution:** Run full build cycle:

```bash
make clean
make pdf
```

### Issue: Figures not appearing

**Solution:**

1. Ensure figures are in `figures/` directory
2. Use correct file extension (`.pdf` for vector, `.png` for raster)
3. Check LaTeX logs in `output/paper.log`

### Issue: "Overfull hbox" warnings

**Solution:** LaTeX warnings about text overflow. Usually cosmetic, but fix for final version:

- Reword sentences
- Add manual line breaks
- Adjust figure placement

### Issue: PDF not updating

**Solution:**

```bash
make distclean
make pdf
```

## Submission Checklist

### Before arXiv Submission

- [ ] All TODOs removed from paper
- [ ] Abstract < 250 words
- [ ] All figures have captions and are referenced in text
- [ ] All tables formatted correctly
- [ ] Bibliography complete and formatted
- [ ] Author information correct (name, affiliation, ORCID)
- [ ] Code/data availability statement included
- [ ] License specified (MIT for this project)
- [ ] Acknowledgments complete
- [ ] Run `make validate-arxiv`

### Before Conference Submission

- [ ] Paper meets page limit
- [ ] Uses correct conference template
- [ ] Anonymized if double-blind review
- [ ] Figures fit in two-column format
- [ ] Supplementary materials prepared (if applicable)
- [ ] Submission deadline noted
- [ ] PDF size < conference limit (usually 10-15 MB)

## Conference Adaptation

For adapting to specific conference formats:

1. Read [templates/conference-adaptation-guide.md](templates/conference-adaptation-guide.md)
2. Download conference template
3. Create directory in `templates/[conference-name]/`
4. Adapt content following the guide
5. Update Makefile with conference-specific target

Popular conferences:

- **NLP/AI:** ACL, NeurIPS, ICLR, EMNLP
- **Systems:** SOSP, OSDI, SIGCOMM
- **SE:** ICSE, FSE, ASE
- **PL:** PLDI, POPL, OOPSLA

## Tips for Academic Writing

### Structure

- **Abstract:** 150-250 words, summarize contributions
- **Introduction:** Motivation, key insight, contributions list
- **Evaluation:** Clear research questions, methodology, results
- **Related Work:** Can go before or after evaluation
- **Conclusion:** Brief summary, impact, future work

### Figures

- Vector graphics (PDF) when possible
- Minimum 8pt font size in figures
- Consistent color scheme
- Clear captions with figure interpretation

### Tables

- Use `\toprule`, `\midrule`, `\bottomrule` from `booktabs`
- Align numbers on decimal point
- Bold or highlight key results
- Keep tables simple and readable

### References

- Cite liberally but relevantly
- Include recent work (last 2-3 years)
- Cite both foundational and recent papers
- Use consistent citation style (author-year or numbered)

## Resources

### LaTeX Help

- [Overleaf Documentation](https://www.overleaf.com/learn)
- [TeX StackExchange](https://tex.stackexchange.com/)
- [LaTeX Wikibook](https://en.wikibooks.org/wiki/LaTeX)

### Academic Writing

- [How to Write a Great Research Paper](https://www.microsoft.com/en-us/research/academic-program/write-great-research-paper/)
- [Conference Paper Templates](https://www.acm.org/publications/proceedings-template)

### arXiv

- [arXiv Submission Guide](https://arxiv.org/help/submit)
- [arXiv Best Practices](https://arxiv.org/help/submit_tex)

## Troubleshooting

For common issues and solutions, see the [LaTeX troubleshooting guide](https://en.wikibooks.org/wiki/LaTeX/Errors_and_Warnings).

For project-specific questions, check:

- [Project Issues](https://github.com/spugachev/codecrdt/issues)
- [Discussions](https://github.com/spugachev/codecrdt/discussions)

## License

This paper infrastructure is part of the CodeCRDT project and is licensed under the MIT License.

## Contact

- **Author:** Sergey Pugachev
- **ORCID:** 0009-0008-5134-6411
- **Repository:** https://github.com/spugachev/codecrdt

## Makefile Quick Reference

```bash
make pdf              # Build paper PDF
make quick            # Quick build (single pass)
make watch            # Watch mode (auto-rebuild)
make arxiv            # Prepare arXiv submission
make conference       # Prepare conference submission
make check            # Check LaTeX syntax
make wordcount        # Count words
make stats            # Show statistics
make spell            # Spell check
make view             # View PDF (macOS)
make view-linux       # View PDF (Linux)
make diff             # Create diff with old version
make text             # Extract text from PDF
make validate-arxiv   # Validate arXiv package
make clean            # Remove auxiliary files
make distclean        # Remove all build artifacts
make help             # Show all commands
```

## Next Steps

1. **Fill in results:** Replace placeholder text in Results section
2. **Add figures:** Create plots from evaluation data
3. **Review and revise:** Multiple passes for clarity
4. **Get feedback:** Share with colleagues
5. **Prepare submission:** Follow checklist above
6. **Submit:** Upload to arXiv or conference

Good luck with your publication!
