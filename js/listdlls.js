/*
 * .scriptload listdlls.js
 * dx -g @$ListDlls().Select(x => new {
 *   Addr = x.DllBase, Path = x.FullDllName.Buffer, Size = x.SizeOfImage
 * })
 */
'use strict';

const log = s => host.diagnostics.debugLog('${x}\n');

function *GetListDlls() {
  if (host.namespace.Debugger.Sessions.First().Attributes.Target.IsKernelTarget) {
    log('Incorrect debugger environment.')
    return;
  }

  let peb = host.namespace.Debugger.State.PseudoRegisters.General.peb;
  let lst = host.namespace.Debugger.Utility.Collections.FromListEntry(
    peb.Ldr.InLoadOrderModuleList, 'ntdll!_LDR_DATA_TABLE_ENTRY',
    'InLoadOrderLinks'
  );

  for (let dll of lst) yield dll;
}

function initializeScript() {
  return [new host.functionAlias(GetListDlls, 'ListDlls')];
}
