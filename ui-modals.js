(function(){
  // Simple UI modals/toast helper for non-module pages
  function ensureContainer() {
    let c = document.getElementById('ui-modals-root');
    if (!c) {
      c = document.createElement('div');
      c.id = 'ui-modals-root';
      document.body.appendChild(c);
      const style = document.createElement('style');
      style.innerHTML = `
        .ui-toast { position: fixed; right: 20px; bottom: 20px; min-width: 260px; background: #111827; color: #fff; padding: 12px 16px; border-radius: 8px; box-shadow: 0 6px 18px rgba(2,6,23,0.6); z-index: 9999; font-family: Inter, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial; }
        .ui-toast.info { background: #111827; }
        .ui-toast.success { background: #059669; }
        .ui-toast.error { background: #dc2626; }
        .ui-modal-backdrop { position: fixed; inset: 0; background: rgba(3,7,18,0.6); display:flex; align-items:center; justify-content:center; z-index:10000; }
        .ui-modal { background: #0f1724; color: #fff; padding: 20px; border-radius: 10px; width: 460px; max-width: calc(100% - 40px); box-shadow: 0 10px 30px rgba(2,6,23,0.7); }
        .ui-modal .ui-modal-actions { display:flex; gap:8px; justify-content:flex-end; margin-top:16px; }
        .ui-modal .btn { padding:8px 12px; border-radius:8px; font-weight:600; border:0; cursor:pointer; }
        .ui-modal .btn.secondary { background:#374151; color:#fff; }
        .ui-modal .btn.danger { background:#dc2626; color:#fff; }
        .ui-modal .btn.primary { background:#06b6d4; color:#04202a; }
      `;
      document.head.appendChild(style);
    }
    return c;
  }

  window.showAlert = function(message, type){
    // type: 'info'|'success'|'error'
    const container = ensureContainer();
    const toast = document.createElement('div');
    toast.className = 'ui-toast ' + (type || 'info');
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(()=>{
      try { toast.remove(); } catch(e){}
    }, 3800);
    return Promise.resolve();
  };

  window.showConfirm = function(options){
    // options: { title, message, okText, cancelText }
    return new Promise((resolve)=>{
      ensureContainer();
      const backdrop = document.createElement('div');
      backdrop.className = 'ui-modal-backdrop';
      const modal = document.createElement('div');
      modal.className = 'ui-modal';
      const title = document.createElement('div');
      title.style.fontSize = '18px';
      title.style.fontWeight = '700';
      title.style.marginBottom = '8px';
      title.textContent = options && options.title ? options.title : 'Confirm';
      const msg = document.createElement('div');
      msg.style.color = '#cbd5e1';
      msg.innerHTML = options && options.message ? options.message : '';
      const actions = document.createElement('div');
      actions.className = 'ui-modal-actions';
      const btnCancel = document.createElement('button');
      btnCancel.className = 'btn secondary';
      btnCancel.textContent = (options && options.cancelText) || 'Cancel';
      const btnOk = document.createElement('button');
      btnOk.className = 'btn danger';
      btnOk.textContent = (options && options.okText) || 'OK';

      btnCancel.onclick = () => { backdrop.remove(); resolve(false); };
      btnOk.onclick = () => { backdrop.remove(); resolve(true); };

      actions.appendChild(btnCancel);
      actions.appendChild(btnOk);
      modal.appendChild(title);
      modal.appendChild(msg);
      modal.appendChild(actions);
      backdrop.appendChild(modal);
      document.body.appendChild(backdrop);
    });
  };

})();
