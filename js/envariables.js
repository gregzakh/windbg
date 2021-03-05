/*
 * .scriptload envariables.js
 * dx -g @$GetVariables()
 */
'use strict';

const log = s => host.diagnostics.debugLog('${x}\n');

class Variable {
  constructor(address, name, value) {
    this.Address = address;
    this.Name = name;
    this.Value = value;
  }
}

function *GetVariables() {
  if (host.namespace.Debugger.Sessions.First().Attributes.Target.IsKernelTarget) {
    log('Incorrect debugger environment.');
    return;
  }

  let peb = host.namespace.Debugger.State.PseudoRegisters.General.peb;
  let pnt = peb.ProcessParameters.Environment.address;
  let ofs = 0;

  while (true) {
    let adr = pnt.add(ofs);
    let str = host.memory.readWideString(adr);
    if (0 === str.length) break;

    let val = str.match(/(=?[^=]+)/g);
    yield(new Variable(adr, val[0], val[1].replace(/./, '')));

    ofs += (str.length + 1) * 2;
  }
}

function initializeScript() {
  return [new host.functionAlias(GetVariables, 'GetVariables')];
}
