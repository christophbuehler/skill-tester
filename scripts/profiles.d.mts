export const root: string;
export function registry(): Record<string, unknown>;
export function resolveSkills(skills: string[], entries: Record<string, { aliasOf?: string; dependencies?: string[]; profileInstruction?: string; blockedReason?: string }>): { skills: string[]; requestedSkills: string[]; profileInstructions: string[] };
export function register(id: string, skills: string[], label?: string): string;
