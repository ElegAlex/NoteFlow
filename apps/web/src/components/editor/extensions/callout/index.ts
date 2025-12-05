// ===========================================
// Export Callout Extension (US-015)
// ===========================================

export { CalloutExtension } from './Callout';
export { CalloutView } from './CalloutView';
export {
  type CalloutType,
  CALLOUT_ICONS,
  CALLOUT_COLORS,
  CALLOUT_LABELS,
  CALLOUT_ALIASES,
  resolveCalloutType,
} from './constants';
export {
  serializeCalloutToMarkdown,
  parseCalloutFromMarkdown,
  calloutMarkdownSerializerSpec,
} from './serializer';
