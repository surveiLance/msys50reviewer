import { expect, test } from "vitest";
import { podiumPlaces } from "../lib/battlePodium";

test("podium ranks the top three by score, without changing the input", () => {
  const players = [{ name: "Fourth", score: 1 }, { name: "Winner", score: 9 }, { name: "Third", score: 3 }, { name: "Second", score: 5 }];
  expect(podiumPlaces(players).map(p => [p.rank, p.names, p.score])).toEqual([[1, ["Winner"], 9], [2, ["Second"], 5], [3, ["Third"], 3]]);
  expect(players[0].name).toBe("Fourth");
});
test("ties share a place, skipped ranks are not invented", () => {
  expect(podiumPlaces([{ name: "B", score: 5 }, { name: "A", score: 5 }, { name: "C", score: 3 }])).toEqual([{ rank: 1, names: ["A", "B"], score: 5 }, { rank: 3, names: ["C"], score: 3 }]);
});
test("1v1 has no fake third player; all-zero draws and empty rosters work", () => {
  expect(podiumPlaces([{ name: "A", score: 5 }, { name: "B", score: 2 }])).toHaveLength(2);
  expect(podiumPlaces([{ name: "A", score: 0 }, { name: "B", score: 0 }])).toEqual([{ rank: 1, names: ["A", "B"], score: 0 }]);
  expect(podiumPlaces([])).toEqual([]);
});
