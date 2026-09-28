import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { snapshot, hash } from "../scripts/runner-lib.mjs";
const ids = fs
  .readdirSync("runs")
  .filter((id) => fs.existsSync(`runs/${id}/metadata.json`));
for (const id of ids)
  test(`${id}: immutable evidence and common mock`, () => {
    const dir = path.join("runs", id);
    const metadata = JSON.parse(
      fs.readFileSync(path.join(dir, "metadata.json"), "utf8"),
    );
    const observed = snapshot(dir);
    delete observed["metadata.json"];
    assert.equal(
      hash(JSON.stringify(observed)),
      metadata.sourceHash,
      "Generated evidence changed after import",
    );
    for (const file of ["chat.ts", "engine.ts"])
      assert.equal(
        fs.readFileSync(path.join(dir, "shared", file), "utf8"),
        fs.readFileSync(path.join("packages/mock-agent", file), "utf8"),
      );
    if (metadata.status === "passed") {
      assert.equal(metadata.skills.length, metadata.loadedSkills.length);
      assert.ok(
        metadata.validation.every((c: { passed: boolean }) => c.passed),
      );
    }
  });
test("each benchmark batch shares inputs and exact prompt provenance", () => {
  const records = ids.map(id => JSON.parse(fs.readFileSync(`runs/${id}/metadata.json`, 'utf8')));
  for (const version of new Set(records.map(r=>r.benchmark))) {
    const batch=records.filter(r=>r.benchmark===version);
    assert.ok(new Set(batch.map(r=>r.promptHash)).size<=1);
    assert.ok(new Set(batch.map(r=>r.starterHash)).size<=1);
    assert.ok(new Set(batch.map(r=>r.refinementPrompt)).size<=1);
    assert.ok(new Set(batch.map(r=>r.refinementTimeoutMs)).size<=1);
    const current=JSON.parse(fs.readFileSync('benchmark/config.json','utf8')).id;
    const prompt=fs.readFileSync(version===current?'benchmark/prompt.md':`benchmark/versions/${version}/prompt.md`,'utf8');
    for(const r of batch) {
      assert.equal(hash(prompt),r.promptHash);
      if(['folio-v3','folio-v4'].includes(r.benchmark) && r.status==='passed') {
        assert.equal(r.refinementCount,r.mode==='curated-followup'?1:2);
        assert.equal(r.refinementRounds,r.mode==='curated-followup'?1:2);
        if(r.mode==='curated-followup') {
          const parent=records.find(p=>p.id===r.parentRunId);
          assert.ok(parent); assert.equal(r.parentSourceHash,parent.sourceHash);
          assert.equal(r.profile,parent.profile);
          assert.equal(hash(r.reviewInstruction),r.reviewInstructionHash);
          assert.deepEqual(r.skills,parent.skills);
        }
        for(const phase of (r.mode==='curated-followup'?['before','after']:['before','round1','after'])) {
          assert.equal(r.browserReview[phase].captures.length,10);
          assert.equal(r.browserReview[phase].recordings.length,2);
          const folder = phase==='before' ? 'review-before' : phase==='after' ? 'review-after' : 'review-round-1';
          for(const file of [...r.browserReview[phase].captures, ...r.browserReview[phase].recordings.map((recording: {video: string})=>recording.video)]) {
            assert.equal(path.basename(file),file);
            assert.ok(fs.statSync(path.join('runs',r.id,'evidence',folder,file)).size>0);
          }
          for(const recording of r.browserReview[phase].recordings) assert.ok(recording.durationSeconds>0);
        }
      }
      if(r.benchmark==='folio-v2' && r.status==='passed') {
        assert.equal(r.refinementCount,1);
        assert.equal(r.taskPrompt,prompt);
        assert.equal(r.browserReview.before.captures.length,8);
        assert.equal(r.browserReview.after.captures.length,8);
      }
    }
  }
});

import { auditPresentation } from "../scripts/audit-presentation.mjs";
test("passing v4 presentations keep direct color literals in tokens", () => {
  for (const id of ids) {
    const record = JSON.parse(fs.readFileSync(`runs/${id}/metadata.json`, 'utf8'));
    if (record.benchmark === 'folio-v4' && record.status === 'passed') assert.deepEqual(auditPresentation(`runs/${id}`), [], id);
  }
});
