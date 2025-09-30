#!/bin/bash

# Safe cleanup script - Only removes TypeScript files that have JavaScript equivalents

echo "=== TypeScript Files Cleanup - Verified Safe ==="
echo ""

# Count files
tsx_total=$(find src -name "*.tsx" -type f | wc -l)
tsx_with_js=$(find src -name "*.tsx" -type f | while read tsx; do js="${tsx%.tsx}.js"; [ -f "$js" ] && echo "$tsx"; done | wc -l)

ts_total=$(find src -name "*.ts" ! -name "*.d.ts" -type f | wc -l)
ts_with_js=$(find src -name "*.ts" ! -name "*.d.ts" -type f | while read ts; do js="${ts%.ts}.js"; [ -f "$js" ] && echo "$ts"; done | wc -l)

echo "TypeScript Analysis:"
echo "  .tsx files total: $tsx_total"
echo "  .tsx files with .js equivalent: $tsx_with_js"
echo "  .ts files total: $ts_total"
echo "  .ts files with .js equivalent: $ts_with_js"
echo ""

# Ask for confirmation
read -p "Remove $tsx_with_js .tsx files and $ts_with_js .ts files? (y/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo "Removing TypeScript files with JavaScript equivalents..."
    
    # Remove .tsx files that have .js equivalents
    removed_tsx=0
    find src -name "*.tsx" -type f | while read tsx; do
        js="${tsx%.tsx}.js"
        if [ -f "$js" ]; then
            echo "  Removing: $tsx (has $js)"
            rm "$tsx"
            ((removed_tsx++))
        fi
    done
    
    # Remove .ts files that have .js equivalents
    removed_ts=0
    find src -name "*.ts" ! -name "*.d.ts" -type f | while read ts; do
        js="${ts%.ts}.js"
        if [ -f "$js" ]; then
            echo "  Removing: $ts (has $js)"
            rm "$ts"
            ((removed_ts++))
        fi
    done
    
    # Remove App.tsx specifically (not needed in Next.js)
    if [ -f "src/App.tsx" ]; then
        echo "  Removing: src/App.tsx (not needed in Next.js)"
        rm "src/App.tsx"
    fi
    
    echo ""
    echo "✓ Cleanup complete!"
    echo ""
    echo "Remaining TypeScript files:"
    remaining=$(find src -name "*.tsx" -o -name "*.ts" ! -name "*.d.ts" | wc -l)
    echo "  $remaining files (these don't have .js equivalents yet)"
    
    if [ $remaining -gt 0 ]; then
        echo ""
        echo "Files not removed (no .js equivalent):"
        find src -name "*.tsx" -type f | while read tsx; do
            js="${tsx%.tsx}.js"
            [ ! -f "$js" ] && echo "  - $tsx"
        done
        find src -name "*.ts" ! -name "*.d.ts" -type f | while read ts; do
            js="${ts%.ts}.js"
            [ ! -f "$js" ] && echo "  - $ts"
        done
    fi
else
    echo "Cleanup cancelled."
fi
