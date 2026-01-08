/* global IDS */
(() => {
    const ids = Array.isArray(window.IDS) ? window.IDS : [];
    const total = ids.length;

    // UI elements
    const elTotalIds   = document.getElementById('totalIds');
    const elCurrentPos = document.getElementById('currentPos');
    const elTotalPos   = document.getElementById('totalPos');
    const elOrderLabel = document.getElementById('orderLabel');
    const elIdValue    = document.getElementById('idValue');
    const elStatus     = document.getElementById('statusText');

    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const copyBtn = document.getElementById('copyBtn');

    const jumpInput = document.getElementById('jumpInput');
    const jumpBtn   = document.getElementById('jumpBtn');
    const maxHint   = document.getElementById('maxHint');

    // "Last copied" block (optional, but recommended in HTML)
    const elLastCopiedWrap  = document.getElementById('lastCopiedWrap');
    const elLastCopiedId    = document.getElementById('lastCopiedId');
    const elLastCopiedOrder = document.getElementById('lastCopiedOrder');

    let idx = 0;

    function clamp(n, min, max) {
        return Math.max(min, Math.min(max, n));
    }

    function setStatus(msg, ok = true) {
        if (!elStatus) return;
        elStatus.textContent = msg;
        elStatus.style.color = ok ? 'rgba(0,0,0,.55)' : '#b00020';

        window.clearTimeout(setStatus._t);
        setStatus._t = window.setTimeout(() => {
            elStatus.textContent = 'Tayyor ✅';
            elStatus.style.color = 'rgba(0,0,0,.55)';
        }, 1400);
    }

    function setLastCopied(order, value) {
        // If HTML doesn't have these elements, don't crash
        if (!elLastCopiedWrap || !elLastCopiedId) return;

        if (elLastCopiedOrder) elLastCopiedOrder.textContent = String(order); // ✅ order
        elLastCopiedId.textContent = String(value);                            // ✅ id
        elLastCopiedWrap.style.display = 'block';
    }

    function render() {
        if (elTotalIds) elTotalIds.textContent = String(total);
        if (elCurrentPos) elCurrentPos.textContent = total ? String(idx + 1) : '0';
        if (elTotalPos) elTotalPos.textContent = String(total);

        if (elOrderLabel) elOrderLabel.textContent = total ? `${idx + 1}-ID` : '—';
        if (elIdValue) elIdValue.textContent = total ? (ids[idx] ?? '—') : 'IDs yo‘q';

        if (prevBtn) prevBtn.disabled = idx === 0 || total === 0;
        if (nextBtn) nextBtn.disabled = idx === total - 1 || total === 0;

        // keep jump input sane
        if (jumpInput) jumpInput.max = String(total);
        if (maxHint) maxHint.textContent = String(total);
    }

    function go(delta) {
        if (!total) return;
        idx = clamp(idx + delta, 0, total - 1);
        render();
    }

    function jumpToOrder(orderNumber) {
        if (!total) return;

        const n = Number(orderNumber);
        if (!Number.isFinite(n)) {
            setStatus('Tartib raqami noto‘g‘ri 😅', false);
            return;
        }

        const clamped = clamp(Math.trunc(n), 1, total);
        idx = clamped - 1;

        render();
        setStatus(`O‘tildi: ${clamped}/${total} ✅`);
    }

    async function copyCurrent() {
        const value = ids[idx];
        if (!value) {
            setStatus('ID topilmadi', false);
            return;
        }

        const order = idx + 1;

        try {
            await navigator.clipboard.writeText(String(value));
            setLastCopied(order, value); // ✅ order + id
            setStatus('Nusxa olindi 📋✅');
        } catch (e) {
            // fallback
            const ta = document.createElement('textarea');
            ta.value = String(value);
            ta.style.position = 'fixed';
            ta.style.left = '-9999px';
            document.body.appendChild(ta);
            ta.select();

            try {
                document.execCommand('copy');
                setLastCopied(order, value); // ✅ order + id
                setStatus('Nusxa olindi 📋✅');
            } catch (_) {
                setStatus('Copy ishlamadi. Brauzer ruxsat bermadi 😬', false);
            } finally {
                document.body.removeChild(ta);
            }
        }
    }

    // events
    if (prevBtn) prevBtn.addEventListener('click', () => go(-1));
    if (nextBtn) nextBtn.addEventListener('click', () => go(1));
    if (copyBtn) copyBtn.addEventListener('click', copyCurrent);

    if (jumpBtn) jumpBtn.addEventListener('click', () => jumpToOrder(jumpInput?.value));
    if (jumpInput) {
        jumpInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') jumpToOrder(jumpInput.value);
        });
    }

    window.addEventListener('keydown', (e) => {
        // don't hijack when typing in inputs
        const tag = document.activeElement?.tagName?.toLowerCase() || '';
        if (tag === 'input' || tag === 'textarea') return;

        if (e.key === 'ArrowLeft') go(-1);
        if (e.key === 'ArrowRight') go(1);
    });

    // init
    if (total === 0) {
        if (elTotalIds) elTotalIds.textContent = '0';
        if (elCurrentPos) elCurrentPos.textContent = '0';
        if (elTotalPos) elTotalPos.textContent = '0';
        if (elOrderLabel) elOrderLabel.textContent = '—';
        if (elIdValue) elIdValue.textContent = 'IDs yo‘q';
        setStatus('IDS ro‘yxati topilmadi', false);
        return;
    }

    render();
})();
