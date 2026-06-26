(function (PLUGIN_ID) {
    'use strict';

    // 許可する URL スキーム（javascript: 等を排除）
    const ALLOWED_SCHEME = 'https://';
    const LABEL = 'NotebookLMで開く';
    const INACTIVE_LABEL = '未連携';
    const NO_TITLE_LABEL = '(タイトル未設定)';

    // プラグイン設定からカード配列 [{title, url}, ...] を取得する。
    function getCards() {
        const config = kintone.plugin.app.getConfig(PLUGIN_ID) || {};
        if (!config.cards) return [];
        try {
            const arr = JSON.parse(config.cards);
            return Array.isArray(arr) ? arr : [];
        } catch (e) {
            return [];
        }
    }

    function isValidUrl(url) {
        return typeof url === 'string' && url.indexOf(ALLOWED_SCHEME) === 0;
    }

    function createButton(url) {
        const a = document.createElement('a');
        a.className = 'notebook-btn';

        const icon = document.createElement('span');
        icon.className = 'notebook-icon';
        a.appendChild(icon);

        const label = document.createElement('span');
        label.className = 'notebook-label';

        if (isValidUrl(url)) {
            label.textContent = LABEL;
            a.href = url;
            a.target = '_blank';
            a.rel = 'noopener noreferrer';
            a.classList.add('notebook-cell-btn');
        } else {
            label.textContent = INACTIVE_LABEL;
            a.classList.add('notebook-btn-inactive');
        }
        a.appendChild(label);
        return a;
    }

    function createCard(card) {
        const el = document.createElement('div');
        el.className = 'notebook-card';

        const title = document.createElement('div');
        title.className = 'notebook-card-title';
        const t = card && card.title ? String(card.title).trim() : '';
        title.textContent = t || NO_TITLE_LABEL;
        el.appendChild(title);

        el.appendChild(createButton(card && card.url ? String(card.url) : ''));
        return el;
    }

    // ヘッダースペースにカード一覧を描画する。再表示でも冪等。
    function render(container) {
        if (!container) return;

        const existing = container.querySelector('.notebook-card-list');
        if (existing) existing.remove();

        const cards = getCards();
        if (!cards.length) return;

        const list = document.createElement('div');
        list.className = 'notebook-card-list';
        cards.forEach(function (card) {
            list.appendChild(createCard(card));
        });
        container.appendChild(list);
    }

    // List View (PC)
    kintone.events.on('app.record.index.show', function (event) {
        render(kintone.app.getHeaderSpaceElement());
        return event;
    });

    // List View (Mobile)
    kintone.events.on('mobile.app.record.index.show', function (event) {
        render(kintone.mobile.app.getHeaderSpaceElement());
        return event;
    });

})(kintone.$PLUGIN_ID);
