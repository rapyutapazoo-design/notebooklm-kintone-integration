(function () {
    'use strict';

    // ==========================================
    //  CONFIG — このオブジェクトだけ書き換えれば
    //  他アプリへも流用できます。
    // ==========================================
    const CONFIG = {
        // NotebookLM の URL を格納するリンクフィールドのフィールドコード
        fieldCode: 'notebook_url',
        // カードの見出しに使うフィールドコード（規約タイトル）
        titleFieldCode: 'title',
        // ボタンに表示する文言
        label: 'NotebookLMで開く',
        // URL 未登録レコードに表示する文言
        inactiveLabel: '未連携',
        // タイトル未入力レコードに表示する文言
        noTitleLabel: '(タイトル未設定)',
        // 許可する URL スキーム（これ以外は無効なリンク扱い）
        allowedScheme: 'https://',
        // カスタマイズビューに配置する HTML 要素の id
        // （一覧ビューの「表示形式: カスタマイズ」の HTML に
        //   <div id="notebook-card-list"></div> を記述）
        cardContainerId: 'notebook-card-list',
    };

    // ==========================================
    //  Events
    // ==========================================
    const EVENTS_LIST_PC = ['app.record.index.show'];
    const EVENTS_DETAIL_PC = ['app.record.detail.show'];
    const EVENTS_LIST_MOBILE = ['mobile.app.record.index.show'];
    const EVENTS_DETAIL_MOBILE = ['mobile.app.record.detail.show'];

    // ==========================================
    //  List View — Card UI (PC / Mobile 共通)
    // ==========================================

    // List View (PC)
    kintone.events.on(EVENTS_LIST_PC, function (event) {
        renderCardList(getCardContainer(false), event.records);
        return event;
    });

    // List View (Mobile)
    kintone.events.on(EVENTS_LIST_MOBILE, function (event) {
        renderCardList(getCardContainer(true), event.records);
        return event;
    });

    // ==========================================
    //  Detail View（現状維持）
    // ==========================================

    // Detail View (PC)
    kintone.events.on(EVENTS_DETAIL_PC, function (event) {
        const url = getUrl(event.record);
        if (!isValidUrl(url)) return event;

        const headerSpace = kintone.app.record.getHeaderMenuSpaceElement();
        if (!headerSpace || headerSpace.querySelector('.notebook-header-btn')) return event;

        const button = createNotebookButton(url);
        button.classList.add('notebook-header-btn');
        headerSpace.appendChild(button);
        return event;
    });

    // Detail View (Mobile)
    kintone.events.on(EVENTS_DETAIL_MOBILE, function (event) {
        const url = getUrl(event.record);
        if (!isValidUrl(url)) return event;

        const fieldEl = kintone.mobile.app.record.getFieldElement(CONFIG.fieldCode);
        if (!fieldEl || fieldEl.querySelector('.notebook-btn')) return event;

        const container = document.createElement('div');
        container.className = 'notebook-mobile-detail';
        container.appendChild(createNotebookButton(url));
        fieldEl.appendChild(container);
        return event;
    });

    // ==========================================
    //  Card List Logic
    // ==========================================

    // カードを差し込む先の要素を取得する。
    // 第一候補はカスタマイズビューの専用要素。未設定の環境では
    // ヘッダースペースにフォールバックする（READMEの設定を推奨）。
    function getCardContainer(mobile) {
        const custom = document.getElementById(CONFIG.cardContainerId);
        if (custom) return custom;
        return mobile
            ? kintone.mobile.app.getHeaderSpaceElement()
            : kintone.app.getHeaderSpaceElement();
    }

    // レコード全件をカードとして描画する。
    // 再描画（再表示・並べ替え）でも冪等になるよう、既存のカード一覧を作り直す。
    function renderCardList(container, records) {
        if (!container) return;

        const existing = container.querySelector('.notebook-card-list');
        if (existing) existing.remove();

        const list = document.createElement('div');
        list.className = 'notebook-card-list';
        records.forEach(function (record) {
            list.appendChild(createCard(record));
        });
        container.appendChild(list);
    }

    // 1レコード = 1カード（規約タイトル + ボタン）。
    function createCard(record) {
        const url = getUrl(record);

        const card = document.createElement('div');
        card.className = 'notebook-card';

        const title = document.createElement('div');
        title.className = 'notebook-card-title';
        title.textContent = getTitle(record) || CONFIG.noTitleLabel;
        card.appendChild(title);

        const button = createNotebookButton(url);
        if (isValidUrl(url)) {
            button.classList.add('notebook-cell-btn');
        } else {
            button.classList.add('notebook-btn-inactive');
            button.querySelector('.notebook-label').textContent = CONFIG.inactiveLabel;
        }
        card.appendChild(button);

        return card;
    }

    // ==========================================
    //  Shared Helpers
    // ==========================================

    // ボタン要素（<a>）を生成する。有効な URL のときだけ href を設定する。
    function createNotebookButton(url) {
        const button = document.createElement('a');
        button.className = 'notebook-btn';

        const icon = document.createElement('span');
        icon.className = 'notebook-icon';
        button.appendChild(icon);

        const text = document.createElement('span');
        text.className = 'notebook-label';
        text.textContent = CONFIG.label;
        button.appendChild(text);

        if (isValidUrl(url)) {
            button.href = url;
            button.target = '_blank';
            button.rel = 'noopener noreferrer';
        }
        return button;
    }

    function getUrl(record) {
        return getValue(record, CONFIG.fieldCode);
    }

    function getTitle(record) {
        return getValue(record, CONFIG.titleFieldCode);
    }

    function getValue(record, fieldCode) {
        const field = record && record[fieldCode];
        return (field && field.value) ? String(field.value) : '';
    }

    // javascript: 等の危険なスキームを排除し、許可スキームのみ有効とする。
    function isValidUrl(url) {
        return typeof url === 'string' && url.indexOf(CONFIG.allowedScheme) === 0;
    }

})();
