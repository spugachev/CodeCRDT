#!/bin/bash
# CodeCRDT Paper Submission Preparation Script
# Prepares paper for arXiv and conference submission

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PAPER_DIR="$(dirname "$SCRIPT_DIR")"
OUTPUT_DIR="$PAPER_DIR/output"
ARXIV_DIR="$OUTPUT_DIR/arxiv"
SUBMISSION_DIR="$OUTPUT_DIR/submission"

# Helpers
safe_clear() {
    if [ -t 1 ] && command -v clear >/dev/null 2>&1; then
        clear
    fi
}

# Functions
print_header() {
    echo -e "${BLUE}============================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}============================================${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

check_dependencies() {
    print_header "Checking Dependencies"

    local missing=0

    if ! command -v pdflatex &> /dev/null; then
        print_error "pdflatex not found. Install TeX Live or MacTeX."
        missing=1
    else
        print_success "pdflatex found"
    fi

    if ! command -v bibtex &> /dev/null; then
        print_error "bibtex not found. Install TeX Live or MacTeX."
        missing=1
    else
        print_success "bibtex found"
    fi

    if ! command -v tar &> /dev/null; then
        print_error "tar not found"
        missing=1
    else
        print_success "tar found"
    fi

    if ! command -v pdfinfo &> /dev/null; then
        print_warning "pdfinfo not found (optional, for statistics)"
    else
        print_success "pdfinfo found"
    fi

    if command -v latexmk &> /dev/null; then
        print_success "latexmk found (watch mode available)"
    else
        print_warning "latexmk not found (watch mode disabled)"
    fi

    if command -v chktex &> /dev/null; then
        print_success "chktex found (make check available)"
    else
        print_warning "chktex not found (make check skipped)"
    fi

    if command -v texcount &> /dev/null; then
        print_success "texcount found (word count available)"
    else
        print_warning "texcount not found (install texlive-extra-utils for word counts)"
    fi

    if command -v aspell &> /dev/null; then
        print_success "aspell found (spell-check available)"
    else
        print_warning "aspell not found (spell-check skipped)"
    fi

    if command -v latexdiff &> /dev/null; then
        print_success "latexdiff found (diff target available)"
    else
        print_warning "latexdiff not found (diff target disabled)"
    fi

    if command -v pdftotext &> /dev/null; then
        print_success "pdftotext found (text extraction available)"
    else
        print_warning "pdftotext not found (install poppler for text extraction)"
    fi

    if command -v pandoc &> /dev/null; then
        print_success "pandoc found (HTML conversion available)"
    else
        print_warning "pandoc not found (HTML conversion skipped)"
    fi

    if [ $missing -eq 1 ]; then
        print_error "Missing required dependencies. Please install them first."
        exit 1
    fi

    echo ""
}

build_paper() {
    print_header "Building Paper"

    cd "$PAPER_DIR"

    if [ -f Makefile ]; then
        # Build MLSys submission by default
        make mlsys-submission
        print_success "MLSys submission built successfully"
    else
        print_error "Makefile not found"
        exit 1
    fi

    echo ""
}

validate_paper() {
    print_header "Validating Paper"

    local pdf_path="$OUTPUT_DIR/paper-mlsys.pdf"

    if [ ! -f "$pdf_path" ]; then
        print_error "PDF not found at $pdf_path"
        exit 1
    fi

    print_success "PDF exists"

    # Check PDF size
    local size=$(du -h "$pdf_path" | cut -f1)
    echo -e "  File size: $size"

    # Check page count
    if command -v pdfinfo &> /dev/null; then
        local pages=$(pdfinfo "$pdf_path" 2>/dev/null | awk '/Pages/ {print $2}')

        if [[ $pages =~ ^[0-9]+$ ]]; then
            echo -e "  Page count: $pages"

            if [ "$pages" -lt 5 ]; then
                print_warning "Paper seems very short ($pages pages)"
            elif [ "$pages" -gt 10 ]; then
                print_warning "Paper exceeds MLSys page limit ($pages pages). Limit is 10 pages excluding references."
            else
                print_success "Page count looks good ($pages pages)"
            fi
        else
            print_warning "Unable to determine page count (run pdfinfo locally)"
        fi
    fi

    echo ""
}

prepare_arxiv() {
    print_header "Preparing arXiv Submission"

    cd "$PAPER_DIR"
    make arxiv

    local tarball="$OUTPUT_DIR/arxiv-submission.tar.gz"

    if [ ! -f "$tarball" ]; then
        print_error "arXiv tarball not created"
        exit 1
    fi

    print_success "arXiv submission package created"
    echo -e "  Location: $tarball"
    echo -e "  Size: $(du -h "$tarball" | cut -f1)"

    # List contents
    echo -e "\n  Contents:"
    tar -tzf "$tarball" | sed 's/^/    /'

    echo ""
    print_success "arXiv package ready for upload"
    echo -e "  Upload to: ${BLUE}https://arxiv.org/submit${NC}"

    echo ""
}

prepare_conference() {
    print_header "Preparing Conference Submission"

    cd "$PAPER_DIR"
    make conference

    local conf_pdf="$SUBMISSION_DIR/paper-submission.pdf"

    if [ ! -f "$conf_pdf" ]; then
        print_error "Conference submission PDF not created"
        exit 1
    fi

    print_success "Conference submission prepared"
    echo -e "  Location: $conf_pdf"
    echo -e "  Size: $(du -h "$conf_pdf" | cut -f1)"

    echo ""
}

show_checklist() {
    print_header "Submission Checklist"

    echo "Before submitting to MLSys 2026:"
    echo "  [ ] Paper does not exceed 10 pages (excluding references and appendices)"
    echo "  [ ] All author information is anonymized (double-blind review)"
    echo "  [ ] No self-citations that reveal identity"
    echo "  [ ] Abstract is brief and self-contained (4-6 sentences)"
    echo "  [ ] All figures are included and high resolution"
    echo "  [ ] Figure captions are under the figures"
    echo "  [ ] Table captions are over the tables"
    echo "  [ ] Bibliography is complete and formatted with mlsys2025.bst"
    echo "  [ ] References include page numbers wherever possible"
    echo "  [ ] All TODOs and placeholder text are removed"
    echo "  [ ] PDF uses only Type-1 fonts (check with pdffonts)"
    echo "  [ ] Supplementary materials prepared if needed"
    echo ""

    echo "Before submitting to arXiv:"
    echo "  [ ] Author information is complete and correct"
    echo "  [ ] Camera-ready version uses \\usepackage[accepted]{mlsys2025}"
    echo "  [ ] All figures are included and high resolution"
    echo "  [ ] Bibliography is complete and formatted correctly"
    echo "  [ ] Abstract is within word limit (250 words for arXiv)"
    echo "  [ ] All TODOs and placeholder text are removed"
    echo "  [ ] References are cited correctly"
    echo "  [ ] Code/data availability statements are included"
    echo "  [ ] License is specified (MIT for this project)"
    echo ""
}

show_statistics() {
    print_header "Paper Statistics"

    cd "$PAPER_DIR"
    make stats

    echo ""
}

generate_html() {
    print_header "Generating HTML Version"

    if ! command -v pandoc &> /dev/null; then
        print_warning "pandoc not found. Install pandoc to generate HTML version."
        return
    fi

    local tex_file="$PAPER_DIR/src/paper.tex"
    local html_file="$OUTPUT_DIR/paper.html"

    # Note: This is a simple conversion. For better results, use dedicated tools
    if ! pandoc "$tex_file" -s --mathjax -o "$html_file" 2>/dev/null; then
        print_warning "HTML generation failed (this is optional)"
        return
    fi

    print_success "HTML version created: $html_file"
    echo ""
}

# Main script
main() {
    safe_clear

    print_header "CodeCRDT Paper Submission Preparation"
    echo ""

    # Parse arguments
    if [ $# -eq 0 ]; then
        print_error "Usage: $0 [arxiv|conference|all|check]"
        echo ""
        echo "Commands:"
        echo "  arxiv       - Prepare arXiv submission"
        echo "  conference  - Prepare conference submission"
        echo "  all         - Prepare both arXiv and conference submissions"
        echo "  check       - Check dependencies and validate paper"
        exit 1
    fi

    local command="$1"

    case "$command" in
        arxiv)
            check_dependencies
            build_paper
            validate_paper
            prepare_arxiv
            show_checklist
            ;;
        conference)
            check_dependencies
            build_paper
            validate_paper
            prepare_conference
            show_checklist
            ;;
        all)
            check_dependencies
            build_paper
            validate_paper
            show_statistics
            prepare_arxiv
            prepare_conference
            generate_html
            show_checklist
            ;;
        check)
            check_dependencies
            build_paper
            validate_paper
            show_statistics
            ;;
        *)
            print_error "Unknown command: $command"
            echo "Valid commands: arxiv, conference, all, check"
            exit 1
            ;;
    esac

    print_header "Complete!"
    print_success "All tasks finished successfully"
    echo ""
}

# Run main function
main "$@"
