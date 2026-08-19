import type { RenderContext } from '../../types.js';
export declare function formatCacheHitPercent(tokens: NonNullable<RenderContext['transcript']['sessionTokens']>): string | null;
export declare function formatSessionTokenSummary(tokens: NonNullable<RenderContext['transcript']['sessionTokens']>, prefix: string): string | null;
export declare function renderSessionTokensLine(ctx: RenderContext): string | null;
export declare function renderCacheHitLine(ctx: RenderContext): string | null;
//# sourceMappingURL=session-tokens.d.ts.map