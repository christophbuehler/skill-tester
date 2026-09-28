import { test } from 'node:test';
import assert from 'node:assert/strict';
import { resolveSkills } from '../scripts/profiles.mjs';
import { nestedRadius } from '../skills/nested-geometry/scripts/geometry.mjs';
test('aliases and complete sibling bundles resolve once in stable order', () => {
  const entries = { lead: {}, adapt: { aliasOf: 'lead', profileInstruction: 'Read adapt reference.' }, review: {dependencies:['layout','type']}, layout:{}, type:{} };
  assert.deepEqual(resolveSkills(['review','adapt','lead'],entries), {skills:['review','layout','type','lead'],requestedSkills:['review','adapt','lead'],profileInstructions:['Read adapt reference.']});
});
test('missing, cyclic, and blocked packages cannot become active profiles', () => {
  assert.throws(()=>resolveSkills(['missing'],{}), /Unknown/);
  assert.throws(()=>resolveSkills(['a'],{a:{dependencies:['b']},b:{aliasOf:'a'}}), /Cyclic/);
  assert.throws(()=>resolveSkills(['a'],{a:{blockedReason:'remote upload'}}), /remote upload/);
});
test('nested radius uses parent border and true inset, clamps, rejects invalid lengths', () => {
  assert.deepEqual(nestedRadius(32,1,11),{outer:32,inset:12,inner:20});
  assert.equal(nestedRadius(12,0,16).inner,0);
  assert.equal(nestedRadius(40,2,8,4).inner,26);
  assert.throws(()=>nestedRadius(20,-1,8));
  assert.throws(()=>nestedRadius(Infinity,1,8));
});
import { auditColorSource } from '../scripts/audit-presentation.mjs';
test('semantic color check allows token definitions and rejects component literals/palettes', () => {
  assert.deepEqual(auditColorSource(':root { --surface: #fff; --shadow: 0 1px 4px rgb(0 0 0 / .1); } .a { color: var(--text); }','.css'),[]);
  assert.ok(auditColorSource('.a { color: #fff }','.css').length);
  assert.ok(auditColorSource('<div className="bg-slate-100 text-white"/>','.tsx').length);
  assert.ok(auditColorSource('<svg fill="#fff"/>','.tsx').length);
  assert.deepEqual(auditColorSource('<div className="bg-surface text-primary"/>','.tsx'),[]);
});
import fs from 'node:fs';
import { validateProfilePins } from '../scripts/runner-lib.mjs';
test('GitHub repository case normalization preserves exact path and commit checks', () => {
  const registry = JSON.parse(fs.readFileSync('profiles/registry.json','utf8'));
  const profile = JSON.parse(fs.readFileSync('profiles/considered-v4/profile.json','utf8'));
  const manifest = fs.readFileSync('profiles/considered-v4/apm.yml','utf8');
  const lock = fs.readFileSync('profiles/considered-v4/apm.lock.yaml','utf8');
  assert.doesNotThrow(()=>validateProfilePins(profile,registry,manifest,lock));
  assert.throws(()=>validateProfilePins(profile,registry,manifest,lock.replace('resolved_commit:', 'wrong_commit:')), /differs/);
});
test('semantic channels and fragment references pass; named literals fail in JSX contexts', () => {
  for (const source of [':root { --surface: #fff }', '.button { background: rgb(var(--surface)); }']) assert.deepEqual(auditColorSource(source,'.css'),[]);
  assert.deepEqual(auditColorSource('<svg><use href="#add" /></svg>','.tsx'),[]);
  for (const source of ['<svg fill="white"/>','<div style={{color: "red"}}/>','<div className="bg-[white]"/>']) assert.ok(auditColorSource(source,'.tsx').length);
});
