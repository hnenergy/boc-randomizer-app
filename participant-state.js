(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.SpinOrderParticipants = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const STORAGE_KEY = 'spinorder-participants-v2';
  const VERSION = 2;
  const MIN_NAMES = 2;
  const MANUAL_MAX_NAMES = 20;
  const IMPORT_MAX_NAMES = 60;
  const MAX_NAME_LENGTH = 50;
  const MAX_FILE_SIZE = 100 * 1024;
  const HEADERS = new Set(['name', 'participant', 'team']);

  function clean(value) { return typeof value === 'string' ? value.trim() : ''; }
  function duplicateIndex(names, value, except = -1) {
    const key = value.toLocaleLowerCase();
    return names.findIndex((name, index) => index !== except && name.toLocaleLowerCase() === key);
  }
  function validateName(value, names = [], except = -1) {
    const name = clean(value);
    if (!name) return {valid: false, error: 'Enter a name before adding it.'};
    if (name.length > MAX_NAME_LENGTH) return {valid: false, error: `Names must be ${MAX_NAME_LENGTH} characters or fewer.`};
    if (duplicateIndex(names, name, except) !== -1) return {valid: false, error: 'That name is already in the list. Names must be unique.'};
    return {valid: true, name};
  }
  function validateList(values, requireMinimum = true, limit = IMPORT_MAX_NAMES) {
    if (!Array.isArray(values)) return {valid: false, names: [], error: 'The participant list is invalid.'};
    const names = values.map(clean);
    if (names.some(name => !name)) return {valid: false, names, error: 'Remove or complete blank names.'};
    const tooLong = names.find(name => name.length > MAX_NAME_LENGTH);
    if (tooLong) return {valid: false, names, error: `Names must be ${MAX_NAME_LENGTH} characters or fewer.`};
    const seen = new Set();
    for (const name of names) {
      const key = name.toLocaleLowerCase();
      if (seen.has(key)) return {valid: false, names, error: `Duplicate name: ${name}. Names must be unique.`};
      seen.add(key);
    }
    if (names.length > limit) return {valid: false, names, error: `Use no more than ${limit} names.`};
    if (requireMinimum && names.length < MIN_NAMES) return {valid: false, names, error: `Add at least ${MIN_NAMES} names.`};
    return {valid: true, names};
  }
  function add(names, value, limit = MANUAL_MAX_NAMES) {
    if (names.length >= limit) return {valid: false, names: [...names], error: `You can add up to ${limit} names.`};
    const result = validateName(value, names);
    return result.valid ? {valid: true, names: [...names, result.name]} : {valid: false, names: [...names], error: result.error};
  }
  function edit(names, index, value) {
    if (!Number.isInteger(index) || index < 0 || index >= names.length) return {valid: false, names: [...names], error: 'That participant could not be edited.'};
    const result = validateName(value, names, index);
    if (!result.valid) return {valid: false, names: [...names], error: result.error};
    const updated = [...names]; updated[index] = result.name; return {valid: true, names: updated};
  }
  function remove(names, index) { return names.filter((_, itemIndex) => itemIndex !== index); }
  function exampleNames() { return Array.from({length: 12}, (_, index) => `Team ${index + 1}`); }

  function parseDelimited(text) {
    const fields = []; let value = ''; let quoted = false;
    const source = typeof text === 'string' ? text : '';
    for (let index = 0; index < source.length; index++) {
      const character = source[index];
      if (character === '"') {
        if (quoted && source[index + 1] === '"') { value += '"'; index++; }
        else quoted = !quoted;
      } else if (!quoted && (character === ',' || character === '\n' || character === '\r')) {
        fields.push(value); value = '';
        if (character === '\r' && source[index + 1] === '\n') index++;
      } else value += character;
    }
    fields.push(value);
    return fields.map(clean).filter(Boolean);
  }
  function validateFile(name, size) {
    if (!/\.(txt|csv)$/i.test(typeof name === 'string' ? name : '')) return {valid: false, error: 'Choose a .txt or .csv file.'};
    if (!Number.isFinite(size) || size > MAX_FILE_SIZE) return {valid: false, error: 'The file must be 100 KB or smaller.'};
    return {valid: true};
  }
  function baseFilename(name) {
    const value=typeof name==='string'?name:'';return (value.split(/[\\/]/).pop()||'names').replace(/[\u0000-\u001f\u007f]/g,'').slice(0,100);
  }
  function importNames(fileName, fileSize, text) {
    const file = validateFile(fileName, fileSize); if (!file.valid) return file;
    const parsed = parseDelimited(text);
    if (parsed.length && HEADERS.has(parsed[0].toLocaleLowerCase())) parsed.shift();
    const list = validateList(parsed, true, IMPORT_MAX_NAMES),filename=baseFilename(fileName);
    return list.valid ? {valid: true, names: list.names, filename, summary: `${list.names.length} names imported from ${filename}`} : list;
  }
  function positions(count) { return Array.from({length: count}, (_, index) => index + 1); }
  function revealPositions(count,direction) {const result=positions(count);return direction==='first'?result:[...result].reverse()}
  function wheelEntries(names, colors) { return names.map((name, index) => ({name, color: colors[index % colors.length]})); }
  function save(storage, state) {
    try {const source=state&&typeof state==='object'?state:{};const mode=source.mode==='import'?'import':'manual',limit=mode==='import'?IMPORT_MAX_NAMES:MANUAL_MAX_NAMES;const result=validateList(source.names,false,limit);if(!result.valid)return false;storage.setItem(STORAGE_KEY,JSON.stringify({version:VERSION,names:result.names,mode,filename:mode==='import'?baseFilename(source.filename):''}));return true}
    catch (_) { return false; }
  }
  function load(storage) {
    try {const saved=JSON.parse(storage.getItem(STORAGE_KEY));if(!saved||saved.version!==VERSION)return {names:[],mode:'manual',filename:''};const mode=saved.mode==='import'?'import':'manual',limit=mode==='import'?IMPORT_MAX_NAMES:MANUAL_MAX_NAMES,result=validateList(saved.names,false,limit);return result.valid?{names:result.names,mode,filename:mode==='import'?baseFilename(saved.filename):''}:{names:[],mode:'manual',filename:''}}
    catch (_) { return {names:[],mode:'manual',filename:''}; }
  }

  return {STORAGE_KEY,VERSION,MIN_NAMES,MANUAL_MAX_NAMES,IMPORT_MAX_NAMES,MAX_NAME_LENGTH,MAX_FILE_SIZE,validateName,validateList,add,edit,remove,exampleNames,parseDelimited,validateFile,baseFilename,importNames,positions,revealPositions,wheelEntries,save,load};
});
