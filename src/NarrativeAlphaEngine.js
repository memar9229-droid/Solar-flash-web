/**
 * NarrativeAlphaEngine.js — Solar Flash Alpha Integration Layer
 * Exposes Narrative Radar V2 intelligence for Alpha Engine consumption
 *
 * All values are structured for direct consumption by:
 * - Alpha Engine V1
 * - Opportunity Scanner
 * - Smart Money Intelligence
 * - Future AI systems
 */

// ── ALPHA DATA SCHEMA ──────────────────────────────────────────
// This is the canonical data structure every intelligence system reads

/**
 * @typedef {Object} NarrativeAlphaData
 * @property {string}  id                  - Unique narrative identifier
 * @property {string}  name                - Display name
 * @property {number}  narrativeScore      - 0-100 overall narrative strength
 * @property {number}  confidenceScore     - 0-100 confidence in trend direction
 * @property {string}  lifecycleStage      - Birth|Growth|Expansion|Maturity|Saturation|Decline
 * @property {string}  emergingStatus      - EarlySignal|Emerging|Confirmed|Dominant
 * @property {string}  momentum            - Rising|Stable|Falling
 * @property {number}  capitalFlow         - Estimated $ billions 7d flow (+/-)
 * @property {number}  capitalFlowScore    - 0-100 normalized capital flow score
 * @property {number}  persistenceScore    - 0-100 how long signal has held
 * @property {number}  engagementScore     - 0-100 market engagement level
 * @property {boolean} isEmerging          - True if early-stage opportunity
 * @property {boolean} isRisked            - True if distribution/declining
 * @property {Object}  rotation            - {from, to, strength} capital rotation signals
 * @property {Object}  ai                  - {summary, risks, outlook, confidenceAnalysis}
 * @property {number}  alphaScore          - Composite score for Alpha Engine
 * @property {number}  timestamp           - Unix timestamp of last update
 */

export function buildAlphaPayload(narrative) {
  const lifecycle = narrative.lifecycleV2 || narrative.lifecycle;
  const lifecycleOrder = {
    "Birth":10,"Growth":25,"Expansion":45,"Maturity":60,"Saturation":75,"Decline":90,
    "Emerging":15,"Early Growth":28,"Expanding":45,
  };

  // Alpha Score: weighted composite
  const alphaScore = Math.round(
    narrative.narrativeScore    * 0.30 +
    narrative.confidenceScore   * 0.25 +
    narrative.capitalFlowScore  * 0.20 +
    narrative.persistenceScore  * 0.15 +
    narrative.engagementScore   * 0.10
  );

  return {
    id:               narrative.id,
    name:             narrative.name,
    narrativeScore:   narrative.narrativeScore   || narrative.score,
    confidenceScore:  narrative.confidenceScore,
    lifecycleStage:   lifecycle,
    lifecycleOrder:   lifecycleOrder[lifecycle] || 50,
    emergingStatus:   narrative.emergingStatus,
    momentum:         narrative.momentum,
    capitalFlow:      narrative.capitalFlow,
    capitalFlowScore: narrative.capitalFlowScore,
    persistenceScore: narrative.persistenceScore,
    engagementScore:  narrative.engagementScore,
    isEmerging:       ["Birth","Growth","Early Growth","Emerging"].includes(lifecycle),
    isRisked:         ["Saturation","Decline","Declining"].includes(lifecycle),
    rotation:         narrative.rotation || null,
    ai:               narrative.ai || null,
    alphaScore,
    timestamp:        Date.now(),
  };
}

export function getAlphaFeed(narratives) {
  return narratives
    .map(n => buildAlphaPayload(n))
    .sort((a,b) => b.alphaScore - a.alphaScore);
}

export function getEmergingNarratives(narratives) {
  return narratives
    .filter(n => n.isEmerging && n.confidenceScore >= 50)
    .sort((a,b) => b.confidenceScore - a.confidenceScore);
}

export function getRotationSignals(narratives) {
  return narratives
    .filter(n => n.rotation)
    .map(n => ({ narrative: n.name, ...n.rotation }));
}

export const ALPHA_ENGINE_VERSION = "2.0.0";
export const DATA_SCHEMA_VERSION  = "2.0.0";
