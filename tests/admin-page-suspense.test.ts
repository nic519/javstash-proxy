import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

describe('app/admin/page', () => {
  it('wraps the search-params-driven admin content in Suspense for builds', () => {
    const source = fs.readFileSync(
      path.resolve(__dirname, '../app/admin/page.tsx'),
      'utf8'
    );

    expect(source).toContain("import { Suspense");
    expect(source).toContain('function AdminPageContent()');
    expect(source).toMatch(/<Suspense[\s\S]*<AdminPageContent \/>\s*<\/Suspense>/);
  });
});
