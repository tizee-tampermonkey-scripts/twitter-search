// ==UserScript==
// @name         Twitter/X 自定义搜索构建器
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  通过图形界面构建 Twitter/X 的高级搜索字符串，并自动填充到搜索框。
// @author       tizee
// @match        https://twitter.com/*
// @match        https://x.com/*
// @grant        GM_addStyle
// @run-at       document-idle
// ==/UserScript==

(function() {
    'use strict';

    // --- 样式定义 ---
    // 使用 GM_addStyle 添加 CSS，确保样式不会与页面冲突
    GM_addStyle(`
        #search-builder-container {
            position: fixed;
            top: 100px;
            left: 20px;
            background-color: #1a1a1a;
            border: 1px solid #333;
            border-radius: 12px;
            padding: 20px;
            z-index: 9999;
            color: #e8e8e8;
            font-family: sans-serif;
            width: 350px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.4);
            user-select: none;
        }
        #search-builder-header {
            cursor: move;
            padding-bottom: 10px;
            border-bottom: 1px solid #333;
            margin-bottom: 15px;
        }
        #search-builder-header h3 {
            margin: 0;
            font-size: 16px;
            color: #fff;
            font-weight: bold;
        }
        .search-builder-row {
            display: flex;
            align-items: center;
            margin-bottom: 12px;
        }
        .search-builder-row label {
            width: 120px;
            font-size: 14px;
        }
        .search-builder-row input[type="text"],
        .search-builder-row input[type="date"],
        .search-builder-row input[type="number"] {
            flex-grow: 1;
            background-color: #2a2a2a;
            border: 1px solid #444;
            border-radius: 4px;
            color: #e8e8e8;
            padding: 6px 8px;
            font-size: 14px;
        }
        .search-builder-buttons {
            display: flex;
            justify-content: space-between;
            margin-top: 20px;
            padding-top: 15px;
            border-top: 1px solid #333;
        }
        .search-builder-buttons button {
            padding: 8px 16px;
            border: none;
            border-radius: 20px;
            cursor: pointer;
            font-weight: bold;
            font-size: 14px;
        }
        #generate-search-btn {
            background-color: #1d9bf0;
            color: white;
        }
        #clear-search-btn {
            background-color: #3a3a3a;
            color: #e8e8e8;
        }
    `);

    // --- UI 界面 HTML ---
    const builderHtml = `
        <div id="search-builder-container">
            <div id="search-builder-header">
                <h3>自定义搜索构建器</h3>
            </div>
            <div id="search-builder-form">
                <div class="search-builder-row">
                    <label for="sb-exact-phrase">精确短语</label>
                    <input type="text" id="sb-exact-phrase" placeholder="例如：人工智能的未来">
                </div>
                <div class="search-builder-row">
                    <label for="sb-any-words">包含任一词</label>
                    <input type="text" id="sb-any-words" placeholder="词语用 OR 分隔，如 苹果 OR 谷歌">
                </div>
                <div class="search-builder-row">
                    <label for="sb-exclude-word">排除该词</label>
                    <input type="text" id="sb-exclude-word" placeholder="例如：水果">
                </div>
                <div class="search-builder-row">
                    <label for="sb-from-user">来自用户</label>
                    <input type="text" id="sb-from-user" placeholder="不含 @，例如 x">
                </div>
                <div class="search-builder-row">
                    <label for="sb-since-date">始于日期</label>
                    <input type="date" id="sb-since-date">
                </div>
                <div class="search-builder-row">
                    <label for="sb-until-date">止于日期</label>
                    <input type="date" id="sb-until-date">
                </div>
                <div class="search-builder-row">
                    <label>筛选媒介</label>
                    <div>
                        <input type="checkbox" id="sb-filter-links"> <label for="sb-filter-links">含链接</label>
                        <input type="checkbox" id="sb-filter-media" style="margin-left: 10px;"> <label for="sb-filter-media">含媒体</label>
                    </div>
                </div>
                <div class="search-builder-buttons">
                    <button id="clear-search-btn">清空</button>
                    <button id="generate-search-btn">生成并搜索</button>
                </div>
            </div>
        </div>
    `;

    // --- 将 UI 添加到页面 ---
    document.body.insertAdjacentHTML('beforeend', builderHtml);

    const container = document.getElementById('search-builder-container');
    const header = document.getElementById('search-builder-header');

    // --- 实现窗口拖动 ---
    let isDragging = false;
    let offsetX, offsetY;

    header.addEventListener('mousedown', (e) => {
        isDragging = true;
        offsetX = e.clientX - container.offsetLeft;
        offsetY = e.clientY - container.offsetTop;
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    });

    function onMouseMove(e) {
        if (!isDragging) return;
        container.style.left = `${e.clientX - offsetX}px`;
        container.style.top = `${e.clientY - offsetY}px`;
    }

    function onMouseUp() {
        isDragging = false;
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
    }

    // --- 核心逻辑 ---

    /**
     * 构建搜索字符串
     * @returns {string} - 组合好的搜索字符串
     */
    function buildSearchString() {
        const parts = [];

        const exactPhrase = document.getElementById('sb-exact-phrase').value.trim();
        if (exactPhrase) parts.push(`"${exactPhrase}"`);

        const anyWords = document.getElementById('sb-any-words').value.trim();
        if (anyWords) parts.push(`(${anyWords})`);

        const excludeWord = document.getElementById('sb-exclude-word').value.trim();
        if (excludeWord) parts.push(`-${excludeWord}`);

        const fromUser = document.getElementById('sb-from-user').value.trim();
        if (fromUser) parts.push(`from:${fromUser}`);

        const sinceDate = document.getElementById('sb-since-date').value;
        if (sinceDate) parts.push(`since:${sinceDate}`);

        const untilDate = document.getElementById('sb-until-date').value;
        if (untilDate) parts.push(`until:${untilDate}`);

        if (document.getElementById('sb-filter-links').checked) parts.push('filter:links');
        if (document.getElementById('sb-filter-media').checked) parts.push('filter:media');

        return parts.join(' ');
    }

    /**
     * 执行搜索（存根部分）
     * @param {string} searchString - 要执行搜索的字符串
     */
    function performSearch(searchString) {
        /******************************************************************
         *
         * STUB - 存根开始
         *
         * 你需要在这里实现具体的逻辑，来与 Twitter/X 的搜索框交互。
         * 大致的步骤如下：
         *
         * 1. 找到搜索框元素。Twitter 的界面是动态生成的，类名可能会变化。
         * 一个比较稳妥的方式是使用 `data-testid` 属性，例如：
         * const searchInput = document.querySelector('input[data-testid="SearchBox_Search_Input"]');
         * 你需要使用浏览器的开发者工具检查当前页面，确认这个选择器是否正确。
         *
         * 2. 将 `searchString` 填入搜索框。
         * if (searchInput) {
         * searchInput.value = searchString;
         * // 模拟输入事件，某些框架需要这个来更新内部状态
         * searchInput.dispatchEvent(new Event('input', { bubbles: true }));
         * }
         *
         * 3. （可选）触发搜索。你可以跳转到搜索结果页：
         * window.location.href = `https://twitter.com/search?q=${encodeURIComponent(searchString)}&src=typed_query`;
         * 或者，如果已经在搜索页，模拟按下回车键。
         *
         ******************************************************************/

        console.log("生成的搜索字符串:", searchString);
        console.log("请替换 'performSearch' 函数中的存根代码。");

        // 示例：直接跳转到搜索结果页（最简单可靠的方式）
        if (searchString) {
             window.location.href = `https://twitter.com/search?q=${encodeURIComponent(searchString)}&src=typed_query`;
        }
    }

    // --- 按钮事件监听 ---
    document.getElementById('generate-search-btn').addEventListener('click', () => {
        const searchString = buildSearchString();
        performSearch(searchString);
    });

    document.getElementById('clear-search-btn').addEventListener('click', () => {
        document.getElementById('search-builder-form').reset();
    });

})();
