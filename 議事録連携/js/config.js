(function (PLUGIN_ID) {
    'use strict';

    const ALLOWED_SCHEME = 'https://';

    const rowsContainer = document.getElementById('card-rows');
    const template = document.getElementById('row-template');
    const addBtn = document.getElementById('add-row');
    const saveBtn = document.getElementById('save');
    const cancelBtn = document.getElementById('cancel');

    // 入力行を1つ追加する。
    function addRow(title, url) {
        const fragment = template.content.cloneNode(true);
        const row = fragment.querySelector('.card-row');
        row.querySelector('.row-title').value = title || '';
        row.querySelector('.row-url').value = url || '';
        row.querySelector('.row-remove').addEventListener('click', function () {
            row.remove();
        });
        rowsContainer.appendChild(row);
    }

    // 保存済み設定を読み込み、行を復元する。無ければ空行を1つ表示。
    function loadConfig() {
        const config = kintone.plugin.app.getConfig(PLUGIN_ID) || {};
        let cards = [];
        if (config.cards) {
            try {
                cards = JSON.parse(config.cards);
            } catch (e) {
                cards = [];
            }
        }
        if (!Array.isArray(cards) || cards.length === 0) {
            addRow('', '');
        } else {
            cards.forEach(function (card) {
                addRow(card.title, card.url);
            });
        }
    }

    addBtn.addEventListener('click', function () {
        addRow('', '');
    });

    cancelBtn.addEventListener('click', function () {
        history.back();
    });

    saveBtn.addEventListener('click', function () {
        const rows = rowsContainer.querySelectorAll('.card-row');
        const cards = [];

        for (let i = 0; i < rows.length; i++) {
            const title = rows[i].querySelector('.row-title').value.trim();
            const url = rows[i].querySelector('.row-url').value.trim();

            // 完全に空の行はスキップ
            if (!title && !url) continue;

            if (url && url.indexOf(ALLOWED_SCHEME) !== 0) {
                alert('URL は https:// で始まる必要があります。\n該当カード: ' + (title || '(タイトル未設定)'));
                return;
            }
            cards.push({ title: title, url: url });
        }

        kintone.plugin.app.setConfig({ cards: JSON.stringify(cards) }, function () {
            alert('保存しました。設定を反映するにはアプリを更新してください。');
            window.location.href = '../../flow?app=' + kintone.app.getId();
        });
    });

    loadConfig();

})(kintone.$PLUGIN_ID);
