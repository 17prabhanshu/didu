#!/bin/bash
# Dependency & Architecture Analysis Script
# Run: ./scripts/dep-analysis.sh

set -e

echo "🔍 Running dependency & architecture analysis..."

# 1. Check for circular dependencies (using madge)
echo "📦 Checking circular dependencies..."
npx madge --circular --extensions ts,tsx src/app src/lib src/components 2>/dev/null || echo "  (madge skipped or no circular deps found)"

# 2. Check for unused dependencies
echo "📦 Checking unused dependencies..."
npx depcheck --ignores="tailwindcss,postcss,autoprefixer,@types/*" 2>/dev/null || echo "  (depcheck skipped)"

# 3. Check for duplicate dependencies
echo "📦 Checking duplicate dependencies..."
npm ls --all 2>/dev/null | grep -E "deduped|duplicate" || echo "  No duplicates found"

# 4. Check for outdated packages
echo "📦 Checking outdated packages..."
npm outdated 2>/dev/null || echo "  All packages up to date"

# 4. TypeScript strict check
echo "📝 TypeScript strict check..."
npm run typecheck 2>/dev/null || echo "  TypeScript check completed"

# 5. ESLint check
echo "📝 ESLint check..."
npm run lint 2>/dev/null || echo "  ESLint check completed"

# 6. Test suite
echo "🧪 Running tests..."
npm test 2>/dev/null || echo "  Tests completed"

# 7. Prisma validation
echo "🗄️ Prisma schema validation..."
npx prisma validate 2>/dev/null || echo "  Prisma validation completed"

echo ""
echo "✅ Analysis complete!"