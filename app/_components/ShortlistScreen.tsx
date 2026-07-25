import { Fragment } from 'react';
import type { AppView } from '../_lib/types';
import { parseInlineStyle } from '../_lib/parseInlineStyle';
import ImageSlot from './ImageSlot';

export default function ShortlistScreen({ v }: { v: AppView }) {
  return (
    <div data-screen-label="Shortlist" style={parseInlineStyle('min-height:calc(100vh - 60px);')}>
      <div style={parseInlineStyle('max-width:1440px;margin:0 auto;padding:28px 24px;display:grid;grid-template-columns:256px 1fr;gap:24px;align-items:start;')}>
        {/* brief rail */}
        <aside style={parseInlineStyle('position:sticky;top:80px;background:#fff;border:1px solid #E7E2D9;border-radius:12px;padding:22px;box-shadow:0 1px 2px rgba(28,26,23,0.06);')}>
          <div style={parseInlineStyle('display:flex;justify-content:space-between;align-items:center;margin-bottom:18px;')}>
            <span style={parseInlineStyle('font-size:11px;font-weight:500;letter-spacing:.07em;text-transform:uppercase;color:#9C9189;')}>Your brief</span>
            <button onClick={v.goIntake} style={parseInlineStyle('background:none;border:none;color:#0F766E;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit;')}>
              Edit
            </button>
          </div>
          {v.briefRows.map((b, i) => (
            <Fragment key={i}>
              <div style={parseInlineStyle('margin-bottom:16px;')}>
                <div style={parseInlineStyle('font-size:10px;font-weight:500;color:#9C9189;text-transform:uppercase;letter-spacing:.05em;margin-bottom:4px;')}>{b.k}</div>
                <div style={parseInlineStyle('font-size:14px;font-weight:600;color:#1C1A17;')}>{b.v}</div>
              </div>
            </Fragment>
          ))}
          {/* Agent status — blue accent */}
          <div style={parseInlineStyle('background:#E8F0FE;border-radius:12px;padding:14px;margin-top:8px;')}>
            <div style={parseInlineStyle('display:flex;align-items:center;gap:8px;margin-bottom:6px;')}>
              <span style={parseInlineStyle('position:relative;width:9px;height:9px;flex-shrink:0;')}>
                <span style={parseInlineStyle('position:absolute;inset:0;border-radius:50%;background:#2563EB;animation:lapulse 2.2s ease-out infinite;')}></span>
                <span style={parseInlineStyle('position:absolute;inset:0;border-radius:50%;background:#2563EB;')}></span>
              </span>
              <span style={parseInlineStyle('font:700 13px/1 var(--font-serif,serif);color:#2563EB;')}>Agent is watching</span>
            </div>
            <div style={parseInlineStyle('font-size:12px;color:#6B6459;line-height:1.4;')}>Last scanned 6 min ago · 214 listings in range</div>
          </div>
        </aside>

        {/* main */}
        <div>
          <div style={parseInlineStyle('display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:8px;flex-wrap:wrap;gap:10px;')}>
            <div>
              <h1 style={parseInlineStyle('font:700 26px/1 var(--font-serif,serif);letter-spacing:-.5px;color:#1C1A17;margin:0 0 6px;')}>Your top picks</h1>
              <p style={parseInlineStyle('font-size:14px;color:#6B6459;margin:0;')}>
                {v.allCount} cars matched and ranked to your brief — no sifting required.
              </p>
            </div>
            <div style={parseInlineStyle('display:flex;align-items:center;gap:10px;flex-shrink:0;')}>
              <button
                onClick={v.goPackets}
                style={parseInlineStyle(
                  'display:inline-flex;align-items:center;gap:7px;background:#fff;border:1px solid #E7E2D9;border-radius:8px;padding:9px 14px;font-size:13px;font-weight:600;font-family:inherit;color:#6B6459;cursor:pointer;',
                )}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={parseInlineStyle('display:block;')}>
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"></path>
                  <path d="M14 2v6h6"></path>
                  <path d="M8 13h8"></path>
                  <path d="M8 17h8"></path>
                </svg>
                Deal packets ({v.packetCount})
              </button>
              <label style={parseInlineStyle('position:relative;display:inline-flex;align-items:center;')}>
                <select value={v.sortBy} onChange={v.onSort} style={parseInlineStyle(v.sortSelectStyle)}>
                  {v.sortOpts.map((o, i) => (
                    <option key={i} value={o.value}>{o.label}</option>
                  ))}
                </select>
                <span style={parseInlineStyle('position:absolute;right:11px;pointer-events:none;color:#9C9189;font-size:10px;')}>▾</span>
              </label>
            </div>
          </div>

          {/* filter bar */}
          <div style={parseInlineStyle('display:flex;align-items:center;gap:10px;margin-top:14px;flex-wrap:wrap;')}>
            <div style={parseInlineStyle('display:inline-flex;background:#F5F1EB;border-radius:8px;padding:4px;')}>
              <button onClick={v.onFilterAll} style={parseInlineStyle(v.filterAllStyle)}>All ({v.allCount})</button>
              <button onClick={v.onFilterSaved} style={parseInlineStyle(v.filterSavedStyle)}>Saved ({v.savedCount})</button>
            </div>
            <div style={parseInlineStyle('display:flex;align-items:center;gap:8px;')}>
              <label style={parseInlineStyle('position:relative;display:inline-flex;align-items:center;')}>
                <select value={v.conditionFilter} onChange={v.onConditionFilter} style={parseInlineStyle(v.conditionSelectStyle)}>
                  {v.conditionOpts.map((o, i) => (
                    <option key={i} value={o.value}>{o.label}</option>
                  ))}
                </select>
                <span style={parseInlineStyle('position:absolute;right:11px;pointer-events:none;color:#9C9189;font-size:10px;')}>▾</span>
              </label>
              <label style={parseInlineStyle('position:relative;display:inline-flex;align-items:center;')}>
                <select value={v.fuelFilter} onChange={v.onFuelFilter} style={parseInlineStyle(v.fuelSelectStyle)}>
                  {v.fuelFilterOpts.map((o, i) => (
                    <option key={i} value={o.value}>{o.label}</option>
                  ))}
                </select>
                <span style={parseInlineStyle('position:absolute;right:11px;pointer-events:none;color:#9C9189;font-size:10px;')}>▾</span>
              </label>
              {v.filtersActive && (
                <button onClick={v.onClearFilters} style={parseInlineStyle('background:none;border:none;color:#0F766E;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit;')}>
                  Clear
                </button>
              )}
            </div>
          </div>

          {v.showNotes && (
            <div style={parseInlineStyle('margin:16px 0;background:#FFFBEB;border:1px solid #FCD34D;border-left:3px solid #B45309;border-radius:8px;padding:13px 16px;')}>
              <span style={parseInlineStyle('font-size:10px;font-weight:700;letter-spacing:.8px;color:#B45309;text-transform:uppercase;display:block;margin-bottom:4px;')}>Continuous monitoring</span>
              <span style={parseInlineStyle('font-size:13px;line-height:1.5;color:#6B6459;')}>
                The violet &quot;Agent is watching&quot; rail is the core promise — it keeps working between visits.
              </span>
            </div>
          )}

          {/* car cards grid */}
          <div style={parseInlineStyle('display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:18px;align-items:stretch;grid-auto-rows:1fr;')}>
            {v.savedEmpty && (
              <div style={parseInlineStyle('grid-column:1 / -1;text-align:center;background:#fff;border:1.5px dashed #E7E2D9;border-radius:12px;padding:48px 28px;')}>
                <div style={parseInlineStyle('font-size:28px;line-height:1;margin-bottom:12px;color:#9C9189;')}>♡</div>
                <div style={parseInlineStyle('font:700 17px/1 var(--font-serif,serif);color:#1C1A17;margin-bottom:8px;')}>Nothing saved yet.</div>
                <p style={parseInlineStyle('font-size:14px;color:#6B6459;line-height:1.6;max-width:360px;margin:0 auto;')}>
                  Tap the heart on any car and I&apos;ll track it between visits — and ping you the moment the price moves.
                </p>
              </div>
            )}
            {v.filterEmpty && (
              <div style={parseInlineStyle('grid-column:1 / -1;text-align:center;background:#fff;border:1.5px dashed #E7E2D9;border-radius:12px;padding:48px 28px;')}>
                <div style={parseInlineStyle('font:700 17px/1 var(--font-serif,serif);color:#1C1A17;margin-bottom:8px;')}>No cars match these filters.</div>
                <p style={parseInlineStyle('font-size:14px;color:#6B6459;line-height:1.6;max-width:360px;margin:0 auto 18px;')}>
                  Try widening the condition or fuel type.
                </p>
                <button
                  onClick={v.onClearFilters}
                  style={parseInlineStyle('background:#0F766E;color:#fff;border:none;border-radius:8px;padding:10px 20px;font:700 13px/1 var(--font-serif,serif);cursor:pointer;')}
                >
                  Clear filters
                </button>
              </div>
            )}
            {v.shortlistCars.map(c => (
              <div key={c.id} style={parseInlineStyle('background:#fff;border:1px solid #E7E2D9;border-radius:12px;overflow:hidden;display:flex;flex-direction:column;box-shadow:0 1px 2px rgba(28,26,23,0.06);')}>
                {/* card top bar */}
                <div style={parseInlineStyle('display:flex;justify-content:space-between;align-items:center;padding:11px 16px 11px 18px;border-bottom:1px solid #F5F1EB;')}>
                  <button onClick={c.onCompare} style={parseInlineStyle(c.compareStyle)}>
                    <span style={parseInlineStyle(c.compareBoxStyle)}>{c.compareMark}</span>
                    Compare
                  </button>
                  <div style={parseInlineStyle('display:flex;align-items:center;gap:10px;')}>
                    {c.saved && (
                      <span
                        style={parseInlineStyle(
                          'display:inline-flex;align-items:center;gap:6px;background:#E8F0FE;border:1px solid #BBCFFC;border-radius:999px;padding:3px 10px;font-size:11px;font-weight:700;color:#2563EB;',
                        )}
                      >
                        <span style={parseInlineStyle('position:relative;width:7px;height:7px;')}>
                          <span style={parseInlineStyle('position:absolute;inset:0;border-radius:50%;background:#2563EB;')}></span>
                          <span style={parseInlineStyle('position:absolute;inset:0;border-radius:50%;background:#2563EB;animation:lapulse 2.2s ease-out infinite;')}></span>
                        </span>
                        Watching closely
                      </span>
                    )}
                    <button onClick={c.onSave} style={parseInlineStyle(c.heartStyle)}>
                      {c.heartGlyph}
                    </button>
                  </div>
                </div>
                {c.showSavedConfirm && (
                  <div style={parseInlineStyle('background:#E8F0FE;border-bottom:1px solid #BBCFFC;padding:9px 18px;font-size:12px;font-weight:600;color:#2563EB;')}>
                    Saved — I&apos;ll watch this one closely and ping you on price drops.
                  </div>
                )}

                {/* card body */}
                <div onClick={c.goDetail} style={parseInlineStyle('display:flex;flex-direction:column;gap:14px;padding:18px;flex:1;cursor:pointer;')}>
                  {/* photo */}
                  <div style={parseInlineStyle('width:100%;height:150px;border-radius:12px;flex-shrink:0;overflow:hidden;position:relative;')}>
                    <ImageSlot src={c.slotSrc} alt={c.slotPlaceholder} />
                  </div>
                  <div style={parseInlineStyle('flex:1;min-width:0;')}>
                    {/* name + fit */}
                    <div style={parseInlineStyle('display:flex;justify-content:space-between;gap:12px;margin-bottom:10px;')}>
                      <div>
                        <div style={parseInlineStyle('font:700 17px/1.2 var(--font-serif,serif);color:#1C1A17;margin-bottom:3px;')}>{c.name}</div>
                        <div style={parseInlineStyle('font-size:13px;color:#6B6459;')}>{c.miles} · {c.distance}</div>
                      </div>
                      <div style={parseInlineStyle('text-align:center;flex-shrink:0;')}>
                        <div style={parseInlineStyle(c.fitStyle)}>{c.fit}</div>
                        <div style={parseInlineStyle('font-size:9px;font-weight:500;color:#9C9189;margin-top:3px;letter-spacing:.04em;text-transform:uppercase;')}>Fit</div>
                      </div>
                    </div>
                    {/* price row */}
                    <div style={parseInlineStyle('display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:10px;')}>
                      <div>
                        <span style={parseInlineStyle('font:700 26px/1 var(--font-mono,monospace);color:#0F766E;font-variant-numeric:tabular-nums;')}>{c.tco}</span>
                        <br />
                        <span style={parseInlineStyle('font-size:11px;font-weight:500;color:#9C9189;')}>est. all-in / mo</span>
                      </div>
                      <div style={parseInlineStyle('text-align:right;font-size:13px;color:#6B6459;')}>
                        <span style={parseInlineStyle('font:600 14px/1 var(--font-mono,monospace);color:#1C1A17;font-variant-numeric:tabular-nums;')}>{c.otd}</span>
                        <br />
                        out the door
                      </div>
                    </div>
                    {/* deal verdict + delta */}
                    <div style={parseInlineStyle('display:flex;align-items:center;gap:6px;margin-bottom:10px;flex-wrap:wrap;')}>
                      <span style={parseInlineStyle(c.dealStyle)}>{c.dealLabel}</span>
                      {c.dealDelta && (
                        <>
                          <span style={parseInlineStyle('font:600 13px/1 var(--font-mono,monospace);color:#6B6459;font-variant-numeric:tabular-nums;')}>{c.dealDelta}</span>
                          <span style={parseInlineStyle('font-size:12px;color:#9C9189;')}>vs {c.dealComps}</span>
                        </>
                      )}
                    </div>
                    {/* must-have chips */}
                    {c.hasMustHaveChips && (
                      <div style={parseInlineStyle('display:flex;gap:5px;flex-wrap:wrap;margin-bottom:10px;')}>
                        {c.mustHaveChips.map((mh, i) => (
                          <span key={i} style={parseInlineStyle(mh.style)}>{mh.icon}{mh.label}</span>
                        ))}
                      </div>
                    )}
                    {/* condition + fuel tags */}
                    <div style={parseInlineStyle('display:flex;align-items:center;gap:7px;margin-bottom:12px;flex-wrap:wrap;')}>
                      <span style={parseInlineStyle('background:#F5F1EB;border:1px solid #E7E2D9;border-radius:7px;padding:4px 9px;font-size:12px;font-weight:500;color:#6B6459;display:inline-flex;align-items:center;gap:5px;')}>
                        {c.conditionIcon}{c.condition}
                      </span>
                      <span style={parseInlineStyle('background:#F5F1EB;border:1px solid #E7E2D9;border-radius:7px;padding:4px 9px;font-size:12px;font-weight:500;color:#6B6459;display:inline-flex;align-items:center;gap:5px;')}>
                        {c.fuelIcon}{c.fuelType}
                      </span>
                      <span style={parseInlineStyle('font-size:12px;color:#9C9189;')}>{c.dealer}</span>
                    </div>
                    {/* pros + cons */}
                    <div style={parseInlineStyle('display:flex;gap:16px;flex-wrap:wrap;')}>
                      <div style={parseInlineStyle('flex:1;min-width:140px;')}>
                        {c.pros.map((p, i) => (
                          <div key={i} style={parseInlineStyle('font-size:13px;color:#1C1A17;line-height:1.5;display:flex;gap:6px;margin-bottom:2px;')}>
                            <span style={parseInlineStyle('color:#15803D;font-weight:700;flex-shrink:0;')}>+</span>{p}
                          </div>
                        ))}
                      </div>
                      <div style={parseInlineStyle('flex:1;min-width:140px;')}>
                        {c.cons.map((n, i) => (
                          <div key={i} style={parseInlineStyle('font-size:13px;color:#1C1A17;line-height:1.5;display:flex;gap:6px;margin-bottom:2px;')}>
                            <span style={parseInlineStyle('color:#B91C1C;font-weight:700;flex-shrink:0;')}>–</span>{n}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* why this car — agent blue */}
                <button
                  onClick={c.onToggle}
                  style={parseInlineStyle(
                    'width:100%;text-align:left;background:#E8F0FE;border:none;border-top:1px solid #E8F0FE;padding:13px 18px;font-size:13px;font-weight:600;color:#2563EB;cursor:pointer;font-family:inherit;display:flex;justify-content:space-between;align-items:center;',
                  )}
                >
                  <span style={parseInlineStyle('display:flex;align-items:center;gap:6px;')}>
                    <span style={parseInlineStyle('width:7px;height:7px;border-radius:50%;background:#2563EB;flex-shrink:0;')}></span>
                    Why this car?
                  </span>
                  <span style={parseInlineStyle('color:#BBCFFC;font-size:11px;')}>{c.caret}</span>
                </button>
                {c.expanded && (
                  <div style={parseInlineStyle('padding:14px 18px;background:#E8F0FE;border-top:1px solid #DBEAFE;font-size:14px;line-height:1.65;color:#6B6459;')}>{c.why}</div>
                )}

                {/* honest tradeoff */}
                {c.tradeoff && (
                  <div style={parseInlineStyle('padding:11px 18px;background:#FFFBEB;border-top:1px solid #FEF3C7;font-size:13px;line-height:1.5;color:#B45309;')}>
                    <strong style={parseInlineStyle('font-weight:600;')}>Honest tradeoff:</strong> {c.tradeoff}
                  </div>
                )}

                {/* CTA */}
                <div style={parseInlineStyle('padding:12px 18px 16px;background:#fff;border-top:1px solid #F5F1EB;')}>
                  <button
                    onClick={c.goDetail}
                    style={parseInlineStyle('background:#fff;border:1.5px solid #A7D9D3;color:#0F766E;border-radius:8px;padding:10px 16px;font:700 13px/1 var(--font-serif,serif);cursor:pointer;')}
                  >
                    See full breakdown →
                  </button>
                </div>
              </div>
            ))}
          </div>
          {v.showCmpBar && <div style={parseInlineStyle('height:72px;')}></div>}
        </div>
      </div>
    </div>
  );
}
