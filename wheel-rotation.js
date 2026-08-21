(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.SpinOrderWheelRotation = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  function normalize(angle) {
    if (!Number.isFinite(angle)) return 0;
    return ((angle % 360) + 360) % 360;
  }

  const BASE_ANGLE = -Math.PI / 2;

  function sections(participantCount, baseAngle = BASE_ANGLE) {
    if (!Number.isInteger(participantCount) || participantCount < 1 || !Number.isFinite(baseAngle)) return [];
    const sliceAngle = Math.PI * 2 / participantCount;
    return Array.from({length: participantCount}, (_, index) => {
      const startAngle = baseAngle + index * sliceAngle;
      const endAngle = startAngle + sliceAngle;
      return {index, startAngle, endAngle, centerAngle: startAngle + sliceAngle / 2, sliceAngle, baseAngle};
    });
  }

  function degrees(angle) {
    return angle * 180 / Math.PI;
  }

  function cssAngle(angle, baseAngle = BASE_ANGLE) {
    return degrees(angle - baseAngle);
  }

  function layout(participantCount, diameter, hubRadius, outerInset = 10) {
    if (!Number.isFinite(diameter) || diameter <= 0 || !Number.isFinite(hubRadius) || hubRadius < 0) return {centerX: 0, centerY: 0, wheelRadius: 0, hubRadius: 0, labelRadius: 0, sections: []};
    const centerX = diameter / 2, centerY = diameter / 2, wheelRadius = Math.max(hubRadius, diameter / 2 - Math.max(0, outerInset));
    const labelRadius = hubRadius + (wheelRadius - hubRadius) * .58;
    const geometry = sections(participantCount).map(section => ({...section, labelRadius, x: centerX + Math.cos(section.centerAngle) * labelRadius, y: centerY + Math.sin(section.centerAngle) * labelRadius, maxTextWidth: Math.max(1, Math.min(120, section.sliceAngle * labelRadius * .7, (wheelRadius - hubRadius) * .9))}));
    return {centerX, centerY, wheelRadius, hubRadius, labelRadius, sections: geometry};
  }

  function next(currentRotation, section, fullTurns) {
    if (!section || !Number.isFinite(section.centerAngle) || !Number.isFinite(section.baseAngle)) return null;
    const turns = Number.isInteger(fullTurns) && fullTurns >= 1 ? fullTurns : 6;
    const current = Number.isFinite(currentRotation) ? currentRotation : 0;
    const targetAngle = normalize(degrees(section.baseAngle - section.centerAngle));
    const alignmentDelta = normalize(targetAngle - normalize(current));
    const delta = turns * 360 + alignmentDelta;
    return {rotation: current + delta, delta, targetAngle};
  }

  function fitLabel(name, maxWidth, preferredSize, minimumSize, measureWidth) {
    const fullName = typeof name === 'string' ? name : '';
    const available = Number.isFinite(maxWidth) && maxWidth > 0 ? maxWidth : 1;
    const minimum = Number.isFinite(minimumSize) && minimumSize > 0 ? minimumSize : 5;
    let fontSize = Number.isFinite(preferredSize) && preferredSize >= minimum ? preferredSize : minimum;
    const measure = text => typeof measureWidth === 'function' ? measureWidth(text, fontSize) : text.length * fontSize * .58;
    while (fontSize > minimum && measure(fullName) > available) fontSize -= 1;
    if (measure(fullName) <= available) return {text: fullName, fullName, fontSize, truncated: false};
    const ellipsis = '…'; let visual = fullName;
    while (visual && measure(`${visual}${ellipsis}`) > available) visual = visual.slice(0, -1);
    return {text: visual ? `${visual}${ellipsis}` : ellipsis, fullName, fontSize, truncated: true};
  }

  return {BASE_ANGLE, normalize, sections, degrees, cssAngle, layout, next, fitLabel};
});
