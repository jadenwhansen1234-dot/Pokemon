/* ============================================================
   POKÉMON ECLIPSE: AURELIA GENESIS — dialogue and menu UI
   ============================================================ */
'use strict';

const UI = (() => {
  const overlay = $('#overlay');
  const dialogue = $('#dialogue');
  const dlgName = $('#dlgName');
  const dlgText = $('#dlgText');
  let active = false;
  let dialogueResolve = null;
  let selected = 0;
  let menuItems = [];
  let menuResolve = null;
  let menuCleanup = null;

  function setText(el, value) { el.textContent = value == null ? '' : String(value); }
  function dismissDialogue() {
    if (!dialogueResolve) return;
    const resolve = dialogueResolve;
    dialogueResolve = null;
    dialogue.classList.add('hidden');
    active = false;
    resolve();
  }
  function onDialogueKey(event) {
    if (!dialogueResolve || !['Enter', ' ', 'z', 'Z'].includes(event.key)) return;
    event.preventDefault();
    event.stopPropagation();
    dismissDialogue();
  }
  document.addEventListener('keydown', onDialogueKey, true);
  dialogue?.addEventListener('click', dismissDialogue);

  function say(text, name = '') {
    if (!dialogue) return Promise.resolve();
    if (dialogueResolve) dismissDialogue();
    active = true;
    setText(dlgName, name);
    setText(dlgText, text);
    dialogue.classList.remove('hidden');
    return new Promise(resolve => { dialogueResolve = resolve; });
  }

  function finishMenu(result) {
    if (!menuResolve) return;
    const resolve = menuResolve;
    menuResolve = null;
    if (menuCleanup) menuCleanup();
    menuCleanup = null;
    if (overlay) {
      overlay.replaceChildren();
      overlay.classList.remove('visible');
    }
    active = false;
    resolve(result);
  }
  function paintSelection() {
    const rows = overlay?.querySelectorAll('[data-menu-index]') || [];
    rows.forEach((row, i) => {
      row.classList.toggle('selected', i === selected);
      row.setAttribute('aria-selected', i === selected ? 'true' : 'false');
    });
  }
  function menuKey(event) {
    if (!menuResolve) return;
    if (event.key === 'ArrowDown' || event.key.toLowerCase() === 's') {
      event.preventDefault(); event.stopPropagation();
      if (menuItems.length) selected = (selected + 1) % menuItems.length;
      paintSelection();
    } else if (event.key === 'ArrowUp' || event.key.toLowerCase() === 'w') {
      event.preventDefault(); event.stopPropagation();
      if (menuItems.length) selected = (selected + menuItems.length - 1) % menuItems.length;
      paintSelection();
    } else if (['Enter', ' ', 'z', 'Z'].includes(event.key)) {
      event.preventDefault(); event.stopPropagation();
      const item = menuItems[selected];
      if (item && !item.disabled) finishMenu(item.value ?? item.label);
    } else if (event.key === 'Escape' || event.key.toLowerCase() === 'x') {
      event.preventDefault(); event.stopPropagation(); finishMenu(null);
    }
  }
  function menu(title, entries, options = {}) {
    if (!overlay) return Promise.resolve(null);
    if (menuResolve) finishMenu(null);
    if (dialogueResolve) dismissDialogue();
    active = true;
    menuItems = (entries || []).map(entry => typeof entry === 'string' ? { label: entry, value: entry } : entry);
    selected = Math.max(0, Math.min(options.selected || 0, Math.max(0, menuItems.length - 1)));
    const panel = document.createElement('section');
    panel.className = `menu-window${options.layout ? ` menu-${options.layout}` : ''}`;
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-label', String(title || 'Menu'));
    const heading = document.createElement('h2');
    heading.className = 'menu-title';
    setText(heading, title);
    panel.append(heading);
    if (options.description) {
      const description = document.createElement('p');
      description.className = 'menu-description';
      setText(description, options.description);
      panel.append(description);
    }
    const list = document.createElement('div');
    list.className = 'menu-list';
    menuItems.forEach((item, index) => {
      const row = document.createElement('button');
      row.type = 'button';
      row.className = `menu-option${item.sprite ? ' starter-choice' : ''}`;
      row.dataset.menuIndex = String(index);
      row.disabled = !!item.disabled;
      if (item.sprite && typeof creatureCanvas === 'function') {
        const sprite = document.createElement('canvas');
        sprite.className = 'starter-sprite';
        sprite.width = 96;
        sprite.height = 96;
        sprite.setAttribute('aria-hidden', 'true');
        const spriteCtx = sprite.getContext('2d');
        const source = creatureCanvas(item.sprite);
        if (source && spriteCtx) {
          spriteCtx.imageSmoothingEnabled = false;
          spriteCtx.drawImage(source, 0, 0, sprite.width, sprite.height);
        }
        const copy = document.createElement('span');
        copy.className = 'starter-copy';
        const name = document.createElement('strong');
        name.className = 'starter-label';
        setText(name, item.label);
        const detail = document.createElement('small');
        detail.className = 'starter-detail';
        setText(detail, item.detail || '');
        copy.append(name, detail);
        row.append(sprite, copy);
        row.setAttribute('aria-label', `${item.label}${item.detail ? `, ${item.detail}` : ''}`);
      } else {
        setText(row, item.label);
      }
      row.addEventListener('click', () => {
        selected = index; paintSelection();
        if (!row.disabled) finishMenu(item.value ?? item.label);
      });
      list.append(row);
    });
    panel.append(list);
    if (options.footer) {
      const footer = document.createElement('small');
      footer.className = 'menu-footer';
      setText(footer, options.footer);
      panel.append(footer);
    }
    overlay.replaceChildren(panel);
    overlay.classList.add('visible');
    paintSelection();
    document.addEventListener('keydown', menuKey, true);
    menuCleanup = () => document.removeEventListener('keydown', menuKey, true);
    return new Promise(resolve => { menuResolve = resolve; });
  }

  function close() {
    if (dialogueResolve) dismissDialogue();
    if (menuResolve) finishMenu(null);
  }
  function updateHud(location, party) {
    const loc = $('#location');
    const partyHud = $('#partyHud');
    if (loc && location != null) setText(loc, location);
    if (partyHud && Array.isArray(party)) {
      partyHud.replaceChildren(...party.map(mon => {
        const chip = document.createElement('span');
        chip.className = 'party-chip';
        setText(chip, `${mon.name || mon.species || 'Pokémon'} · ${Math.max(0, mon.hp ?? 0)}/${mon.maxHp ?? mon.hp ?? 0}`);
        return chip;
      }));
    }
  }
  return { get active() { return active; }, say, menu, close, updateHud };
})();
