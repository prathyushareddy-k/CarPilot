import { Fragment } from 'react';
import type { AppView } from '../_lib/types';
import { parseInlineStyle } from '../_lib/parseInlineStyle';

export default function TopBar({ v }: { v: AppView }) {
  return (
    <div
      style={parseInlineStyle(
        'position:fixed;top:0;left:0;right:0;height:60px;background:#fff;border-bottom:1px solid #E7E2D9;display:flex;align-items:center;gap:14px;padding:0 20px;z-index:100;box-shadow:0 1px 2px rgba(28,26,23,0.06);',
      )}
    >
      <button
        onClick={v.goShortlist}
        style={parseInlineStyle('display:flex;align-items:center;gap:9px;flex-shrink:0;background:none;border:none;cursor:pointer;font-family:inherit;padding:0;')}
      >
        <div style={parseInlineStyle('width:28px;height:28px;border-radius:8px;background:#0F766E;display:flex;align-items:center;justify-content:center;')}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 13l1.2-3.6A2 2 0 018.1 8h7.8a2 2 0 011.9 1.4L19 13"></path>
            <path d="M5 13h14v4a1 1 0 01-1 1h-1a1 1 0 01-1-1v-1H8v1a1 1 0 01-1 1H6a1 1 0 01-1-1z"></path>
            <circle cx="7.5" cy="16.5" r=".7"></circle>
            <circle cx="16.5" cy="16.5" r=".7"></circle>
          </svg>
        </div>
        <span style={parseInlineStyle('font-weight:700;font-size:16px;letter-spacing:-.3px;color:#1C1A17;font-family:var(--font-serif,serif);')}>CarPilot</span>
      </button>
      <div style={parseInlineStyle('flex:1;')}></div>
      <div style={parseInlineStyle('display:flex;align-items:center;gap:8px;flex-shrink:0;')}>
        {v.sShortlist && (
          <div style={parseInlineStyle('position:relative;flex-shrink:0;')}>
            <button onClick={v.toggleAlerts} aria-label="Alerts" style={parseInlineStyle(v.bellBtnStyle)}>
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={parseInlineStyle('display:block;')}
              >
                <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                <path d="M13.73 21a2 2 0 01-3.46 0"></path>
              </svg>
              {v.hasAlerts && (
                <span
                  style={parseInlineStyle(
                    'position:absolute;top:1px;right:1px;min-width:17px;height:17px;padding:0 4px;border-radius:999px;background:#B91C1C;color:#fff;font-size:10px;font-weight:700;display:flex;align-items:center;justify-content:center;border:2px solid #fff;',
                  )}
                >
                  {v.alertCount}
                </span>
              )}
            </button>

            {v.alertsOpen && (
              <>
                <div onClick={v.closeAlerts} style={parseInlineStyle('position:fixed;inset:0;z-index:110;')}></div>
                <div
                  style={parseInlineStyle(
                    'position:absolute;top:calc(100% + 10px);right:0;width:400px;max-width:calc(100vw - 32px);background:#fff;border:1px solid #E7E2D9;border-radius:12px;box-shadow:0 20px 60px rgba(28,26,23,.18);z-index:120;overflow:hidden;',
                  )}
                >
                  <div style={parseInlineStyle('display:flex;justify-content:space-between;align-items:center;padding:16px 20px;border-bottom:1px solid #E7E2D9;')}>
                    <div style={parseInlineStyle('display:flex;align-items:center;gap:8px;')}>
                      <span style={parseInlineStyle('font:700 15px/1 var(--font-serif,serif);color:#1C1A17;')}>Notifications</span>
                      {v.hasAlerts && (
                        <span
                          style={parseInlineStyle(
                            'background:#0F766E;color:#fff;border-radius:999px;font-size:11px;font-weight:700;min-width:20px;height:20px;padding:0 5px;display:inline-flex;align-items:center;justify-content:center;',
                          )}
                        >
                          {v.alertCount}
                        </span>
                      )}
                    </div>
                    {v.hasAlerts && (
                      <button onClick={v.clearAllAlerts} style={parseInlineStyle('background:none;border:none;color:#0F766E;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit;')}>
                        Clear all
                      </button>
                    )}
                  </div>
                  <div style={parseInlineStyle('max-height:calc(100vh - 120px);overflow-y:auto;')}>
                    {v.noAlerts && (
                      <div style={parseInlineStyle('padding:40px 24px;text-align:center;')}>
                        <div
                          style={parseInlineStyle(
                            'width:48px;height:48px;border-radius:12px;background:#F5F1EB;color:#9C9189;display:flex;align-items:center;justify-content:center;margin:0 auto 14px;',
                          )}
                        >
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                            <path d="M13.73 21a2 2 0 01-3.46 0"></path>
                          </svg>
                        </div>
                        <div style={parseInlineStyle('font:700 15px/1 var(--font-serif,serif);color:#1C1A17;margin-bottom:6px;')}>You&apos;re all caught up</div>
                        <div style={parseInlineStyle('font-size:13px;color:#6B6459;line-height:1.5;max-width:240px;margin:0 auto;')}>
                          Your agent keeps watching. Price drops and new matches show here.
                        </div>
                      </div>
                    )}
                    {v.alertList.map((a, i) => (
                      <Fragment key={i}>
                        <div style={parseInlineStyle('position:relative;padding:16px 20px;border-bottom:1px solid #F5F1EB;')}>
                          <button
                            onClick={a.onDismiss}
                            aria-label="Dismiss"
                            style={parseInlineStyle('position:absolute;top:14px;right:14px;background:none;border:none;color:#9C9189;font-size:18px;line-height:1;cursor:pointer;font-family:inherit;padding:4px;border-radius:6px;')}
                          >
                            ×
                          </button>
                          <div style={parseInlineStyle('display:flex;align-items:center;gap:8px;margin-bottom:8px;')}>
                            <span style={parseInlineStyle(a.tagStyle)}>{a.type}</span>
                            <span style={parseInlineStyle('font-size:12px;color:#9C9189;')}>{a.time}</span>
                          </div>
                          <div onClick={a.onOpen} style={parseInlineStyle(a.bodyStyle)}>
                            <div style={parseInlineStyle('font:600 14px/20px var(--font-serif,serif);color:#1C1A17;margin-bottom:4px;padding-right:20px;')}>{a.title}</div>
                            <div style={parseInlineStyle('font-size:13px;line-height:1.55;color:#6B6459;')}>{a.body}</div>
                            {a.hasCta && (
                              <div style={parseInlineStyle('font-size:13px;font-weight:600;color:#0F766E;margin-top:8px;')}>{a.cta} →</div>
                            )}
                          </div>
                        </div>
                      </Fragment>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
