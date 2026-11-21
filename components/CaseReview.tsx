import type { ReactNode } from "react";
import type { AttemptReviewItem } from "@/lib/scores";

const roman = ["I", "II", "III"];

/** Saved attempts already contain the full case and its explanation, including older attempts. */
export function caseTitle(item: AttemptReviewItem) {
  if (!item.explanation || !/^(?:I\. (?:Correct|Incorrect)\.|“.+?” (?:Correct|Incorrect)\.)/.test(item.explanation)) return;
  return item.prompt.match(/^<p><strong>([^<]+)<\/strong>/)?.[1]?.replaceAll("&amp;", "&").replaceAll("&lt;", "<").replaceAll("&gt;", ">");
}

function reasonText(reason: string) {
  return reason.replace(/\s*\[\d+\.\d+ slides?[^\]]*\]/gi, "")
    .replace(/\s*\(\d+\.\d+ (?:slides?|class notes)[^)]*\)/gi, "")
    .trim();
}

export function ReviewNotes({ source, onReview }: { source?: string; onReview?: () => void }) {
  if (!source && !onReview) return null;
  return <div className="case-links">
    {onReview && <button type="button" className="qz-peek" onClick={onReview}>Review in notes</button>}
    {source && <details><summary>Source</summary><span>{source}</span></details>}
  </div>;
}

export default function CaseReview({ item, showContext, onReview }: {
  item: AttemptReviewItem;
  showContext?: boolean;
  onReview?: () => void;
}) {
  const [context, statements] = item.prompt.split('<ol type="I">');
  const statementHtml = [...(statements ?? "").matchAll(/<li>(.*?)<\/li>/g)].map(match => match[1]);
  const lines = item.explanation?.split("\n") ?? [];
  const parsed = lines.map(line => {
    const combo = line.match(/^(I{1,3})\. (Correct|Incorrect)\.\s+(.+)$/);
    if (combo) return { label: combo[1], right: combo[2] === "Correct", why: reasonText(combo[3]), html: statementHtml[roman.indexOf(combo[1])] };
    const check = line.match(/^“(.*?)” (Correct|Incorrect)\.\s+(.+)$/);
    if (check) return { label: undefined, right: check[2] === "Correct", why: reasonText(check[3]), text: check[1] };
  });

  if (!parsed.length || parsed.some(row => !row || (!row.html && !row.text))) {
    return <>
      {showContext && <div className="qz-rv-prompt" dangerouslySetInnerHTML={{ __html: item.prompt }} />}
      <p className="qz-rv-line">Your answer <b>{item.your?.join(" · ") || "No answer"}</b></p>
      <p className="qz-rv-line">Correct answer <b>{item.correct?.join(" · ")}</b></p>
      <p className="qz-why">{item.explanation}</p>
      <ReviewNotes source={item.source} onReview={onReview} />
    </>;
  }

  const combo = statementHtml.length > 0;
  const rows = parsed.filter(row => row !== undefined);
  // Put selected mistakes and missed correct options first in checkbox feedback.
  const chosen = (option?: string) => !!option && !!item.your?.includes(option);
  const priority = (row: typeof rows[number]) => row.right !== chosen(row.text) ? 0 : row.right ? 1 : 2;
  const ordered = combo ? rows : [...rows].sort((a, b) => priority(a) - priority(b));

  return <div className="case-review">
    {combo && <div className="case-answer">
      <p><small>Correct answer</small><strong>{item.correct?.[0]}</strong></p>
      {item.points < item.max && <p><small>Your answer</small><span>{item.your?.[0] || "No answer"}</span></p>}
    </div>}
    {showContext && <details className="case-context">
      <summary>Read the case</summary>
      <div className="qz-rv-prompt" dangerouslySetInnerHTML={{ __html: context }} />
    </details>}
    <ul className="case-statements">
      {ordered.map(row => {
        let result: ReactNode = row.right ? "Correct" : "Incorrect";
        if (!combo) {
          if (row.right) result = chosen(row.text) ? "Correct · selected" : "Correct · missed";
          else if (chosen(row.text)) result = "Incorrect · selected";
        }
        return <li key={row.label ?? row.text}>
          <span className={"case-verdict " + (row.right ? "right" : "wrong")}>{row.label && `${row.label} · `}{result}</span>
          {row.html ? <p dangerouslySetInnerHTML={{ __html: row.html }} /> : <p>{row.text}</p>}
          <p className="case-reason">{row.why}</p>
        </li>;
      })}
    </ul>
    <ReviewNotes source={item.source} onReview={onReview} />
  </div>;
}
