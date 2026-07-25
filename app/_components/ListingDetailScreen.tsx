import { Fragment } from 'react';
import type { AppView } from '../_lib/types';
import { parseInlineStyle } from '../_lib/parseInlineStyle';
import ImageSlot from './ImageSlot';

export default function ListingDetailScreen({ v }: { v: AppView }) {
  return (
    <div data-screen-label="Listing Detail" style={parseInlineStyle('min-height:calc(100vh - 60px);')}>
      <div style={parseInlineStyle('max-width:980px;margin:0 auto;padding:28px 32px;')}>
        <button
          onClick={v.goShortlist}
          style={parseInlineStyle('background:none;border:none;color:#6B6459;font-size:14px;font-weight:600;cursor:pointer;font-family:inherit;margin-bottom:16px;')}
        >
          ← Back to your Top picks
        </button>
        <div style={parseInlineStyle('display:grid;grid-template-columns:1.3fr 1fr;gap:24px;align-items:start;')}>
          {/* left */}
          <div>
            <div style={parseInlineStyle('width:100%;height:300px;border-radius:12px;overflow:hidden;position:relative;margin-bottom:16px;')}>
              <ImageSlot src={v.detailSlotSrc} alt={'Photo of ' + v.detailName} />
            </div>
            <div style={parseInlineStyle('display:flex;justify-content:space-between;align-items:flex-start;gap:12px;')}>
              <div>
                <h1 style={parseInlineStyle('font:800 28px/1.15 var(--font-serif,serif);letter-spacing:-.7px;margin:0 0 4px;color:#1C1A17;')}>{v.detailName}</h1>
                <div style={parseInlineStyle('font-size:14px;color:#6B6459;margin-bottom:16px;')}>{v.detailSub}</div>
              </div>
              <button onClick={v.onDetailSave} style={parseInlineStyle(v.detailHeartStyle)}>
                {v.detailHeartGlyph}
              </button>
            </div>
            {v.detailJustSaved && (
              <div style={parseInlineStyle('background:#E8F0FE;border:1px solid #BBCFFC;border-radius:9px;padding:9px 13px;font-size:12.5px;font-weight:600;color:#2563EB;margin-bottom:18px;')}>
                Saved — I&apos;ll watch this one closely and ping you on price drops.
              </div>
            )}

            <h3 style={parseInlineStyle('font:700 15px/1 var(--font-serif,serif);margin:0 0 14px;color:#1C1A17;')}>Fit Score breakdown</h3>
            <div style={parseInlineStyle('background:#fff;border:1px solid #E7E2D9;border-radius:12px;padding:20px;')}>
              <div style={parseInlineStyle('display:flex;align-items:center;gap:14px;margin-bottom:18px;')}>
                <div style={parseInlineStyle(v.detailFitBadgeStyle)}>
                  {v.detailFit}
                </div>
                <div>
                  <div style={parseInlineStyle('font:700 15px/1 var(--font-serif,serif);color:#1C1A17;')}>{v.detailFitLabel}</div>
                  <div style={parseInlineStyle('font-size:13px;color:#6B6459;margin-top:3px;')}>High on the things you weighted most.</div>
                </div>
              </div>
              {v.fitBreak.map((f, i) => (
                <Fragment key={i}>
                  <div style={parseInlineStyle('margin-bottom:14px;')}>
                    <div style={parseInlineStyle('display:flex;justify-content:space-between;margin-bottom:5px;')}>
                      <span style={parseInlineStyle('font-size:13px;font-weight:600;color:#1C1A17;')}>{f.label}</span>
                      <span style={parseInlineStyle('font-size:12px;color:#6B6459;')}>{f.note}</span>
                    </div>
                    <div style={parseInlineStyle('height:7px;background:#F5F1EB;border-radius:99px;overflow:hidden;')}>
                      <div style={parseInlineStyle(`height:100%;border-radius:99px;width:${f.pct};background:${f.color};`)}></div>
                    </div>
                  </div>
                </Fragment>
              ))}
              <div style={parseInlineStyle('display:flex;gap:14px;margin-top:2px;margin-bottom:2px;')}>
                <div style={parseInlineStyle('display:flex;align-items:center;gap:5px;')}>
                  <div style={parseInlineStyle('width:10px;height:10px;border-radius:3px;background:#0F766E;flex-shrink:0;')}></div>
                  <span style={parseInlineStyle('font-size:11px;color:#6B6459;')}>Strong</span>
                </div>
                <div style={parseInlineStyle('display:flex;align-items:center;gap:5px;')}>
                  <div style={parseInlineStyle('width:10px;height:10px;border-radius:3px;background:#A7D9D3;flex-shrink:0;')}></div>
                  <span style={parseInlineStyle('font-size:11px;color:#6B6459;')}>Moderate</span>
                </div>
              </div>
              <div style={parseInlineStyle('border-top:1px dashed #E7E2D9;margin-top:10px;padding-top:14px;font-size:13px;line-height:1.5;color:#6B6459;')}>
                <strong style={parseInlineStyle('color:#1C1A17;')}>Honest tradeoff:</strong> {v.detailTradeoff}
              </div>
            </div>

            <h3 style={parseInlineStyle('font:700 15px/1 var(--font-serif,serif);margin:26px 0 14px;color:#1C1A17;')}>Specs, safety &amp; history</h3>
            <div style={parseInlineStyle('display:grid;grid-template-columns:1fr 1fr;gap:10px;')}>
              {v.specs.map((sItem, i) => (
                <Fragment key={i}>
                  <div style={parseInlineStyle('background:#fff;border:1px solid #E7E2D9;border-radius:10px;padding:13px 15px;')}>
                    <div style={parseInlineStyle('font-size:11px;color:#9C9189;font-weight:600;text-transform:uppercase;letter-spacing:.4px;margin-bottom:3px;')}>{sItem.k}</div>
                    <div style={parseInlineStyle('font-size:14px;font-weight:600;color:#1C1A17;')}>{sItem.v}</div>
                  </div>
                </Fragment>
              ))}
            </div>
          </div>

          {/* right: deal judge + cta */}
          <div style={parseInlineStyle('position:sticky;top:88px;')}>
            <div style={parseInlineStyle('background:#fff;border:1px solid #E7E2D9;border-radius:12px;padding:22px;')}>
              <div
                style={parseInlineStyle(
                  'display:flex;align-items:baseline;justify-content:space-between;gap:10px;padding-bottom:16px;margin-bottom:16px;border-bottom:1px solid #F5F1EB;',
                )}
              >
                <div>
                  <div style={parseInlineStyle('font-size:11px;font-weight:700;letter-spacing:.5px;color:#9C9189;margin-bottom:4px;')}>EST. ALL-IN MONTHLY</div>
                  <div style={parseInlineStyle('font:800 34px/1 var(--font-mono,monospace);color:#1C1A17;letter-spacing:-1px;font-variant-numeric:tabular-nums;')}>
                    {v.detailTco}<span style={parseInlineStyle('font:600 16px/1 var(--font-mono,monospace);color:#9C9189;letter-spacing:0;')}>/mo</span>
                  </div>
                  <div style={parseInlineStyle('font-size:12px;color:#9C9189;margin-top:5px;')}>{v.detailOtdNote}</div>
                </div>
              </div>
              <div style={parseInlineStyle('display:flex;align-items:center;gap:8px;margin-bottom:14px;')}>
                <span style={parseInlineStyle('font-size:12px;font-weight:700;letter-spacing:.6px;color:#9C9189;')}>DEAL JUDGE</span>
              </div>
              <div style={parseInlineStyle(v.detailDealPillStyle)}>
                <span style={parseInlineStyle('font:800 15px/1 var(--font-serif,serif);')}>{v.detailDealLabel}</span>
              </div>
              <div style={parseInlineStyle('font-size:14px;line-height:1.6;color:#6B6459;margin-bottom:18px;')}>
                {v.detailDealNote}
              </div>
              <div style={parseInlineStyle('background:#FBF8F3;border:1px solid #E7E2D9;border-radius:11px;padding:16px;margin-bottom:16px;')}>
                <div style={parseInlineStyle('font-size:12px;color:#6B6459;font-weight:600;margin-bottom:4px;')}>Estimated negotiation headroom</div>
                <div style={parseInlineStyle('font:800 30px/1 var(--font-mono,monospace);color:#0F766E;letter-spacing:-.5px;font-variant-numeric:tabular-nums;')}>{v.detailHeadroom}</div>
                <div style={parseInlineStyle('font-size:12px;color:#9C9189;margin-top:2px;')}>below asking, based on days-on-lot &amp; comps</div>
              </div>
              <button
                onClick={v.goPacket}
                style={parseInlineStyle(
                  'width:100%;background:#0F766E;color:#fff;border:none;border-radius:11px;padding:16px;font:700 15px/1 var(--font-serif,serif);font-family:inherit;cursor:pointer;box-shadow:0 2px 10px rgba(15,118,110,.25);',
                )}
              >
                Make this my finalist → build deal packet
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
