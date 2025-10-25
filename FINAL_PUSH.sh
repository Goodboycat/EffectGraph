#!/bin/bash

# EffectGraph - Final Push Script
# This script will push all commits to GitHub

echo "=========================================="
echo "  EffectGraph - Ready to Push to GitHub"
echo "=========================================="
echo ""

# Show what will be pushed
echo "📦 Commits ready to push:"
git log --oneline origin/main..HEAD 2>/dev/null || git log --oneline -8
echo ""

echo "📊 Files changed:"
git diff --stat origin/main..HEAD 2>/dev/null || echo "All new commits"
echo ""

echo "🎯 Repository: https://github.com/Goodboycat/EffectGraph"
echo ""

# Offer push options
echo "Choose push method:"
echo "1) Standard push (requires GitHub auth)"
echo "2) Show manual instructions"
echo "3) Exit"
echo ""
read -p "Select option (1-3): " choice

case $choice in
  1)
    echo ""
    echo "🚀 Attempting to push..."
    git push origin main
    if [ $? -eq 0 ]; then
      echo "✅ Successfully pushed to GitHub!"
      echo "🌐 View at: https://github.com/Goodboycat/EffectGraph"
    else
      echo "❌ Push failed. See manual instructions below."
      echo ""
      cat PUSH_INSTRUCTIONS.md
    fi
    ;;
  2)
    echo ""
    cat PUSH_INSTRUCTIONS.md
    ;;
  3)
    echo "Exiting..."
    exit 0
    ;;
  *)
    echo "Invalid option"
    exit 1
    ;;
esac

echo ""
echo "=========================================="
echo "  ✅ EffectGraph - Complete & Ready!"
echo "=========================================="
