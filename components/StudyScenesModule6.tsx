"use client";

import { useState } from "react";

export function NeuralNodeScene() {
  const [weight, setWeight] = useState(1);
  const sum = 3 * weight + 1 * 2 - 3;
  const signal = Math.max(0, sum);
  return <div className="xp-m6">
    <p>A maintenance model gets a vibration reading of <b>3</b> and a heat reading of <b>1</b>. What happens if this neuron pays more attention to vibration?</p>
    <label className="xp-m6-slider"><b>Vibration weight: {weight}</b><input type="range" min="-2" max="3" value={weight} onChange={e => setWeight(Number(e.target.value))} /></label>
    <div className="xp-m6-readout" aria-live="polite">
      <div><span>Weight the inputs</span><strong>3 × {weight} + 1 × 2</strong></div>
      <div><span>Add bias (−3)</span><strong>{sum}</strong></div>
      <div><span>Activate and pass on</span><strong>{signal}</strong></div>
    </div>
    <p>This activation passes positive values through and turns negative values into zero. You adjusted the weight in this example; training usually adjusts it from data.</p>
  </div>;
}

const policies = [
  { name: "Answer more often", correct: 60, wrong: 25, declined: 15 },
  { name: "Pass uncertain cases", correct: 60, wrong: 8, declined: 32 },
  { name: "Use a stricter threshold", correct: 54, wrong: 5, declined: 41 },
];
export function AbstentionScene() {
  const [index, setIndex] = useState(0);
  const { correct, wrong, declined } = policies[index];
  return <div className="xp-m6">
    <p>A help desk tests 100 requests. Choose how cautious the assistant should be, then see what lands in the staff queue. These outcomes are illustrative.</p>
    <div className="xp-choices" aria-label="Answer policy">{policies.map((p, i) => <button type="button" key={p.name} aria-pressed={index === i} onClick={() => setIndex(i)}>{p.name}</button>)}</div>
    <div className="xp-m6-bar" aria-hidden="true"><i style={{ flex: correct }} /><i style={{ flex: wrong }} /><i style={{ flex: declined }} /></div>
    <div aria-live="polite">
      <div className="xp-m6-readout"><div><span>Correct</span><strong>{correct}</strong></div><div><span>Wrong</span><strong>{wrong}</strong></div><div><span>Sent to staff</span><strong>{declined}</strong></div></div>
      <p><b>{correct}% accuracy</b> across all requests · <b>{100 - declined}% coverage</b> · Slide’s hallucination measure: {wrong} ÷ ({wrong} + {declined}) = <b>{(100 * wrong / (wrong + declined)).toFixed(1)}%</b>.</p>
    </div>
  </div>;
}
