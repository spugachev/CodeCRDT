# MLSys Paper Build System
# Optimized Makefile for building LaTeX paper for MLSys conference submission

.SILENT:
.ONESHELL:

# Configuration
PAPER := paper-mlsys
SRC_DIR := src
OUTPUT_DIR := output
SUBMISSION_DIR := $(OUTPUT_DIR)/submission
ARXIV_DIR := $(OUTPUT_DIR)/arxiv
STYLE_DIR := mlsys-style
FIGURES_DIR := figures

# Tools
LATEX := pdflatex
BIBTEX := bibtex
LATEX_FLAGS := -interaction=nonstopmode

# Source files
TEX_SRC := $(SRC_DIR)/$(PAPER).tex
BIB_SRC := $(SRC_DIR)/references-mlsys.bib

# Output files
PDF := $(OUTPUT_DIR)/$(PAPER).pdf

# Style files to copy
STYLE_FILES := mlsys2025.sty mlsys2025.bst
OPTIONAL_STYLE_FILES := algorithm.sty algorithmic.sty fancyhdr.sty

# Auxiliary files for cleanup
AUX_FILES := aux log bbl blg out toc lof lot fls fdb_latexmk synctex.gz

# Default target
.PHONY: all
all: camera-ready

# Create output directory
$(OUTPUT_DIR):
	mkdir -p $(OUTPUT_DIR)

# Copy style files (only when needed)
.PHONY: copy-styles
copy-styles:
	for file in $(STYLE_FILES); do \
		cp $(STYLE_DIR)/$$file $(SRC_DIR)/; \
	done
	for file in $(OPTIONAL_STYLE_FILES); do \
		cp $(STYLE_DIR)/$$file $(SRC_DIR)/ 2>/dev/null || true; \
	done

# Build PDF (anonymous submission for review)
.PHONY: pdf
pdf: $(OUTPUT_DIR) copy-styles
	echo "Building MLSys submission PDF (anonymous)..."
	cd $(SRC_DIR) && $(LATEX) $(LATEX_FLAGS) -output-directory=../$(OUTPUT_DIR) $(PAPER).tex
	cd $(OUTPUT_DIR) && BSTINPUTS=../$(SRC_DIR):../$(STYLE_DIR): BIBINPUTS=../$(SRC_DIR): $(BIBTEX) $(PAPER)
	cd $(SRC_DIR) && $(LATEX) $(LATEX_FLAGS) -output-directory=../$(OUTPUT_DIR) $(PAPER).tex
	cd $(SRC_DIR) && $(LATEX) $(LATEX_FLAGS) -output-directory=../$(OUTPUT_DIR) $(PAPER).tex
	echo "Anonymous PDF built: $(PDF)"

# Build camera-ready PDF (with author names)
.PHONY: camera-ready
camera-ready: $(OUTPUT_DIR) copy-styles
	echo "Building camera-ready PDF (with authors)..."
	cp $(TEX_SRC) $(SRC_DIR)/$(PAPER)-temp.tex
	sed -i.bak 's/\\usepackage{mlsys2025}/\\usepackage[accepted]{mlsys2025}/g' $(SRC_DIR)/$(PAPER)-temp.tex
	sed -i.bak 's/\\mlsysauthor{\(.*\)}{ind}/\\mlsysauthor{\1}{}/g' $(SRC_DIR)/$(PAPER)-temp.tex
	sed -i.bak 's/\\mlsysaffiliation{ind}{Independent Researcher}/% \\mlsysaffiliation{ind}{Independent Researcher}/g' $(SRC_DIR)/$(PAPER)-temp.tex
	sed -i.bak 's/\\mlsyscorrespondingauthor{Sergey Pugachev}{sergey@spugachev.com}/% \\mlsyscorrespondingauthor{Sergey Pugachev}{sergey@spugachev.com}/g' $(SRC_DIR)/$(PAPER)-temp.tex
	rm -f $(SRC_DIR)/$(PAPER)-temp.tex.bak
	cd $(SRC_DIR) && $(LATEX) $(LATEX_FLAGS) -output-directory=../$(OUTPUT_DIR) $(PAPER)-temp.tex
	cd $(OUTPUT_DIR) && BSTINPUTS=../$(SRC_DIR):../$(STYLE_DIR): BIBINPUTS=../$(SRC_DIR): $(BIBTEX) $(PAPER)-temp
	cd $(SRC_DIR) && $(LATEX) $(LATEX_FLAGS) -output-directory=../$(OUTPUT_DIR) $(PAPER)-temp.tex
	cd $(SRC_DIR) && $(LATEX) $(LATEX_FLAGS) -output-directory=../$(OUTPUT_DIR) $(PAPER)-temp.tex
	mv $(OUTPUT_DIR)/$(PAPER)-temp.pdf $(PDF)
	rm -f $(SRC_DIR)/$(PAPER)-temp.tex $(OUTPUT_DIR)/$(PAPER)-temp.*
	echo "Camera-ready PDF built: $(PDF)"

# Force complete rebuild
.PHONY: rebuild
rebuild: distclean camera-ready
	echo "Complete rebuild finished"

# Watch mode (requires latexmk)
.PHONY: watch
watch: $(OUTPUT_DIR) copy-styles
	echo "Starting watch mode..."
	if command -v latexmk >/dev/null 2>&1; then \
		cd $(SRC_DIR) && latexmk -pdf -pvc $(LATEX_FLAGS) -output-directory=../$(OUTPUT_DIR) $(PAPER).tex; \
	else \
		echo "Error: latexmk not found. Install it to use watch mode"; \
		exit 1; \
	fi

# Prepare conference submission
.PHONY: conference
conference: pdf
	echo "Preparing MLSys conference submission..."
	mkdir -p $(SUBMISSION_DIR)
	cp $(PDF) $(SUBMISSION_DIR)/mlsys-submission.pdf
	echo "Conference submission ready: $(SUBMISSION_DIR)/mlsys-submission.pdf"

# Prepare arXiv submission package
.PHONY: arxiv
arxiv: camera-ready
	echo "Preparing arXiv submission package..."
	rm -rf $(ARXIV_DIR)
	mkdir -p $(ARXIV_DIR)
	mkdir -p $(ARXIV_DIR)/figures
	echo "Copying source files..."
	cp $(SRC_DIR)/$(PAPER)-temp.tex $(ARXIV_DIR)/$(PAPER).tex || cp $(TEX_SRC) $(ARXIV_DIR)/$(PAPER).tex
	if [ -f "$(SRC_DIR)/$(PAPER)-temp.tex" ]; then \
		cp $(SRC_DIR)/$(PAPER)-temp.tex $(ARXIV_DIR)/$(PAPER).tex; \
		sed -i.bak 's|../figures/|figures/|g' $(ARXIV_DIR)/$(PAPER).tex; \
		rm -f $(ARXIV_DIR)/$(PAPER).tex.bak; \
	else \
		cp $(TEX_SRC) $(ARXIV_DIR)/$(PAPER).tex; \
		sed -i.bak 's/\\usepackage{mlsys2025}/\\usepackage[accepted]{mlsys2025}/g' $(ARXIV_DIR)/$(PAPER).tex; \
		sed -i.bak 's/\\mlsysauthor{\(.*\)}{ind}/\\mlsysauthor{\1}{}/g' $(ARXIV_DIR)/$(PAPER).tex; \
		sed -i.bak 's/\\mlsysaffiliation{ind}{Independent Researcher}/% \\mlsysaffiliation{ind}{Independent Researcher}/g' $(ARXIV_DIR)/$(PAPER).tex; \
		sed -i.bak 's/\\mlsyscorrespondingauthor{Sergey Pugachev}{sergey@spugachev.com}/% \\mlsyscorrespondingauthor{Sergey Pugachev}{sergey@spugachev.com}/g' $(ARXIV_DIR)/$(PAPER).tex; \
		sed -i.bak 's|../figures/|figures/|g' $(ARXIV_DIR)/$(PAPER).tex; \
		rm -f $(ARXIV_DIR)/$(PAPER).tex.bak; \
	fi
	if ! grep -q '^\\pdfoutput=1' $(ARXIV_DIR)/$(PAPER).tex; then \
		tmpfile=$$(mktemp); \
		printf '\\pdfoutput=1\n' > $$tmpfile; \
		cat $(ARXIV_DIR)/$(PAPER).tex >> $$tmpfile; \
		mv $$tmpfile $(ARXIV_DIR)/$(PAPER).tex; \
	fi
	echo "Copying bibliography..."
	cp $(BIB_SRC) $(ARXIV_DIR)/
	echo "Copying style files..."
	for file in $(STYLE_FILES) $(OPTIONAL_STYLE_FILES); do \
		cp $(STYLE_DIR)/$$file $(ARXIV_DIR)/ 2>/dev/null || true; \
	done
	echo "Copying figures..."
	if [ -d "$(FIGURES_DIR)" ]; then \
		cp $(FIGURES_DIR)/* $(ARXIV_DIR)/figures/ 2>/dev/null || true; \
	fi
	echo "Building PDF in arxiv directory..."
	cd $(ARXIV_DIR) && $(LATEX) $(LATEX_FLAGS) $(PAPER).tex
	cd $(ARXIV_DIR) && BSTINPUTS=.: BIBINPUTS=.: $(BIBTEX) $(PAPER)
	cd $(ARXIV_DIR) && $(LATEX) $(LATEX_FLAGS) $(PAPER).tex
	cd $(ARXIV_DIR) && $(LATEX) $(LATEX_FLAGS) $(PAPER).tex
	rm -f $(ARXIV_DIR)/$(PAPER).pdf
	echo "Creating tarball..."
	cd $(OUTPUT_DIR) && tar -czf arxiv-submission.tar.gz -C arxiv \
		--exclude='*.aux' --exclude='*.log' --exclude='*.out' \
		--exclude='*.blg' --exclude='*.fls' \
		--exclude='*.fdb_latexmk' --exclude='*.synctex.gz' \
		--exclude='*.pdf' --exclude='*.mmd' .
	echo "arXiv submission package created:"
	echo "  Directory: $(ARXIV_DIR)"
	echo "  Tarball: $(OUTPUT_DIR)/arxiv-submission.tar.gz"
	echo "Upload tarball to https://arxiv.org/submit"

# Development and utility targets

.PHONY: check
check:
	echo "Checking LaTeX syntax..."
	if command -v chktex >/dev/null 2>&1; then \
		cd $(SRC_DIR) && chktex -q $(PAPER).tex || true; \
		echo "Syntax check complete"; \
	else \
		echo "Install chktex to run LaTeX syntax checks"; \
	fi

.PHONY: wordcount
wordcount:
	echo "Counting words..."
	if command -v texcount >/dev/null 2>&1; then \
		cd $(SRC_DIR) && texcount -inc -incbib -sum $(PAPER).tex; \
	else \
		echo "Install texcount to enable word counting"; \
	fi

.PHONY: stats
stats: wordcount
	echo ""
	echo "Paper Statistics:"
	echo "================"
	if [ -f "$(PDF)" ]; then \
		if command -v pdfinfo >/dev/null 2>&1; then \
			pages=$$(pdfinfo $(PDF) 2>/dev/null | awk '/Pages/ {print $$2}'); \
			[ -n "$$pages" ] && echo "Pages: $$pages" || echo "Pages: (unable to determine)"; \
		else \
			echo "Pages: Install pdfinfo to view page count"; \
		fi; \
	else \
		echo "Pages: Build PDF first (make pdf)"; \
	fi
	if [ -d "figures" ]; then \
		count=$$(find figures -type f \( -iname '*.pdf' -o -iname '*.png' -o -iname '*.jpg' -o -iname '*.jpeg' -o -iname '*.svg' \) 2>/dev/null | wc -l | awk '{print $$1}'); \
		echo "Figures: $$count"; \
	else \
		echo "Figures: 0"; \
	fi
	if [ -d "tables" ]; then \
		count=$$(find tables -type f \( -iname '*.tex' -o -iname '*.csv' \) 2>/dev/null | wc -l | awk '{print $$1}'); \
		echo "Tables: $$count"; \
	else \
		echo "Tables: 0"; \
	fi
	if [ -f "$(BIB_SRC)" ]; then \
		echo "References: $$(grep -c '@' $(BIB_SRC) || echo 0)"; \
	else \
		echo "References: 0"; \
	fi

.PHONY: spell
spell:
	echo "Running spell check..."
	if command -v aspell >/dev/null 2>&1; then \
		aspell -t -c $(TEX_SRC); \
	else \
		echo "Install aspell to enable spell checking"; \
	fi

.PHONY: view
view: camera-ready
	open $(PDF)

.PHONY: view-linux
view-linux: camera-ready
	xdg-open $(PDF)

.PHONY: diff
diff: $(OUTPUT_DIR)
	echo "Creating diff with previous version..."
	if ! command -v latexdiff >/dev/null 2>&1; then \
		echo "Error: latexdiff not found"; \
		exit 1; \
	fi
	if [ ! -f "$(SRC_DIR)/$(PAPER)-old.tex" ]; then \
		echo "Error: $(SRC_DIR)/$(PAPER)-old.tex not found"; \
		echo "Create a copy of your previous version as $(PAPER)-old.tex"; \
		exit 1; \
	fi
	latexdiff $(SRC_DIR)/$(PAPER)-old.tex $(TEX_SRC) > $(OUTPUT_DIR)/$(PAPER)-diff.tex
	cd $(OUTPUT_DIR) && $(LATEX) -interaction=nonstopmode $(PAPER)-diff.tex
	cd $(OUTPUT_DIR) && $(LATEX) -interaction=nonstopmode $(PAPER)-diff.tex
	echo "Diff PDF created: $(OUTPUT_DIR)/$(PAPER)-diff.pdf"

.PHONY: text
text: camera-ready
	echo "Extracting text from PDF..."
	if command -v pdftotext >/dev/null 2>&1; then \
		pdftotext $(PDF) $(OUTPUT_DIR)/$(PAPER).txt; \
		echo "Text extracted to: $(OUTPUT_DIR)/$(PAPER).txt"; \
	else \
		echo "Install pdftotext to enable text extraction"; \
	fi

# Cleanup targets

.PHONY: clean
clean:
	echo "Cleaning auxiliary files..."
	for ext in $(AUX_FILES); do \
		rm -f $(OUTPUT_DIR)/*.$$ext; \
	done
	echo "Clean complete"

.PHONY: distclean
distclean: clean
	echo "Removing all build artifacts..."
	rm -rf $(OUTPUT_DIR)
	for file in $(STYLE_FILES) $(OPTIONAL_STYLE_FILES); do \
		rm -f $(SRC_DIR)/$$file; \
	done
	echo "All artifacts removed"

# Help target

.PHONY: help
help:
	echo "MLSys Paper Build System"
	echo ""
	echo "Main targets:"
	echo "  make camera-ready - Build PDF with author names (default)"
	echo "  make pdf          - Build anonymous PDF for submission"
	echo "  make conference   - Prepare conference submission"
	echo "  make arxiv        - Prepare arXiv submission package"
	echo "  make rebuild      - Clean and rebuild from scratch"
	echo "  make watch        - Watch mode (auto-rebuild on changes)"
	echo ""
	echo "Development:"
	echo "  make check        - Check LaTeX syntax"
	echo "  make wordcount    - Count words"
	echo "  make stats        - Show paper statistics"
	echo "  make spell        - Run spell check"
	echo "  make view         - View PDF (macOS)"
	echo "  make view-linux   - View PDF (Linux)"
	echo "  make diff         - Create diff with previous version"
	echo "  make text         - Extract text from PDF"
	echo ""
	echo "Cleanup:"
	echo "  make clean        - Remove auxiliary files"
	echo "  make distclean    - Remove all build artifacts"
	echo ""
	echo "Quick start:"
	echo "  make              - Build PDF with authors"
	echo "  make pdf          - Build anonymous version"
	echo "  make conference   - Prepare for submission"
	echo "  make arxiv        - Prepare for arXiv"
